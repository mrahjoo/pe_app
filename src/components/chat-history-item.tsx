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

  const handleDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteConversation(id);

      if (!result?.success) {
        console.error('Failed to delete conversation', result?.error ?? 'Unknown error');
        return;
      }

      startTransition(() => {
        if (pathname === `/agent/${id}`) {
          router.push('/agent');
        } else {
          router.refresh();
        }
      });
    } catch (error) {
      console.error('Failed to delete conversation', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`flex items-center group p-2 rounded-lg hover:bg-muted transition-colors relative ${isActive ? 'bg-muted' : ''}`}>
      <Link href={`/agent/${id}`} className="flex items-center gap-2 flex-1 min-w-0" title={title}>
        <MessageSquare size={16} className={`${isActive ? 'text-foreground' : 'text-muted-foreground'} group-hover:text-foreground shrink-0`} />
        <span className="truncate flex-1 text-sm">{title}</span>
      </Link>
      <button
        type="button"
        aria-label={`Delete chat ${title}`}
        disabled={isDeleting || isPending}
        onClick={handleDelete}
        className="z-10 p-1 text-muted-foreground hover:text-destructive shrink-0 transition-opacity disabled:opacity-50 pointer-events-auto"
        title="Delete Chat"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
