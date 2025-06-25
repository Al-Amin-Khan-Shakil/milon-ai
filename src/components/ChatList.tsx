import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, User, Clock } from 'lucide-react';

interface Chat {
  id: number;
  title: string;
  message_count: number;
  last_message: string;
  updated_at: string;
  owner_username?: string;
  is_public?: boolean;
}

interface ChatListProps {
  chats: Chat[];
  showOwner?: boolean;
  onChatClick: (chatId: number) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  return date.toLocaleDateString();
};

const ChatCard = memo<{
  chat: Chat;
  index: number;
  showOwner: boolean;
  onChatClick: (chatId: number) => void;
}>(({ chat, index, showOwner, onChatClick }) => {
  const handleClick = React.useCallback(() => {
    onChatClick(chat.id);
  }, [chat.id, onChatClick]);

  const formattedDate = React.useMemo(() => formatDate(chat.updated_at), [chat.updated_at]);
  
  const truncatedMessage = React.useMemo(() => {
    if (!chat.last_message) return '';
    return chat.last_message.length > 100
      ? `${chat.last_message.substring(0, 100)}...`
      : chat.last_message;
  }, [chat.last_message]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-3 group-hover:from-blue-600 group-hover:to-purple-700 transition-all">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white truncate max-w-[200px]">
              {chat.title}
            </h3>
            {showOwner && chat.owner_username && (
              <div className="flex items-center text-sm text-gray-400 mt-1">
                <User className="h-3 w-3 mr-1" />
                {chat.owner_username}
              </div>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-500 bg-white/10 px-2 py-1 rounded-full">
          {chat.message_count} messages
        </span>
      </div>

      {truncatedMessage && (
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {truncatedMessage}
        </p>
      )}

      <div className="flex items-center text-xs text-gray-500">
        <Clock className="h-3 w-3 mr-1" />
        {formattedDate}
      </div>
    </motion.div>
  );
});

ChatCard.displayName = 'ChatCard';

export const ChatList: React.FC<ChatListProps> = memo(({
  chats,
  showOwner = false,
  onChatClick
}) => {
  if (chats.length === 0) {
    return (
      <div className="text-center py-16">
        <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-300 mb-2">No chats yet</h3>
        <p className="text-gray-500">Create your first chat to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {chats.map((chat, index) => (
        <ChatCard
          key={chat.id}
          chat={chat}
          index={index}
          showOwner={showOwner}
          onChatClick={onChatClick}
        />
      ))}
    </div>
  );
});

ChatList.displayName = 'ChatList';