import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../database/init.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Create new chat
router.post('/create', async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.userId;

    const result = await pool.query(
      'INSERT INTO chats (title, owner_id) VALUES ($1, $2) RETURNING *',
      [title || 'New Chat', userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's chats
router.get('/my-chats', async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM messages WHERE chat_id = c.id) as message_count,
        (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
       FROM chats c 
       WHERE c.owner_id = $1 
       ORDER BY c.updated_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get my chats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get shared chats
router.get('/shared-with-me', async (req, res) => {
  try {
    const userEmail = req.user.email;

    const result = await pool.query(
      `SELECT c.*, u.username as owner_username,
        (SELECT COUNT(*) FROM messages WHERE chat_id = c.id) as message_count,
        (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
       FROM chats c 
       JOIN chat_shares cs ON c.id = cs.chat_id
       JOIN users u ON c.owner_id = u.id
       WHERE cs.shared_with_email = $1 
       ORDER BY c.updated_at DESC`,
      [userEmail]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get shared chats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get joined public chats
router.get('/joined-public', async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT c.*, u.username as owner_username,
        (SELECT COUNT(*) FROM messages WHERE chat_id = c.id) as message_count,
        (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
       FROM chats c 
       JOIN chat_participants cp ON c.id = cp.chat_id
       JOIN users u ON c.owner_id = u.id
       WHERE cp.user_id = $1 AND c.owner_id != $1 AND c.is_public = true
       ORDER BY c.updated_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get joined public chats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chat details
router.get('/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;
    const userEmail = req.user.email;

    // Check access permissions
    const accessCheck = await pool.query(
      `SELECT c.*, u.username as owner_username
       FROM chats c
       JOIN users u ON c.owner_id = u.id
       WHERE c.id = $1 AND (
         c.owner_id = $2 OR 
         c.is_public = true OR
         EXISTS (SELECT 1 FROM chat_shares WHERE chat_id = $1 AND shared_with_email = $3)
       )`,
      [chatId, userId, userEmail]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get messages with user information
    const messages = await pool.query(
      `SELECT m.*, u.username 
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.chat_id = $1 
       ORDER BY m.created_at ASC`,
      [chatId]
    );

    res.json({
      chat: accessCheck.rows[0],
      messages: messages.rows
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message
router.post('/:chatId/message', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, contextMessages = [] } = req.body;
    const userId = req.user.userId;
    const userEmail = req.user.email;

    // Check access permissions
    const accessCheck = await pool.query(
      `SELECT * FROM chats 
       WHERE id = $1 AND (
         owner_id = $2 OR 
         is_public = true OR
         EXISTS (SELECT 1 FROM chat_shares WHERE chat_id = $1 AND shared_with_email = $3)
       )`,
      [chatId, userId, userEmail]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Add user to participants if not already
    await pool.query(
      'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [chatId, userId]
    );

    // Save user message
    const userMessage = await pool.query(
      'INSERT INTO messages (chat_id, user_id, content, context_messages) VALUES ($1, $2, $3, $4) RETURNING *',
      [chatId, userId, content, contextMessages]
    );

    // Generate AI response
    try {
      let prompt = content;
      if (contextMessages.length > 0) {
        prompt = `Context: ${contextMessages.join('\n\n')}\n\nUser question: ${content}`;
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiResponse = response.text();

      // Save AI response
      const aiMessage = await pool.query(
        'INSERT INTO messages (chat_id, user_id, content, message_type) VALUES ($1, $2, $3, $4) RETURNING *',
        [chatId, userId, aiResponse, 'ai']
      );

      // Update chat timestamp
      await pool.query(
        'UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [chatId]
      );

      res.json({
        userMessage: userMessage.rows[0],
        aiMessage: aiMessage.rows[0]
      });
    } catch (aiError) {
      console.error('AI generation error:', aiError);
      
      // Save error message
      const errorMessage = await pool.query(
        'INSERT INTO messages (chat_id, user_id, content, message_type) VALUES ($1, $2, $3, $4) RETURNING *',
        [chatId, userId, 'I apologize, but I encountered an error generating a response. Please make sure your Google AI API key is configured correctly.', 'ai']
      );

      res.json({
        userMessage: userMessage.rows[0],
        aiMessage: errorMessage.rows[0]
      });
    }
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate public link
router.post('/:chatId/public-link', async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    // Check if user owns the chat
    const chat = await pool.query(
      'SELECT * FROM chats WHERE id = $1 AND owner_id = $2',
      [chatId, userId]
    );

    if (chat.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const publicLink = uuidv4();

    await pool.query(
      'UPDATE chats SET public_link = $1, is_public = true WHERE id = $2',
      [publicLink, chatId]
    );

    res.json({ publicLink });
  } catch (error) {
    console.error('Generate public link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Share with email
router.post('/:chatId/share', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { emails } = req.body;
    const userId = req.user.userId;

    // Check if user owns the chat
    const chat = await pool.query(
      'SELECT * FROM chats WHERE id = $1 AND owner_id = $2',
      [chatId, userId]
    );

    if (chat.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Share with each email
    for (const email of emails) {
      await pool.query(
        'INSERT INTO chat_shares (chat_id, shared_with_email, shared_by_user_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [chatId, email, userId]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Share chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Access public chat
router.post('/public/:publicLink/join', async (req, res) => {
  try {
    const { publicLink } = req.params;
    const userId = req.user.userId;

    const chat = await pool.query(
      'SELECT * FROM chats WHERE public_link = $1 AND is_public = true',
      [publicLink]
    );

    if (chat.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const chatId = chat.rows[0].id;

    // Add user to participants
    await pool.query(
      'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [chatId, userId]
    );

    res.json({ chatId });
  } catch (error) {
    console.error('Join public chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;