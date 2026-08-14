import { ChatInterface } from "@/components/chat-interface";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export default async function AgentChatPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { userId } = await auth.protect();

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    notFound();
  }

  // Ensure users can only see their own conversations
  if (conversation.userId !== userId) {
    notFound();
  }

  // Transform Prisma messages to AI SDK Message format
  const initialMessages = conversation.messages.map((m) => {
    type TextPart = { type: 'text'; text: string };
    type FilePart = { type: 'file'; mediaType: string; url: string; filename?: string };

    let parts: Array<TextPart | FilePart> = [{ type: 'text', text: m.content }];

    if (m.parts) {
      try {
        const parsedParts = JSON.parse(m.parts) as unknown;
        if (Array.isArray(parsedParts)) {
          const validParts = parsedParts
            .filter((part): part is Record<string, unknown> => typeof part === 'object' && part !== null)
            .map((part) => {
              if (part.type === 'text' && typeof part.text === 'string') {
                return { type: 'text' as const, text: part.text };
              }

              if (part.type === 'file' && typeof part.url === 'string') {
                return {
                  type: 'file' as const,
                  mediaType: typeof part.mediaType === 'string' ? part.mediaType : 'image/jpeg',
                  url: part.url,
                  ...(typeof part.filename === 'string' ? { filename: part.filename } : {}),
                };
              }

              return null;
            })
            .filter((part): part is TextPart | FilePart => part !== null);

          if (validParts.length > 0) {
            parts = validParts;
          }
        }
      } catch {
        // ignore parse error and fallback to text
      }
    }

    return {
      id: m.id,
      role: (m.role === 'data' ? 'assistant' : m.role) as 'user' | 'assistant' | 'system',
      content: m.content,
      parts,
    };
  });

  return (
    <ChatInterface chatId={conversation.id} initialMessages={initialMessages} />
  );
}
