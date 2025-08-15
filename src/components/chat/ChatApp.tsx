import { useState, useEffect } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatView } from './ChatView';
import { useQuery, useMutation, useSubscription } from '@/hooks/useGraphQL';
import { useToast } from '@/hooks/use-toast';

interface Chat {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: string;
}

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: string;
}

// GraphQL queries, mutations, and subscriptions placeholders
const GET_CHATS = `
  query GetChats($userId: uuid!) {
    chats(where: {user_id: {_eq: $userId}}, order_by: {updated_at: desc}) {
      id
      title
      updated_at
      messages(limit: 1, order_by: {created_at: desc}) {
        content
      }
    }
  }
`;

const GET_MESSAGES = `
  query GetMessages($chatId: uuid!) {
    messages(where: {chat_id: {_eq: $chatId}}, order_by: {created_at: asc}) {
      id
      content
      is_bot
      created_at
    }
  }
`;

const CREATE_CHAT = `
  mutation CreateChat($userId: uuid!, $title: String!) {
    insert_chats_one(object: {user_id: $userId, title: $title}) {
      id
      title
      created_at
    }
  }
`;

const SEND_MESSAGE = `
  mutation SendMessage($chatId: uuid!, $content: String!, $isBot: Boolean!) {
    insert_messages_one(object: {chat_id: $chatId, content: $content, is_bot: $isBot}) {
      id
      content
      is_bot
      created_at
    }
  }
`;

const MESSAGES_SUBSCRIPTION = `
  subscription MessagesSubscription($chatId: uuid!) {
    messages(where: {chat_id: {_eq: $chatId}}, order_by: {created_at: asc}) {
      id
      content
      is_bot
      created_at
    }
  }
`;

export const ChatApp = () => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const { mutate, loading: mutationLoading } = useMutation();
  const { toast } = useToast();

  // Mock user ID - in real app, this would come from auth context
  const userId = "user-1";

  // Mock data for demonstration
  useEffect(() => {
    // TODO: Replace with actual GraphQL queries
    const mockChats: Chat[] = [
      {
        id: 'chat-1',
        title: 'General Discussion',
        lastMessage: 'Hello! How can I help you today?',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'chat-2',
        title: 'Technical Questions',
        lastMessage: 'Sure, I can help you with that.',
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    
    setChats(mockChats);
    
    if (mockChats.length > 0) {
      setActiveChat(mockChats[0].id);
    }
  }, []);

  // Mock messages for active chat
  useEffect(() => {
    if (activeChat) {
      // TODO: Replace with actual GraphQL query
      const mockMessages: Message[] = [
        {
          id: 'msg-1',
          content: 'Hello! How can I help you today?',
          isBot: true,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'msg-2',
          content: 'I need help with a technical question.',
          isBot: false,
          timestamp: new Date(Date.now() - 3500000).toISOString(),
        },
        {
          id: 'msg-3',
          content: 'Of course! I\'d be happy to help. What specific technical question do you have?',
          isBot: true,
          timestamp: new Date(Date.now() - 3400000).toISOString(),
        },
      ];
      
      setMessages(mockMessages);
    }
  }, [activeChat]);

  // Subscribe to new messages for active chat
  useSubscription(
    MESSAGES_SUBSCRIPTION,
    { chatId: activeChat },
    (data) => {
      // TODO: Handle real-time message updates
      console.log('New message received:', data);
    }
  );

  const handleNewChat = async () => {
    try {
      // TODO: Replace with actual GraphQL mutation
      const newChatId = `chat-${Date.now()}`;
      const newChat: Chat = {
        id: newChatId,
        title: 'New Chat',
        updatedAt: new Date().toISOString(),
      };
      
      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChatId);
      setMessages([]);
      
      toast({
        title: "New chat created",
        description: "Start your conversation!",
      });
    } catch (error) {
      toast({
        title: "Failed to create chat",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId);
  };

  const handleSendMessage = async (content: string) => {
    if (!activeChat) return;

    try {
      // 1. Save user message to database
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        content,
        isBot: false,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // TODO: Replace with actual GraphQL mutation
      // await mutate(SEND_MESSAGE, {
      //   chatId: activeChat,
      //   content,
      //   isBot: false,
      // });

      // 2. Call Hasura Action to trigger n8n workflow
      // This will send the message to n8n, which will:
      // - Validate user ownership of chat
      // - Call OpenRouter API
      // - Save bot response back to database
      // - Return the response
      
      // TODO: Replace with actual Hasura Action call
      // const response = await mutate(SEND_MESSAGE_ACTION, {
      //   chatId: activeChat,
      //   message: content,
      // });

      // Mock bot response for demonstration
      setTimeout(() => {
        const botMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          content: `I understand your message: "${content}". This is a simulated response. In the real implementation, this would come from OpenRouter API via n8n workflow.`,
          isBot: true,
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, botMessage]);
      }, 2000);

    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  return (
    <div className="h-screen flex bg-background">
      <ChatSidebar
        chats={chats}
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