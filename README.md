# 🤖 MilonAI Collaborative AI Chat Application

A modern, full-stack collaborative AI chat application built with React, Node.js, PostgreSQL, and Socket.IO. Create, share, and collaborate on AI conversations in real-time with beautiful UI and seamless user experience.

![Chat Application](https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## ✨ Features

### 🔐 Authentication & Security
- **Secure User Registration & Login** - JWT-based authentication with bcrypt password hashing
- **Protected Routes** - Role-based access control for all chat operations
- **Session Management** - Persistent login sessions with automatic token refresh

### 💬 Chat Management
- **Multiple Chat Sessions** - Create and manage unlimited AI conversations
- **AI-Powered Responses** - Integration with Google's Gemini AI for intelligent responses
- **Markdown Support** - Rich text rendering for AI responses with code highlighting
- **Context Selection** - Select previous messages as context for enhanced AI conversations
- **Real-time Updates** - Live message synchronization across all participants

### 🤝 Collaboration Features
- **Public Link Sharing** - Generate shareable links for open collaboration
- **Private Email Sharing** - Invite specific users via email addresses
- **Multi-user Real-time Chat** - WebSocket-powered live collaboration
- **User Attribution** - See who contributed each message with timestamps
- **Typing Indicators** - Real-time typing status for active participants

### 🧭 Organized Navigation
- **My Chats** - Personal chat sessions you've created
- **Shared With Me** - Chats shared directly via your email
- **Joined Public Chats** - Public conversations you've participated in
- **Smart Categorization** - Automatic organization with message counts and last activity

### 🎨 Beautiful Design
- **Modern UI/UX** - Glassmorphism effects with gradient backgrounds
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Smooth Animations** - Framer Motion powered transitions and micro-interactions
- **Dark Theme** - Professional dark interface with proper contrast ratios
- **Intuitive Interface** - Clean typography and thoughtful spacing throughout

## 🌟 Future Features
- **Image Prompts** - Upload images to use as visual prompts for AI responses
- **Voice Prompts** - Speak to the AI with voice input support
- **Image Responses** - Get AI-generated images as chat responses
- **Voice Responses** - Receive AI responses as audio output

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development with full IntelliSense support
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing with protected routes
- **Socket.IO Client** - Real-time WebSocket communication
- **React Markdown** - Markdown rendering for AI responses
- **React Hot Toast** - Beautiful notification system
- **Lucide React** - Modern icon library

### Backend
- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Fast, unopinionated web framework
- **Socket.IO** - Real-time bidirectional event-based communication
- **PostgreSQL** - Robust relational database with ACID compliance
- **JWT** - JSON Web Tokens for secure authentication
- **bcryptjs** - Password hashing and salt generation
- **Google Generative AI** - Integration with Gemini AI model
- **CORS** - Cross-origin resource sharing configuration
- **dotenv** - Environment variable management

### Development Tools
- **Vite** - Fast build tool and development server
- **TypeScript** - Static type checking and enhanced IDE support
- **ESLint** - Code linting and style enforcement
- **Concurrently** - Run multiple npm scripts simultaneously
- **Nodemon** - Automatic server restart during development

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **Google AI API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Al-Amin-Khan-Shakil/milon-ai.git
   cd milon-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb your_database_name

   # Or using psql
   psql -U postgres
   CREATE DATABASE your_database_name;
   ```

4. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit .env with your configuration
   nano .env
   ```

5. **Configure Environment Variables**
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=your_database_name
   DB_USER=your-user
   DB_PASSWORD=your_password

   # JWT Secret (generate a secure random string)
   JWT_SECRET=your-super-secure-jwt-secret-key

   # Google AI API Key
   GOOGLE_AI_API_KEY=your-google-ai-api-key

   # Server Port
   PORT=3001
   ```

6. **Start the application**
   ```bash
   # Development mode (starts both client and server)
   npm run dev

   # Or start individually
   npm run dev:client  # Frontend only
   npm run dev:server  # Backend only
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
collaborative-ai-chat/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   │   ├── ChatList.tsx         # Chat list with cards
│   │   ├── CreateChatModal.tsx  # New chat creation modal
│   │   ├── MessageBubble.tsx    # Individual message component
│   │   ├── ShareModal.tsx       # Chat sharing interface
│   │   ├── ProtectedRoute.tsx   # Authentication guard
│   │   └── PublicRoute.tsx      # Public route guard
│   ├── contexts/                # React context providers
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── SocketContext.tsx    # WebSocket connection
│   ├── pages/                   # Main application pages
│   │   ├── Login.tsx           # User login page
│   │   ├── Register.tsx        # User registration page
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Chat.tsx           # Individual chat interface
│   │   └── PublicChat.tsx     # Public chat access
│   ├── App.tsx                 # Main application component
│   └── main.tsx               # Application entry point
├── server/                     # Backend Node.js application
│   ├── database/              # Database configuration
│   │   └── init.js           # Database initialization
│   ├── middleware/           # Express middleware
│   │   └── auth.js          # JWT authentication
│   ├── routes/              # API route handlers
│   │   ├── auth.js         # Authentication routes
│   │   └── chat.js        # Chat management routes
│   ├── socket/            # WebSocket handlers
│   │   └── handler.js    # Socket.IO event handling
│   └── index.js         # Server entry point
├── package.json        # Dependencies and scripts
├── .env.example       # Environment template
└── README.md         # Project documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Chat Management
- `GET /api/chat/my-chats` - Get user's created chats
- `GET /api/chat/shared-with-me` - Get chats shared with user
- `GET /api/chat/joined-public` - Get joined public chats
- `POST /api/chat/create` - Create new chat
- `GET /api/chat/:chatId` - Get chat details and messages
- `POST /api/chat/:chatId/message` - Send message to chat
- `POST /api/chat/:chatId/public-link` - Generate public sharing link
- `POST /api/chat/:chatId/share` - Share chat with email addresses
- `POST /api/chat/public/:publicLink/join` - Join public chat via link

### WebSocket Events
- `authenticate` - Authenticate socket connection
- `join-chat` / `leave-chat` - Join/leave chat rooms
- `new-message` - Broadcast new messages
- `message-received` - Receive real-time messages
- `typing-start` / `typing-stop` - Typing indicators
- `user-typing` - Receive typing status

## 🎯 Usage Guide

### Creating Your First Chat
1. **Register/Login** to your account
2. **Click "New Chat"** on the dashboard
3. **Enter a descriptive title** for your conversation
4. **Start chatting** with the AI assistant

### Sharing Chats
1. **Open any chat** you've created
2. **Click the "Share" button** in the header
3. **Choose sharing method:**
   - **Public Link**: Generate a link anyone can access
   - **Email Sharing**: Invite specific users by email

### Using Context Selection
1. **Click the checkmark** next to any message
2. **Selected messages** appear highlighted
3. **Send your next message** - AI will use selected context
4. **Clear selection** by unchecking messages

### Real-time Collaboration
- **Multiple users** can join the same chat
- **See live typing indicators** when others are typing
- **Messages appear instantly** for all participants
- **User attribution** shows who sent each message

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds for secure storage
- **JWT Authentication** - Stateless token-based authentication
- **Access Control** - Route-level permissions for chat access
- **Input Validation** - Server-side validation for all inputs
- **CORS Configuration** - Controlled cross-origin requests
- **SQL Injection Prevention** - Parameterized queries throughout

## 🚀 Deployment

### Production Build
```bash
# Build frontend for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_NAME=your-production-db-name
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
JWT_SECRET=your-super-secure-production-jwt-secret
GOOGLE_AI_API_KEY=your-google-ai-api-key
PORT=3001
```

### Database Migration
The application automatically creates required tables on startup:
- `users` - User accounts and authentication
- `chats` - Chat sessions and metadata
- `messages` - Individual messages and AI responses
- `chat_participants` - User participation tracking
- `chat_shares` - Email-based sharing permissions

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## ✍️ Authers
👤 **Al Amin Khan Shakil**

- GitHub: [Al Amin Khan Shakil](https://github.com/Al-Amin-Khan-Shakil)
- Twitter: [Al Amin Khan Shakil](https://twitter.com/AlAminKhan85004)
- LinkedIn: [Al Amin Khan Shakil](https://www.linkedin.com/in/al-amin-khan-shakil/)


## 🙏 Acknowledgments

- **Google AI** for providing the Gemini API
- **Socket.IO** for real-time communication capabilities
- **React Team** for the amazing frontend framework
- **Tailwind CSS** for the utility-first styling approach
- **Framer Motion** for smooth animations and transitions

## 📞 Support

If you encounter any issues or have questions:

1. **Check the Issues** section for existing solutions
2. **Create a new Issue** with detailed information
3. **Include error logs** and steps to reproduce
4. **Specify your environment** (OS, Node.js version, etc.)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using modern web technologies**