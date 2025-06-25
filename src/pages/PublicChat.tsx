import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Chat } from './Chat';

export const PublicChat: React.FC = () => {
  const { publicLink } = useParams<{ publicLink: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isJoining, setIsJoining] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const joinPublicChat = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/chat/public/${publicLink}/join`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setChatId(data.chatId.toString());
          toast.success('Joined public chat successfully!');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to join chat');
        }
      } catch (error) {
        setError('Failed to join chat');
      } finally {
        setIsJoining(false);
      }
    };

    if (publicLink && token) {
      joinPublicChat();
    }
  }, [publicLink, token]);

  if (isJoining) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Joining Chat...</h2>
          <p className="text-gray-400">Please wait while we connect you to the chat</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="p-3 bg-red-500/20 rounded-full w-fit mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Unable to Join Chat</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (chatId) {
    // Render the Chat component with the joined chat ID
    return <Chat />;
  }

  return null;
};