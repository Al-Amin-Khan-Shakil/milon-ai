import jwt from 'jsonwebtoken';

export const handleSocketConnection = (socket, io) => {
  console.log('User connected:', socket.id);

  // Authenticate socket connection
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      socket.email = decoded.email;
      
      socket.emit('authenticated', { success: true });
    } catch (error) {
      socket.emit('authenticated', { success: false, error: 'Invalid token' });
    }
  });

  // Join chat room
  socket.on('join-chat', (chatId) => {
    socket.join(`chat-${chatId}`);
    console.log(`User ${socket.username} joined chat ${chatId}`);
  });

  // Leave chat room
  socket.on('leave-chat', (chatId) => {
    socket.leave(`chat-${chatId}`);
    console.log(`User ${socket.username} left chat ${chatId}`);
  });

  // Handle new messages
  socket.on('new-message', (data) => {
    const { chatId, message } = data;
    
    // Broadcast to all users in the chat room
    socket.to(`chat-${chatId}`).emit('message-received', {
      ...message,
      username: socket.username
    });
  });

  // Handle typing indicators
  socket.on('typing-start', (chatId) => {
    socket.to(`chat-${chatId}`).emit('user-typing', {
      userId: socket.userId,
      username: socket.username,
      isTyping: true
    });
  });

  socket.on('typing-stop', (chatId) => {
    socket.to(`chat-${chatId}`).emit('user-typing', {
      userId: socket.userId,
      username: socket.username,
      isTyping: false
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
};