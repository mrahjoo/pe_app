import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, PlusCircle } from 'lucide-react';
import prisma from '@/lib/prisma';
import { ChatHistoryItem } from '@/components/chat-history-item';

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth.protect();

  // Fetch all user conversations
  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] border-t overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/20 flex flex-col h-full">
        <div className="p-4 border-b">
          <Link
            href="/agent"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors w-full justify-center font-medium"
          >
            <PlusCircle size={18} />
            New Chat
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center p-4">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <ChatHistoryItem 
                key={conv.id} 
                id={conv.id} 
                title={conv.title} 
              />
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}
