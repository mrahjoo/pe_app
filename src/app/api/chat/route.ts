import { createAgentUIStreamResponse } from 'ai';
import { myAgent } from '@/lib/agent';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

type ChatMessagePart =
  | { type: 'text'; text: string }
  | { type: 'file'; mediaType: string; url: string; filename?: string };

type ChatMessageLike = {
  id?: string;
  role?: string;
  content?: string;
  parts?: unknown;
  toolInvocations?: unknown[];
};

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


    const latestMessage = messages[messages.length - 1] as ChatMessageLike;

    const extractTextContent = (message: ChatMessageLike): string => {
      const content = typeof message.content === 'string' ? message.content : '';
      if (content) {
        return content;
      }

      const rawParts = Array.isArray(message.parts) ? message.parts : [];
      return rawParts
        .filter((part): part is Record<string, unknown> => typeof part === 'object' && part !== null)
        .filter((part) => part.type === 'text')
        .map((part) => (typeof part.text === 'string' ? part.text : ''))
        .join('');
    };

    const messageContent = extractTextContent(latestMessage);

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

    const safeParts: ChatMessagePart[] = Array.isArray(latestMessage.parts)
      ? (() => {
          const normalized: ChatMessagePart[] = [];
          for (const part of latestMessage.parts as unknown[]) {
            const candidate = part as Record<string, unknown>;

            if (candidate.type === 'text' && typeof candidate.text === 'string') {
              normalized.push({ type: 'text', text: candidate.text });
              continue;
            }

            if (candidate.type === 'file' && typeof candidate.url === 'string') {
              normalized.push({
                type: 'file',
                mediaType: typeof candidate.mediaType === 'string' ? candidate.mediaType : 'image/jpeg',
                url: candidate.url,
                ...(typeof candidate.filename === 'string' ? { filename: candidate.filename } : {}),
              });
            }
          }
          return normalized;
        })()
      : [{ type: 'text', text: messageContent }];

    // Save user message to database
    await prisma.message.create({
      data: {
        conversationId: currentConversationId,
        role: typeof latestMessage.role === 'string' ? latestMessage.role : 'user',
        content: messageContent,
        parts: JSON.stringify(safeParts),
      }
    });

    const normalizeMessage = (message: ChatMessageLike) => {
      const rawParts = Array.isArray(message.parts) ? (message.parts as unknown[]) : [];
      const normalizedParts: ChatMessagePart[] = [];

      for (const part of rawParts) {
        const candidate = part as Record<string, unknown>;

        if (candidate.type === 'text' && typeof candidate.text === 'string') {
          normalizedParts.push({ type: 'text', text: candidate.text });
          continue;
        }

        if (candidate.type === 'file' && typeof candidate.url === 'string') {
          normalizedParts.push({
            type: 'file',
            mediaType: typeof candidate.mediaType === 'string' ? candidate.mediaType : 'image/jpeg',
            url: candidate.url,
            ...(typeof candidate.filename === 'string' ? { filename: candidate.filename } : {}),
          });
        }
      }

      const content = typeof message.content === 'string' ? message.content : '';
      const textContent = content || normalizedParts
        .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
        .map((part) => part.text)
        .join('');

      return {
        id: typeof message.id === 'string' ? message.id : crypto.randomUUID(),
        role: typeof message.role === 'string' ? message.role : 'user',
        content: textContent,
        parts: normalizedParts.length > 0 ? normalizedParts : (textContent ? [{ type: 'text' as const, text: textContent }] : []),
        ...(Array.isArray(message.toolInvocations) ? { toolInvocations: message.toolInvocations } : {}),
      };
    };

    const formattedMessages = messages.map((message) => normalizeMessage(message as ChatMessageLike));
    
    console.log("FORMATTED MESSAGES", JSON.stringify(formattedMessages, null, 2));

    const extractTextFromParts = (parts: unknown): string => {
      if (!Array.isArray(parts)) {
        return '';
      }

      return parts
        .filter((part): part is Record<string, unknown> => typeof part === 'object' && part !== null)
        .filter((part) => part.type === 'text')
        .map((part) => (typeof part.text === 'string' ? part.text : ''))
        .join('');
    };

    // Call the Vercel AI SDK with ToolLoopAgent
    const response = await createAgentUIStreamResponse({
      agent: myAgent,
      uiMessages: formattedMessages,
      async onEnd({ responseMessage }) {
        const rawParts = responseMessage && typeof responseMessage === 'object' && 'parts' in responseMessage ? responseMessage.parts : undefined;
        const content = extractTextFromParts(rawParts);

        if (content || (Array.isArray(rawParts) && rawParts.length > 0)) {
          await prisma.message.create({
            data: {
              conversationId: currentConversationId!,
              role: 'assistant',
              content: content,
              parts: rawParts ? JSON.stringify(rawParts) : null,
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
