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

// ADDED: Configure allowed origins for Render deployment
const allowedOrigins = [
  process.env.FRONTEND_URL, // https://milon-ai.onrender.com
  'http://localhost:5173' // For local testing
].filter(Boolean);

const io = new Server(server, {
  cors: {
    // CHANGED: Dynamic origin handling for CORS
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`CORS error: Origin ${origin} not allowed`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
  },
});

// Middleware
// CHANGED: Updated CORS middleware for Render
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`Express CORS error: Origin ${origin} not allowed`);
      callback(new Error('Not allowed by CORS'));
    }
  },
}));
app.use(express.json());

// Serve static files from Vite's dist folder
app.use(express.static(path.join(__dirname, '../dist')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);

// Socket.IO connection handling
// ADDED: Logging for WebSocket connections
io.on('connection', (socket) => {
  console.log('New WebSocket connection:', socket.id);
  handleSocketConnection(socket, io);
});

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