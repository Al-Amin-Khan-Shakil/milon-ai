import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageCircle, Users, Share2, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CreateChatModal } from '../components/CreateChatModal';
import { ChatList } from '../components/ChatList';
import BoltBadge from '../assets/white_circle_360x360.png';
import dotenv from 'dotenv';

// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

interface Chat {
  id: number;
  title: string;
  message_count: number;
  last_message: string;
  updated_at: string;
  owner_username?: string;
  is_public?: boolean;
}

type TabType = 'my' | 'shared' | 'public';

const TabButton = memo<{
  tab: {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    count: number;
  };
  isActive: boolean;
  onClick: () => void;
}>(({ tab, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-1 items-center px-6 py-3 justify-center rounded-xl font-medium transition-all ${
      isActive
        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
        : 'text-gray-300 hover:text-white hover:bg-white/10'
    }`}
  >
    <tab.icon className="h-5 w-5 mr-2" />
    <span className='hidden sm:inline-block'>{tab.label}</span>
    {tab.count > 0 && (
      <span
        className={`ml-2 px-2 py-1 text-xs rounded-full ${
          isActive ? 'bg-white/20' : 'bg-white/10'
        }`}
      >
        {tab.count}
      </span>
    )}
  </button>
));

TabButton.displayName = 'TabButton';

export const Dashboard: React.FC = () => {
  const [myChats, setMyChats] = useState<Chat[]>([]);
  const [sharedChats, setSharedChats] = useState<Chat[]>([]);
  const [publicChats, setPublicChats] = useState<Chat[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('my');

  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  // Define API base URL
  const API_URL = process.env.REACT_APP_API_URL || '/api';

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    [token]
  );

  const fetchChats = useCallback(async () => {
    try {
      const [myChatsRes, sharedChatsRes, publicChatsRes] = await Promise.all([
        fetch(`${API_URL}/chat/my-chats`, { headers }),
        fetch(`${API_URL}/chat/shared-with-me`, { headers }),
        fetch(`${API_URL}/chat/joined-public`, { headers }),
      ]);

      if (myChatsRes.ok) {
        const myChatsData = await myChatsRes.json();
        setMyChats(myChatsData);
      }

      if (sharedChatsRes.ok) {
        const sharedChatsData = await sharedChatsRes.json();
        setSharedChats(sharedChatsData);
      }

      if (publicChatsRes.ok) {
        const publicChatsData = await publicChatsRes.json();
        setPublicChats(publicChatsData);
      }
    } catch (error) {
      toast.error('Failed to fetch chats');
      console.error('Fetch chats error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleCreateChat = useCallback(
    async (title: string) => {
      try {
        const response = await fetch(`${API_URL}/chat/create`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ title }),
        });

        if (response.ok) {
          const newChat = await response.json();
          setMyChats((prev) => [newChat, ...prev]);
          toast.success('Chat created successfully!');
          navigate(`/chat/${newChat.id}`);
        } else {
          toast.error('Failed to create chat');
        }
      } catch (error) {
        toast.error('Failed to create chat');
        console.error('Create chat error:', error);
      }
    },
    [headers, navigate]
  );

  const handleLogout = useCallback(() => {
    logout();
    toast.success('Logged out successfully');
  }, [logout]);

  const handleChatClick = useCallback(
    (chatId: number) => {
      navigate(`/chat/${chatId}`);
    },
    [navigate]
  );

  const handleTabClick = useCallback((tabId: TabType) => {
    setActiveTab(tabId);
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const tabs = useMemo(
    () => [
      { id: 'my', label: 'My Chats', icon: MessageCircle, count: myChats.length },
      {
        id: 'shared',
        label: 'Shared With Me',
        icon: Share2,
        count: sharedChats.length,
      },
      {
        id: 'public',
        label: 'Joined Public',
        icon: Users,
        count: publicChats.length,
      },
    ],
    [myChats.length, sharedChats.length, publicChats.length]
  );

  const getCurrentChats = useCallback(() => {
    switch (activeTab) {
      case 'my':
        return myChats;
      case 'shared':
        return sharedChats;
      case 'public':
        return publicChats;
      default:
        return myChats;
    }
  }, [activeTab, myChats, sharedChats, publicChats]);

  const currentChats = getCurrentChats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute top-2 right-4 md:top-32 md:right-6 lg:right-10 xl:top-82 xl:right-14 2xl:top-20 z-50">
        <a
          href="https://bolt.new/"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer"
        >
          <img
            src={BoltBadge}
            alt="Bolt Badge"
            className="h-16 w-16 md:h-24 md:w-24"
          />
        </a>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <h2 className="text-3xl font-bold text-white">
          Welcome back, {user?.username}!
        </h2>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-gray-300">
              Manage your AI conversations and collaborations
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenCreateModal}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              <Plus className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline-block">New Chat</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all border border-white/20"
            >
              <LogOut className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline-block">Logout</span>
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-1 mb-8 inline-flex border border-white/10 w-full max-w-[720px]">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => handleTabClick(tab.id as TabType)}
            />
          ))}
        </div>

        {/* Chat List */}
        <ChatList
          chats={currentChats}
          showOwner={activeTab !== 'my'}
          onChatClick={handleChatClick}
        />

        {/* Create Chat Modal */}
        <CreateChatModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onCreate={handleCreateChat}
        />
      </div>
    </div>
  );
};