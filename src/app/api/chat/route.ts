import { google } from '@ai-sdk/google';
import { streamText, createAgentUIStreamResponse } from 'ai';
import { myAgent } from '@/lib/agent';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const url = new URL(req.url);
    const urlChatId = url.searchParams.get('chatId');
    const bodyJson = await req.json();
    const { messages, chatId: bodyChatId } = bodyJson;
    console.log("INCOMING MESSAGES", JSON.stringify(messages, null, 2));
    
    let currentConversationId = urlChatId || bodyChatId;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Messages are required', { status: 400 });
    }


    const latestMessage = messages[messages.length - 1];
    
    // Extract content from either content field or parts array (AI SDK v7 format)
    const messageContent = latestMessage.content || 
      (latestMessage.parts ? latestMessage.parts.map((p: any) => p.text || '').join('') : '');

    // If no conversationId is provided, this is a new chat
    if (!currentConversationId) {
      const title = messageContent.substring(0, 50) + (messageContent.length > 50 ? '...' : '');
      const conversation = await prisma.conversation.create({
        data: {
          userId,
          title,
        },
      });
      currentConversationId = conversation.id;
    }

    // Save user message to database
    await prisma.message.create({
      data: {
        conversationId: currentConversationId,
        role: latestMessage.role,
        content: messageContent,
        parts: latestMessage.experimental_attachments ? JSON.stringify(latestMessage.experimental_attachments) : null,
      }
    });

    // Ensure UI messages conform to the expected format
    const formattedMessages = messages.map((m: any) => {
      let parts = m.parts || [];
      if (parts.length === 0 && m.content) {
        parts = [{ type: 'text', text: m.content }];
      }
      if (m.experimental_attachments && m.experimental_attachments.length > 0) {
        m.experimental_attachments.forEach((att: any) => {
          parts.push({ type: 'image', image: att.url });
        });
      }
      return {
        id: m.id || crypto.randomUUID(),
        role: m.role,
        content: m.content || "",
        parts: parts,
        experimental_attachments: m.experimental_attachments,
        ...(m.toolInvocations && { toolInvocations: m.toolInvocations })
      };
    });
    
    console.log("FORMATTED MESSAGES", JSON.stringify(formattedMessages, null, 2));

    // Call the Vercel AI SDK with ToolLoopAgent
    const response = await createAgentUIStreamResponse({
      agent: myAgent,
      uiMessages: formattedMessages,
      async onEnd({ responseMessage }) {
        // Save the assistant's response to the database
        const textParts = responseMessage?.parts?.filter((p: any) => p.type === 'text') || [];
        const content = textParts.map((p: any) => p.text).join('');
        
        if (content || (responseMessage?.parts && responseMessage.parts.length > 0)) {
          await prisma.message.create({
            data: {
              conversationId: currentConversationId!,
              role: 'assistant',
              content: content,
              parts: responseMessage?.parts ? JSON.stringify(responseMessage.parts) : null,
            }
          });
        }
      }
    });

    // Set the conversation ID header
    response.headers.set('x-conversation-id', currentConversationId!);
    
    return response;
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
