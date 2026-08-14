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
    let parts: any[] = [{ type: "text", text: m.content }];
    if (m.parts) {
      try {
        parts = JSON.parse(m.parts);
      } catch (e) {
        // ignore parse error and fallback to text
      }
    }
    return {
      id: m.id,
      role: m.role as "user" | "assistant" | "system" | "data",
      content: m.content,
      experimental_attachments: parts.some(p => p.url) ? parts : undefined,
    };
  });

  return (
    <ChatInterface chatId={conversation.id} initialMessages={initialMessages} />
  );
}
