// ChatView.tsx
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: string;
}

interface ChatViewProps {
  chatId: string | null;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  toastMessage?: string | null;
}

export const ChatView = ({ chatId, messages, onSendMessage, toastMessage }: ChatViewProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (!scrollAreaRef.current) return;
    const container = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !chatId) return;

    const messageContent = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      await onSendMessage(messageContent);
    } catch {
      console.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col bg-chat-bg h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center text-center text-muted-foreground">
            <Bot className="h-12 w-12 mb-4 opacity-50 text-[#6F4E37]" />
            <h3 className="text-lg font-medium mb-2 text-[#6F4E37]">Welcome to your AI Assistant</h3>
            <p className="text-sm">Select a chat or start a new conversation</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-chat-bg h-screen">
      {/* Fixed header */}
      <div className="sticky top-0 z-10 border-b border-border p-4 flex flex-col items-center justify-center bg-chat-bg">
        <span className="text-sm sm:text-base font-semibold bg-gradient-to-r from-yellow-600 via-orange-500 to-amber-700
          bg-clip-text text-transparent drop-shadow-sm 
          bg-[length:200%_200%] animate-gradient-move">
          Warm chats, brilliant ideas
        </span>
      </div>

      {/* Scrollable messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-2 sm:p-4 overflow-x-hidden" style={{ minHeight: 0 }}>
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-8 w-8 mx-auto mb-2 opacity-50 text-[#6F4E37]" />
              <p className="text-sm">Start a conversation with your AI assistant</p>
            </div>
          ) : (
            messages.map(message => (
              <div key={message.id} className={`flex flex-wrap gap-3 ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                {message.isBot && (
                  <div className="w-8 h-8 rounded-full bg-white border border-[#6F4E37] flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-[#6F4E37]" />
                  </div>
                )}

                <div className={`max-w-full sm:max-w-[70%] break-words p-3 rounded-lg border ${
                  message.isBot
                    ? 'bg-[hsl(var(--message-bot))] border-[hsl(var(--border))]'
                    : 'bg-[hsl(var(--message-user))] border-[hsl(var(--border))]'
                }`}>
                  <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {!message.isBot && (
                  <div className="w-8 h-8 rounded-full bg-[#6F4E37] flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3 items-end flex-wrap">
              <div className="w-8 h-8 rounded-full bg-white border border-[#6F4E37] flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-[#6F4E37]" />
              </div>
              <div className="bg-[hsl(var(--message-bot))] border border-[hsl(var(--border))] p-3 rounded-lg flex items-center gap-2 max-w-full sm:max-w-[70%] break-words">
                <span className="w-3 h-3 rounded-full animate-bounce bg-[#6F4E37]"></span>
                <span className="w-3 h-3 rounded-full animate-bounce bg-[#6F4E37]" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-3 h-3 rounded-full animate-bounce bg-[#6F4E37]" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Toast above input */}
      {toastMessage && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded shadow-md text-white max-w-xs text-center"
             style={{ background: 'linear-gradient(to right, #6F4E37, #A9746E)' }}>
          {toastMessage}
        </div>
      )}

      {/* Sticky footer */}
      <div className="border-t border-border p-2 sm:p-4 bg-chat-bg sticky bottom-0 z-10">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 border-[#6F4E37] focus-visible:ring-[#6F4E37]"
          />
          <Button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="h-10 w-10 rounded-full flex items-center justify-center p-0
              text-[#6F4E37] bg-white border border-[#6F4E37]
              hover:bg-[#6F4E37] hover:text-white transition-colors"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
