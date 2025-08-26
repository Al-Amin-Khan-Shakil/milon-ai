import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Share2, Copy, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { toast } from 'react-hot-toast';
import { MessageBubble } from '../components/MessageBubble';
import { ShareModal } from '../components/ShareModal';

interface Message {
  id: number;
  content: string;
  message_type: 'user' | 'ai';
  username: string;
  user_id: number;
  created_at: string;
  context_messages?: string[];
}

interface Chat {
  id: number;
  title: string;
  owner_id: number;
  is_public: boolean;
  public_link: string;
  owner_username: string;
}

interface TypingUser {
  userId: number;
  username: string;
  isTyping: boolean;
}

const MessageList = memo<{
  messages: Message[];
  selectedMessages: number[];
  onToggleMessageSelection: (messageId: number) => void;
}>(({ messages, selectedMessages, onToggleMessageSelection }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isSelected={selectedMessages.includes(message.id)}
          onToggleSelect={() => onToggleMessageSelection(message.id)}
          showSelection={true}
        />
      ))}
    </div>
  );
});

MessageList.displayName = 'MessageList';

export const Chat: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user, token } = useAuth();
  const { socket } = useSocket();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [publicLink, setPublicLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sendMessageTriggered = useRef(false);

  // Define API base URL
  const API_URL = process.env.REACT_APP_API_URL || '/api';

  const headers = useMemo(() => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }), [token]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const isOwner = useMemo(() => chat?.owner_id === user?.id, [chat?.owner_id, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (chatId && socket) {
      socket.emit('join-chat', chatId);

      const handleMessageReceived = (message: Message) => {
        // Only add if it's not from the current user
        if (message.user_id !== user?.id && !messages.some(m => m.id === message.id)) {
          setMessages(prev => [...prev, message]);
        }
      };

      const handleUserTyping = ({ userId, username, isTyping }: TypingUser) => {
        setTypingUsers(prev => {
          const existingUserIndex = prev.findIndex(u => u.userId === userId);
          if (existingUserIndex !== -1) {
            return prev.map((u, index) =>
              index === existingUserIndex ? { ...u, isTyping } : u
            );
          } else if (isTyping) {
            return [...prev, { userId, username, isTyping }];
          }
          return prev;
        });
      };

      socket.on('message-received', handleMessageReceived);
      socket.on('user-typing', handleUserTyping);

      return () => {
        socket.emit('leave-chat', chatId);
        socket.off('message-received', handleMessageReceived);
        socket.off('user-typing', handleUserTyping);
      };
    }
  }, [chatId, socket, user?.id, API_URL, messages]);

  const fetchChatData = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/chat/${chatId}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setChat(data.chat);
        setMessages(data.messages);
        setPublicLink(data.chat.public_link || '');
      } else {
        toast.error('Failed to load chat');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Failed to load chat');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [chatId, headers, navigate]);

  useEffect(() => {
    if (chatId) {
      if (state?.title && state?.ownerUsername) {
        setChat({
          id: parseInt(chatId),
          title: state.title,
          owner_id: user?.id || 0, // Placeholder, fetch real owner_id if needed
          is_public: true,
          public_link: '',
          owner_username: state.ownerUsername,
        });
        fetchChatData(); // Still fetch to get full data
      } else {
        fetchChatData();
      }
    }
  }, [fetchChatData, chatId, state]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || sendMessageTriggered.current) return;

    sendMessageTriggered.current = true;
    setIsSending(true);

    try {
      const contextMessages = selectedMessages.map(id => {
        const msg = messages.find(m => m.id === id);
        return msg ? `${msg.username}: ${msg.content}` : '';
      }).filter(Boolean);

      const response = await fetch(`${API_URL}/chat/${chatId}/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: newMessage,
          contextMessageIds: contextMessages.length > 0 ? selectedMessages : []
        })
      });

      if (response.ok) {
        const data = await response.json();
        const messagesWithUsernames = [
          { ...data.userMessage, username: user?.username || 'Anonymous' },
          ...(data.aiMessage ? [{ ...data.aiMessage, username: 'AI Assistant' }] : [])
        ];

        // Update state with new messages from API (primary source)
        setMessages(prev => {
          const updatedMessages = [...prev, ...messagesWithUsernames];
          return updatedMessages.filter((msg, index, self) =>
            index === self.findIndex(m => m.id === msg.id)
          ); // Deduplicate by ID
        });

        if (socket) {
          messagesWithUsernames.forEach(msg => {
            socket.emit('new-message', {
              chatId,
              message: {
                ...msg,
                username: user?.username || 'Anonymous'
              }
            });
          });
        }

        setNewMessage('');
        setSelectedMessages([]);
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Send message error:', error);
    } finally {
      setIsSending(false);
      sendMessageTriggered.current = false; // Reset flag
    }
  }, [newMessage, isSending, selectedMessages, messages, chatId, headers, user?.username, socket]);

  const handleGeneratePublicLink = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/chat/${chatId}/public-link`, {
        method: 'POST',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setPublicLink(data.publicLink);
        toast.success('Public link generated!');
      } else {
        toast.error('Failed to generate public link');
      }
    } catch (error) {
      toast.error('Failed to generate public link');
    }
  }, [chatId, headers]);

  const handleShareWithEmails = useCallback(async (emails: string[]) => {
    try {
      const response = await fetch(`${API_URL}/chat/${chatId}/share`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ emails })
      });

      if (response.ok) {
        toast.success('Chat shared successfully!');
      } else {
        toast.error('Failed to share chat');
      }
    } catch (error) {
      toast.error('Failed to share chat');
    }
  }, [chatId, headers]);

  const copyPublicLink = useCallback(() => {
    const fullLink = `${window.location.origin}/public/${publicLink}`;
    navigator.clipboard.writeText(fullLink);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  }, [publicLink]);

  const toggleMessageSelection = useCallback((messageId: number) => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  }, []);

  const handleBackToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handleOpenShareModal = useCallback(() => {
    setIsShareModalOpen(true);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setIsShareModalOpen(false);
  }, []);

  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    if (socket && chatId) {
      socket.emit('typing-start', chatId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing-stop', chatId);
      }, 2000);
    }
  }, [socket, chatId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
      if (socket && chatId) {
        socket.emit('typing-stop', chatId);
      }
    }
  }, [handleSendMessage, socket, chatId]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleBackToDashboard}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors mr-4"
            >
              <ArrowLeft className="h-5 w-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-white">{chat?.title || 'Loading...'}</h1>
              <p className="text-sm text-gray-400">
                by {chat?.owner_username || 'Unknown'}
                {selectedMessages.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                    {selectedMessages.length} selected for context
                  </span>
                )}
              </p>
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center space-x-2">
              {publicLink && (
                <button
                  onClick={copyPublicLink}
                  className="flex items-center px-3 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? <span className='hidden md:inline-block'>Copied!</span> : <span className='hidden md:inline-block'>Copy Link</span>}
                </button>
              )}
              <button
                onClick={handleOpenShareModal}
                className="flex items-center px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                <Share2 className="h-4 w-4 mr-1" />
                <span className='hidden md:inline-block'>Share</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <MessageList
          messages={messages}
          selectedMessages={selectedMessages}
          onToggleMessageSelection={toggleMessageSelection}
        />
        {typingUsers.filter(u => u.isTyping && u.userId !== user?.id).length > 0 && (
          <div className="max-w-4xl mx-auto mt-4 text-gray-400 text-sm flex items-center">
            <span>
              {typingUsers
                .filter(u => u.isTyping && u.userId !== user?.id)
                .map(u => u.username)
                .join(', ')} {typingUsers.filter(u => u.isTyping && u.userId !== user?.id).length > 1 ? 'are' : 'is'} typing
            </span>
            <span className="ml-1 flex space-x-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce delay-100">.</span>
              <span className="animate-bounce delay-200">.</span>
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={handleMessageChange}
                placeholder="Type your message..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                rows={1}
                onKeyDown={handleKeyDown}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </motion.button>
          </form>
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={handleCloseShareModal}
        onGeneratePublicLink={handleGeneratePublicLink}
        onShareWithEmails={handleShareWithEmails}
        publicLink={publicLink}
        hasPublicLink={!!publicLink}
      />
    </div>
  );
};