import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    if (token && user) {
      const newSocket = io('http://localhost:3001');
      
      const handleConnect = () => {
        setIsConnected(true);
        newSocket.emit('authenticate', token);
      };

      const handleDisconnect = () => {
        setIsConnected(false);
      };

      const handleAuthenticated = (data: { success: boolean; error?: string }) => {
        if (!data.success) {
          console.error('Socket authentication failed:', data.error);
        }
      };

      newSocket.on('connect', handleConnect);
      newSocket.on('disconnect', handleDisconnect);
      newSocket.on('authenticated', handleAuthenticated);

      setSocket(newSocket);

      return () => {
        newSocket.off('connect', handleConnect);
        newSocket.off('disconnect', handleDisconnect);
        newSocket.off('authenticated', handleAuthenticated);
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [token, user]);

  const contextValue = React.useMemo(() => ({
    socket,
    isConnected
  }), [socket, isConnected]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};