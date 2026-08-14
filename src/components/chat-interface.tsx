"use client";

import { useChat } from '@ai-sdk/react';
import { Send, User, Bot, Loader2, Paperclip, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DefaultChatTransport } from 'ai';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
interface ChatInterfaceProps {
  chatId?: string;
  initialMessages?: any[];
}

export function ChatInterface({ chatId, initialMessages = [] }: ChatInterfaceProps) {
  const router = useRouter();
  
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | undefined>(chatId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { messages, sendMessage, status } = useChat({
    id: chatId, // only use initial ID to prevent state reset
    transport: new DefaultChatTransport({
      api: '/api/chat',
      fetch: async (url, options) => {
        const response = await fetch(url, options);
        const newChatId = response.headers.get('x-conversation-id');
        if (newChatId && !activeChatId) {
          setActiveChatId(newChatId);
          window.history.replaceState(null, '', `/agent/${newChatId}`);
        }
        return response;
      }
    }),
    messages: initialMessages,
    onFinish: () => {
      router.refresh();
    }
  });

  const isLoading = status === 'submitted' || status === 'streaming';
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      // Reset input value so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && !image) return;
    
    const attachments = image ? [{ url: image, contentType: image.split(';')[0].split(':')[1] || 'image/jpeg' }] : undefined;
    
    sendMessage(
      { role: 'user', content: input, experimental_attachments: attachments } as any, 
      { body: { chatId: activeChatId } }
    );
    setInput('');
    setImage(null);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // When a new chat receives its first message, we should ideally redirect to /agent/[id]
  // We'll rely on the user refreshing for now, or just let them stay on /agent which works for the session.

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
            <Bot size={48} className="opacity-20" />
            <p className="text-lg">How can I help you today?</p>
            <Link href="/agent/help" className="text-sm text-primary hover:underline">
              See what I can do
            </Link>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-4 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot size={18} className="text-primary" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted rounded-tl-sm'
                }`}
              >
                <div className={`prose prose-sm max-w-none break-words ${m.role === 'user' ? 'prose-invert' : 'dark:prose-invert'}`}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {((m as any).content || m.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') || '').replace(/\\\(/g, '$').replace(/\\\)/g, '$').replace(/\\\[/g, '$$$').replace(/\\\]/g, '$$$')}
                  </ReactMarkdown>
                  {(m as any).experimental_attachments && (m as any).experimental_attachments.map((p: any, i: number) => {
                    if (p.url) {
                      return <img key={i} src={p.url} alt="uploaded" className="max-w-sm rounded-lg mt-2 mb-2" />;
                    }
                    return null;
                  })}
                </div>
                {/* Tool Invocations */}
                {(m as any).toolInvocations?.map((toolInvocation: any) => (
                  <div key={toolInvocation.toolCallId} className="mt-4 border rounded-xl p-4 bg-background">
                    {toolInvocation.toolName === 'weather' ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          ☁️ Weather in {toolInvocation.args.location}
                        </div>
                        {toolInvocation.state === 'result' ? (
                          <div className="text-2xl font-bold text-foreground">
                            {toolInvocation.result.temperature}°C
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                              {toolInvocation.result.condition}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 size={14} className="animate-spin" />
                            Fetching weather...
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {toolInvocation.state === 'result' 
                          ? `Completed ${toolInvocation.toolName}`
                          : `Running ${toolInvocation.toolName}...`}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <User size={18} className="text-primary-foreground" />
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Loader2 size={18} className="text-primary animate-spin" />
            </div>
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted rounded-tl-sm text-muted-foreground flex items-center">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto relative flex flex-col gap-2"
        >
          {image && (
            <div className="relative self-start mb-2">
              <img src={image} alt="Upload preview" className="h-20 rounded-md object-cover border" />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
              >
                <X size={12} />
              </button>
            </div>
          )}
          <div className="relative flex items-end gap-2 w-full">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 mb-1 shrink-0 bg-muted text-muted-foreground rounded-full hover:bg-muted/80 transition-colors"
            >
              <Paperclip size={20} />
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <div className="relative flex-1">
              <textarea
                className="w-full min-h-[56px] max-h-32 bg-muted/50 border border-input rounded-2xl px-4 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none overflow-y-auto placeholder:text-muted-foreground"
                placeholder="Message Agent..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                rows={1}
              />
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !image)}
                className="absolute right-2 bottom-2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </form>
        <div className="text-center text-xs text-muted-foreground mt-2">
          Agent can make mistakes. Consider verifying important information.
        </div>
      </div>
    </div>
  );
}
