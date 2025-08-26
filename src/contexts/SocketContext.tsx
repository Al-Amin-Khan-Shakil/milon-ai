import React, { createContext, useContext, useEffect, useState } from 'react';
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

  // Define Socket.IO URL using environment variable
  // CHANGED: Updated default port to 10000 to match server
  const SOCKET_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (token && user) {
      // ADDED: Log Socket.IO URL
      const newSocket = io(SOCKET_URL, {
        auth: { token }, // Send token during connection
      });

      const handleConnect = () => {
        // ADDED: Log connection
        setIsConnected(true);
        newSocket.emit('authenticate', token);
      };

      const handleDisconnect = () => {
        // ADDED: Log disconnection
        setIsConnected(false);
      };

      const handleAuthenticated = (data: { success: boolean; error?: string }) => {
        // ADDED: Log authentication response
        console.log('Socket authentication response:', data);
        if (!data.success) {
          console.error('Socket authentication failed:', data.error);
        }
      };

      // ADDED: Handle and log connection errors
      const handleConnectError = (err: Error) => {
        console.error('Socket connection error:', err.message);
      };

      newSocket.on('connect', handleConnect);
      newSocket.on('disconnect', handleDisconnect);
      newSocket.on('authenticated', handleAuthenticated);
      newSocket.on('connect_error', handleConnectError);

      setSocket(newSocket);

      return () => {
        newSocket.off('connect', handleConnect);
        newSocket.off('disconnect', handleDisconnect);
        newSocket.off('authenticated', handleAuthenticated);
        newSocket.off('connect_error', handleConnectError);
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [token, user, SOCKET_URL]);

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