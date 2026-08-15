import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, PlusCircle, Menu } from 'lucide-react';
import prisma from '@/lib/prisma';
import { ChatHistoryItem } from '@/components/chat-history-item';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

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

  const SidebarContent = () => (
    <>
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
    </>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] border-t overflow-hidden bg-background relative flex-col md:flex-row">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center p-2 border-b bg-muted/20">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon-sm" className="mr-2" />}>
            <Menu size={20} />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Chat History</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <span className="font-semibold text-sm">Agent</span>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 border-r bg-muted/20 flex-col h-full shrink-0">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}
