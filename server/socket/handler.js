import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const handleSocketConnection = (socket, io) => {
  // Authenticate socket connection
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // ADDED: Logging for socket authentication
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      socket.email = decoded.email;
      socket.emit('authenticated', { success: true });
    } catch (error) {
      // ADDED: Detailed error logging
      console.error(`Socket auth error: ${error.message}, socketId=${socket.id}`);
      socket.emit('authenticated', { success: false, error: 'Invalid token' });
    }
  });

  // Join chat room
  socket.on('join-chat', (chatId) => {
    // ADDED: Logging for room joining
    socket.join(`chat-${chatId}`);
  });

  // Leave chat room
  socket.on('leave-chat', (chatId) => {
    // ADDED: Logging for room leaving
    socket.leave(`chat-${chatId}`);
  });

  // Handle new messages
  socket.on('new-message', (data) => {
    const { chatId, message } = data;
    // ADDED: Logging for message broadcasting
    io.to(`chat-${chatId}`).emit('message-received', {
      ...message,
      username: socket.username
    });
  });

  // Handle typing indicators
  socket.on('typing-start', (chatId) => {
    // ADDED: Logging for typing start
    socket.to(`chat-${chatId}`).emit('user-typing', {
      userId: socket.userId,
      username: socket.username,
      isTyping: true
    });
  });

  socket.on('typing-stop', (chatId) => {
    // ADDED: Logging for typing stop
    socket.to(`chat-${chatId}`).emit('user-typing', {
      userId: socket.userId,
      username: socket.username,
      isTyping: false
    });
  });

  // ADDED: Logging for disconnections
  socket.on('disconnect', () => {
    console.log(`User disconnected: socketId=${socket.id}, userId=${socket.userId}`);
  });
};