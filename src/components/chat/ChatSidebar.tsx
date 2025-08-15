import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/auth/AuthProvider';
import { MessageCircle, Plus, LogOut, User } from 'lucide-react';

interface Chat {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
}

export const ChatSidebar = ({ chats, activeChat, onChatSelect, onNewChat }: ChatSidebarProps) => {
  const { user, signOut } = useAuth();

  return (
    <div className="w-80 bg-sidebar-bg border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-foreground">Chatbot</h1>
          <Button
            onClick={onNewChat}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* User info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="truncate">{user?.email}</span>
        </div>
      </div>

      {/* Chat list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {chats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs">Start a new conversation</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onChatSelect(chat.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeChat === chat.id
                      ? 'bg-sidebar-active text-sidebar-active-fg'
                      : 'hover:bg-sidebar-hover'
                  }`}
                >
                  <div className="font-medium text-sm truncate mb-1">
                    {chat.title}
                  </div>
                  {chat.lastMessage && (
                    <div className="text-xs text-muted-foreground truncate">
                      {chat.lastMessage}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          onClick={signOut}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};