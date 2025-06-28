import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import { authenticateToken } from './middleware/auth.js';
import { initializeDatabase } from './database/init.js';
import { handleSocketConnection } from './socket/handler.js';

dotenv.config();

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));
app.use(express.json());

// Serve static files from Vite's dist folder
app.use(express.static(path.join(__dirname, '../dist')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => handleSocketConnection(socket, io));

// Catch-all route for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Initialize database
initializeDatabase();

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };