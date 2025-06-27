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
    try {
      return new Date(message.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  }, [message.created_at]);

  const handleToggleSelect = useCallback(() => {
    onToggleSelect?.();
  }, [onToggleSelect]);

  const avatarIcon = useMemo(() => {
    return isAI ? <Bot className="md:h-5 md:w-5 text-white h-3 w-3" /> : <User className="md:h-5 md:w-5 text-white h-3 w-3" />;
  }, [isAI]);

  const avatarClasses = useMemo(() => {
    return `w-5 h-5 rounded-full flex items-center justify-center md:w-10 md:h-10 ${
      isAI
        ? 'bg-gradient-to-r from-emerald-500 to-blue-600'
        : 'bg-gradient-to-r from-blue-500 to-purple-600'
    }`;
  }, [isAI]);

  const messageClasses = useMemo(() => {
    return `
      p-4 rounded-2xl backdrop-blur-sm border transition-all w-fit max-w-[calc(100%-3rem)]
      ${isSelected ? 'ring-2 ring-blue-500' : ''}
      ${isAI
        ? 'bg-white/5 border-white/10 rounded-tl-sm'
        : 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-blue-500/30 rounded-tr-sm'}
      }
    `;
  }, [isAI, isSelected]);

  const selectButtonClasses = useMemo(() => {
    return `ml-2 p-1 rounded-full transition-all opacity-1 group-hover:opacity-100 ${
      isSelected
        ? 'bg-blue-500 text-white'
        : 'bg-white/10 text-gray-400 hover:bg-white/20'
    }`;
  }, [isSelected]);

  // Safe content rendering
  const renderContent = () => {
    try {
      if (isAI) {
        return (
          <ReactMarkdown
            className="text-gray-100 w-full"
            components={{
              p({ children }) {
                return <p className="my-2 leading-relaxed text-gray-200">{children}</p>;
              },
              ol({ children }) {
                return <ol className="ml-2 my-1 text-gray-200">{children}</ol>;
              },
              ul({ children }) {
                return <ul className="ml-2 my-1 text-gray-200">{children}</ul>;
              },
              li({ children }) {
                return <li className="mb-1">{children}</li>;
              },
              code({ inline, children }) {
                return inline ? (
                  <code className="bg-gray-700/50 rounded px-1 py-0.5">{children}</code>
                ) : (
                  <pre className="bg-gray-800/80 p-3 rounded my-2 overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    <code className="text-sm whitespace-pre">{children}</code>
                  </pre>
                );
              },
              pre({ children }) {
                return <div className="my-2 w-full">{children}</div>;
              },
              table({ children }) {
                return <div className="overflow-x-auto my-2 w-full"><table className="w-full">{children}</table></div>;
              },
              blockquote({ children }) {
                return <blockquote className="border-l-4 border-gray-500 pl-4 my-2 italic">{children}</blockquote>;
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        );
      }
      return <p className="text-white whitespace-pre-wrap w-full">{message.content}</p>;
    } catch (error) {
      console.error('Error rendering message:', error);
      return <p className="text-white whitespace-pre-wrap w-full">{message.content}</p>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4 group w-full`}
    >
      <div className={`flex w-full max-w-4xl ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isAI ? 'mr-1 md:mr-3' : 'ml-1 md:ml-3'}`}>
          <div className={avatarClasses}>
            {avatarIcon}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex-grow w-full flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
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
            {renderContent()}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

MessageBubble.displayName = 'MessageBubble';