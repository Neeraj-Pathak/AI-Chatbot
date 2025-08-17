import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/components/auth/AuthProvider';
import { MessageCircle, Plus, LogOut, Trash2, Edit2, ChevronsLeft, ChevronsRight, Coffee } from 'lucide-react';

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
  onDeleteChat: (chatId: string) => void;
  onRenameChat?: (chatId: string, newTitle: string) => void;
}

interface AuthUser {
  id: string;
  email?: string;
  displayName?: string;
  metadata?: { displayName?: string };
  avatarUrl?: string;
}

export const ChatSidebar = ({
  chats,
  activeChat,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onRenameChat,
}: ChatSidebarProps) => {
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const authUser = user as AuthUser;
  const displayName =
    authUser?.metadata?.displayName ||
    authUser?.displayName ||
    authUser?.email ||
    'Unknown User';

  const handleRenameClick = (chatId: string, oldTitle: string) => {
    const newTitle = prompt('Rename chat', oldTitle);
    if (newTitle && onRenameChat) onRenameChat(chatId, newTitle);
  };

  return (
    <div
      className={`flex flex-col h-full border-r border-[hsl(var(--sidebar-border))] transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-80'
      } bg-[hsl(var(--sidebar-bg))]`}
    >
      {/* Header */}
      <div className="p-4 border-b border-[hsl(var(--sidebar-border))] flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-yellow-700" />
            <h1
              className="text-lg sm:text-xl font-extrabold font-poppins tracking-wide truncate
              bg-gradient-to-r from-yellow-600 via-orange-500 to-amber-700
              bg-clip-text text-transparent drop-shadow-sm animate-gradient-move
              bg-[length:200%_200%]"
            >
              NEURA
            </h1>
          </div>
        )}

        <div className="flex gap-2 items-center">
          {!collapsed && (
            <Button
              onClick={onNewChat}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-[#6F4E37] hover:text-[#6F4E37] hover:bg-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={() => setCollapsed(!collapsed)}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 flex items-center justify-center text-[#6F4E37] hover:text-[#6F4E37] hover:bg-white"
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Chat list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {chats.length === 0 ? (
            !collapsed && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No chats yet</p>
                <p className="text-xs">Start a new conversation</p>
              </div>
            )
          ) : (
            chats.map(chat => {
              const isActive = activeChat === chat.id;
              return (
                <div
                  key={chat.id}
                  className={`relative flex items-center justify-between rounded-lg border transition-colors overflow-hidden ${
                    isActive
                      ? 'bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-active-fg))] border-2 border-[#6F4E37] shadow-md shadow-[#6F4E37]/40'
                      : 'bg-[hsl(var(--card))] hover:bg-[hsl(var(--sidebar-hover))] text-[hsl(var(--card-foreground))] border-transparent'
                  }`}
                >
                  {/* Background image with overlay */}
                  <div className="absolute inset-0">
                    <img
                      src="https://www.shutterstock.com/image-vector/simple-coffee-bean-pattern-illustration-600nw-1918951712.jpg"
                      alt="Coffee Bean Pattern"
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute inset-0 ${
                        isActive
                          ? 'bg-[#6F4E37]/80'
                          : 'bg-[#ffffff]/80'
                      }`}
                    />
                  </div>

                  {/* Chat content */}
                  <button
                    onClick={() => onChatSelect(chat.id)}
                    className={`relative flex-1 text-left p-3 flex flex-col gap-0.5 truncate z-10 ${
                      collapsed ? 'justify-center items-center text-center' : ''
                    }`}
                  >
                    {!collapsed ? (
                      <>
                        <div className={`font-medium text-sm truncate ${isActive ? 'text-white' : 'text-[hsl(var(--card-foreground))]'}`}>
                          {chat.title}
                        </div>
                        {chat.lastMessage && (
                          <div
                            className={`text-xs truncate ${isActive ? 'text-white/90' : 'text-[hsl(var(--sidebar-foreground))]'}`}
                            title={chat.lastMessage}
                          >
                            {chat.lastMessage.length > 50
                              ? chat.lastMessage.slice(0, 35) + '...'
                              : chat.lastMessage}
                          </div>
                        )}
                        <div className={`text-xs ${isActive ? 'text-white/80' : 'text-[hsl(var(--sidebar-foreground))]'}`}>
                          {new Date(chat.updatedAt).toLocaleDateString()}
                        </div>
                      </>
                    ) : (
                      <MessageCircle className={`h-5 w-5 mx-auto ${isActive ? 'text-white' : ''}`} />
                    )}
                  </button>

                  {!collapsed && (
                    <div className="relative flex flex-col justify-center items-center gap-1 pr-2 flex-shrink-0 z-10">
                      {onRenameChat && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRenameClick(chat.id, chat.title)}
                          className={`h-6 w-6 p-0 ${
                            isActive
                              ? 'text-white hover:text-white hover:bg-[#6F4E37]/20'
                              : 'text-[#6F4E37] hover:text-[#6F4E37] hover:bg-white'
                          }`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteChat(chat.id)}
                        className={`h-6 w-6 p-0 ${
                          isActive
                            ? 'text-white hover:text-white hover:bg-[#6F4E37]/20'
                            : 'text-[#6F4E37] hover:text-[#6F4E37] hover:bg-white'
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

{/* Footer with username and logout */}
<div className="p-4 border-t border-[hsl(var(--sidebar-border))] flex items-center gap-2">
  {!collapsed && (
    <>
      {/* Coffee bean avatar */}
      <img
        src="https://cdn-icons-png.flaticon.com/512/766/766407.png" // example coffee bean icon
        alt="Avatar"
        className="h-5 w-5 rounded-full"
      />
      <span className="truncate flex-1">{displayName}</span>
    </>
  )}
<Button
  onClick={() => {
    if (confirm('Are you sure you want to log out?')) {
      signOut();
    }
  }}
  variant="ghost"
  size="sm"
  className={`flex items-center justify-center h-10 text-[hsl(var(--sidebar-foreground))] hover:text-[hsl(var(--foreground))]`}
>
  <LogOut className="h-5 w-5" />
</Button>
</div>
    </div>
  );
};
