'use client';


import Link from 'next/link';
import { deleteConversation } from '@/app/agent/actions';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useTransition, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface ChatHistoryItemProps {
  id: string;
  title: string;
  isActive?: boolean;
}

export function ChatHistoryItem({ id, title, isActive }: ChatHistoryItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  
  return (
    <div className={`flex items-center group p-2 rounded-lg hover:bg-muted transition-colors relative ${isActive ? 'bg-muted' : ''}`}>
      <Link href={`/agent/${id}`} className="flex items-center gap-2 flex-1 min-w-0" title={title}>
        <MessageSquare size={16} className={`${isActive ? 'text-foreground' : 'text-muted-foreground'} group-hover:text-foreground shrink-0`} />
        <span className="truncate flex-1 text-sm">{title}</span>
      </Link>
      <button 
        disabled={isDeleting || isPending}
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (window.confirm('Are you sure you want to delete this chat?')) {
            setIsDeleting(true);
            try {
              await deleteConversation(id);
              startTransition(() => {
                if (pathname === `/agent/${id}`) {
                  router.push('/agent');
                } else {
                  router.refresh();
                }
              });
            } catch (err) {
              console.error('Failed to delete conversation', err);
            } finally {
              setIsDeleting(false);
            }
          }
        }}
        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive shrink-0 transition-opacity disabled:opacity-50"
        title="Delete Chat"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
