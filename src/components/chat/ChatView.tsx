import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
}

export const ChatView = ({ chatId, messages, onSendMessage }: ChatViewProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
      toast({ title: "Failed to send message", description: "Please try again", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col bg-chat-bg h-screen">
        {/* Fixed header */}
        <div className="sticky top-0 z-10 border-b border-border p-4 flex items-center justify-center">
        </div>

        <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
          <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <div>
            <h3 className="text-lg font-medium mb-2">Welcome to your AI Assistant</h3>
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
        <div className="w-24"></div> 
        <span className="text-sm sm:text-base font-semibold bg-gradient-to-r from-yellow-700 via-orange-500 to-amber-700 
bg-clip-text text-transparent mt-1 drop-shadow-sm 
bg-[length:200%_200%] animate-gradient-move">
  Warm chats, brilliant ideas
</span>


      <div className="w-24"></div>
</div>



      {/* Scrollable messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-2 sm:p-4 overflow-x-hidden" style={{ minHeight: 0 }}>
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Start a conversation with your AI assistant</p>
            </div>
          ) : (
            messages.map(message => (
              <div key={message.id} className={`flex flex-wrap gap-3 ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                {message.isBot && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
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
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3 items-end flex-wrap">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-[hsl(var(--message-bot))] border border-[hsl(var(--border))] p-3 rounded-lg flex items-center gap-2 max-w-full sm:max-w-[70%] break-words">
                <span className="w-3 h-3 rounded-full animate-bounce bg-[hsl(30,30%,25%)]"></span>
                <span className="w-3 h-3 rounded-full animate-bounce bg-[hsl(30,30%,25%)]" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-3 h-3 rounded-full animate-bounce bg-[hsl(30,30%,25%)]" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Sticky footer */}
      <div className="border-t border-border p-2 sm:p-4 bg-chat-bg sticky bottom-0 z-10">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
