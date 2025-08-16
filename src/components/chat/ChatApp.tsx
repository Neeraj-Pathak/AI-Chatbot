import { useState, useEffect, useRef } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatView } from './ChatView';
import { useToast } from '@/hooks/use-toast';
import { gql, GraphQLClient } from 'graphql-request';
import { useAuth } from '@/components/auth/AuthProvider';
import { sendMessage } from '@/pages/api/sendMessage';
import { Sun, Moon } from 'lucide-react';

interface Chat {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'bot';
  timestamp: string;
  isBot: boolean;
}

interface GetChatsResponse {
  chats: {
    id: string;
    title: string;
    created_at: string;
    messages: { content: string }[];
  }[];
}

interface GetMessagesResponse {
  messages: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    created_at: string;
  }[];
}

interface CreateChatResponse {
  insert_chats_one: {
    id: string;
    title: string;
    created_at: string;
  };
}

const client = new GraphQLClient(
  'https://buymwspkkxhngcxtfkqm.hasura.eu-central-1.nhost.run/v1/graphql',
  { headers: { 'x-hasura-admin-secret': 'WT5at3Z:3Y(5lbkN4b!0,adF8v*y2,DS' } }
);

const GET_CHATS = gql`
  query GetChats($userId: uuid!) {
    chats(where: { user_id: { _eq: $userId } }, order_by: { created_at: desc }) {
      id
      title
      created_at
      messages(limit: 1, order_by: { created_at: desc }) { content }
    }
  }
`;

const GET_MESSAGES = gql`
  query GetMessages($chatId: uuid!) {
    messages(where: { chat_id: { _eq: $chatId } }, order_by: { created_at: asc }) {
      id
      content
      role
      created_at
    }
  }
`;

const CREATE_CHAT = gql`
  mutation CreateChat($userId: uuid!, $title: String!) {
    insert_chats_one(object: { user_id: $userId, title: $title }) {
      id
      title
      created_at
    }
  }
`;

export const ChatApp = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = user?.id;
  if (!userId) throw new Error('User must be signed in');

  const fetchChats = async () => {
    try {
      const data = await client.request<GetChatsResponse>(GET_CHATS, { userId });
      const fetchedChats: Chat[] = data.chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        lastMessage: chat.messages[0]?.content,
        updatedAt: chat.created_at,
      }));
      setChats(fetchedChats);
      if (fetchedChats.length > 0 && !activeChat) setActiveChat(fetchedChats[0].id);
    } catch {
      toast({ title: 'Failed to fetch chats', variant: 'destructive' });
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const data = await client.request<GetMessagesResponse>(GET_MESSAGES, { chatId });
      const fetchedMessages: Message[] = data.messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role === 'assistant' ? 'bot' : msg.role,
        timestamp: msg.created_at,
        isBot: msg.role === 'assistant',
      }));
      setMessages(fetchedMessages);
      scrollToBottom();
    } catch {
      toast({ title: 'Failed to fetch messages', variant: 'destructive' });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { fetchChats(); }, []);
  useEffect(() => { if (activeChat) fetchMessages(activeChat); }, [activeChat]);

  const handleNewChat = async () => {
    try {
      const title = 'New Chat';
      const data = await client.request<CreateChatResponse>(CREATE_CHAT, { userId, title });
      const newChat: Chat = {
        id: data.insert_chats_one.id,
        title: data.insert_chats_one.title,
        updatedAt: data.insert_chats_one.created_at,
      };
      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChat.id);
      setMessages([]);
      toast({ title: 'New chat created', description: 'Start your conversation!' });
    } catch {
      toast({ title: 'Failed to create chat', variant: 'destructive' });
    }
  };

  const handleChatSelect = (chatId: string) => { setActiveChat(chatId); };
  const handleSendMessage = async (content: string) => {
    if (!activeChat) return;
    const userMessage: Message = { id: `temp-${Date.now()}`, content, role: 'user', timestamp: new Date().toISOString(), isBot: false };
    setMessages(prev => [...prev, userMessage]);
    try { await sendMessage({ chatId: activeChat, content, userId }); fetchMessages(activeChat); } 
    catch { toast({ title: 'Failed to send message', variant: 'destructive' }); }
  };

  const filteredChats = chats.filter(chat => chat.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="h-screen flex bg-background relative">    

      <ChatSidebar
        chats={filteredChats}
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
      />

      <ChatView
        chatId={activeChat}
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};
