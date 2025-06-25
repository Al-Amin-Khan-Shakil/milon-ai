import React, { memo, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Check } from 'lucide-react';

interface Message {
  id: number;
  content: string;
  message_type: 'user' | 'ai';
  username: string;
  user_id: number;
  created_at: string;
}

interface MessageBubbleProps {
  message: Message;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  showSelection?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = memo(({
  message,
  isSelected = false,
  onToggleSelect,
  showSelection = false
}) => {
  const isAI = message.message_type === 'ai';
  
  const formattedTime = useMemo(() => {
    return new Date(message.created_at).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, [message.created_at]);

  const handleToggleSelect = useCallback(() => {
    onToggleSelect?.();
  }, [onToggleSelect]);

  const avatarIcon = useMemo(() => {
    return isAI ? <Bot className="h-5 w-5 text-white" /> : <User className="h-5 w-5 text-white" />;
  }, [isAI]);

  const avatarClasses = useMemo(() => {
    return `w-10 h-10 rounded-full flex items-center justify-center ${
      isAI 
        ? 'bg-gradient-to-r from-emerald-500 to-blue-600' 
        : 'bg-gradient-to-r from-blue-500 to-purple-600'
    }`;
  }, [isAI]);

  const messageClasses = useMemo(() => {
    return `
      p-4 rounded-2xl backdrop-blur-sm border transition-all
      ${isSelected ? 'ring-2 ring-blue-500' : ''}
      ${isAI 
        ? 'bg-white/5 border-white/10 rounded-tl-sm' 
        : 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-blue-500/30 rounded-tr-sm'
      }
    `;
  }, [isAI, isSelected]);

  const selectButtonClasses = useMemo(() => {
    return `ml-2 p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
      isSelected 
        ? 'bg-blue-500 text-white' 
        : 'bg-white/10 text-gray-400 hover:bg-white/20'
    }`;
  }, [isSelected]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4 group`}
    >
      <div className={`flex max-w-3xl ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isAI ? 'mr-3' : 'ml-3'}`}>
          <div className={avatarClasses}>
            {avatarIcon}
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-grow">
          <div className={`flex items-center mb-1 ${isAI ? 'justify-start' : 'justify-end'}`}>
            <span className="text-sm text-gray-400 font-medium">
              {message.username}
            </span>
            <span className="text-xs text-gray-500 ml-2">
              {formattedTime}
            </span>
            {showSelection && onToggleSelect && (
              <button
                onClick={handleToggleSelect}
                className={selectButtonClasses}
              >
                <Check className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <div className={messageClasses}>
            {isAI ? (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown className="text-gray-100">
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-white whitespace-pre-wrap">
                {message.content}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

MessageBubble.displayName = 'MessageBubble';