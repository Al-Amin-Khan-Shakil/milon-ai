import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../database/init.js';
import axios from 'axios';

const router = express.Router();

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
    const { content, contextMessageIds = [] } = req.body;
    const userId = req.user.userId;
    const userEmail = req.user.email;

    // Validate input
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Invalid content' });
    }

    if (!Array.isArray(contextMessageIds)) {
      return res.status(400).json({ error: 'contextMessageIds must be an array' });
    }

    // Fetch username
    const userResult = await pool.query(
      'SELECT username FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUsername = userResult.rows[0].username;

    // Check access permissions
    const accessCheck = await pool.query(
      `SELECT * FROM chats c
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

    // Add user to participants if not already
    await pool.query(
      'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [chatId, userId]
    );

    // Fetch context messages
    let contextMessages = [];
    let contextResult;

    if (contextMessageIds.length > 0) {

      // Fetch specific messages by IDs
      contextResult = await pool.query(
        `SELECT m.content, u.username
         FROM messages m
         JOIN users u ON m.user_id = u.id
         WHERE m.chat_id = $1 AND m.id = ANY($2::uuid[])
         ORDER BY m.created_at ASC`,
        [chatId, contextMessageIds]
      );

      contextMessages = contextResult.rowCount > 0
        ? contextResult.rows.map(row => `${row.username}: ${row.content}`)
        : [];
    } else {

      // Fetch last 12 messages
      contextResult = await pool.query(
        `SELECT m.content, u.username
         FROM messages m
         JOIN users u ON m.user_id = u.id
         WHERE m.chat_id = $1
         ORDER BY m.created_at DESC
         LIMIT 12`,
        [chatId]
      );

      // Reverse to maintain chronological order
      contextMessages = contextResult.rowCount > 0
        ? contextResult.rows.map(row => `${row.username}: ${row.content}`).reverse()
        : [];
    }

    // Analyze context for different users
    let contextNote = '';
    if (contextMessages.length > 0 && contextResult.rowCount > 0) {
      const contextUsernames = [...new Set(contextResult.rows.map(row => row.username))]; // Unique usernames
      const otherUsers = contextUsernames.filter(username => username !== currentUsername);
      if (otherUsers.length > 0) {
        contextNote = `\nNote: The context includes messages from other users: ${otherUsers.join(', ')}. Mention specific users in your response only when necessary for clarity or relevance, based on the user's intent.`;
      }
    }

    // Save user message
    const userMessage = await pool.query(
      'INSERT INTO messages (chat_id, user_id, content, context_messages) VALUES ($1, $2, $3, $4) RETURNING *',
      [chatId, userId, content, contextMessages]
    );

    // Generate AI response
    try {
      // Structure the prompt for Google AI
      const contents = [
        {
          parts: [
            {
              text: contextMessages.length > 0
                ? `Context:\n${contextMessages.join('\n\n')}${contextNote}\n\n${currentUsername} asks: ${content}`
                : `${currentUsername} asks: ${content}`
            }
          ]
        }
      ];

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
        { contents },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const aiResponse = response.data.candidates[0].content.parts[0].text;

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

      // Fetch usernames for response
      const userMessageWithUsername = {
        ...userMessage.rows[0],
        username: currentUsername
      };
      const aiMessageWithUsername = {
        ...aiMessage.rows[0],
        username: currentUsername
      };

      res.json({
        userMessage: userMessageWithUsername,
        aiMessage: aiMessageWithUsername
      });
    } catch (aiError) {
      console.error('AI generation error:', aiError.response?.data || aiError.message, aiError.stack);
      const errorMessage = await pool.query(
        'INSERT INTO messages (chat_id, user_id, content, message_type) VALUES ($1, $2, $3, $4) RETURNING *',
        [chatId, userId, 'I apologize, but I encountered an error generating a response. Please check your Google AI API configuration.', 'ai']
      );

      res.json({
        userMessage: { ...userMessage.rows[0], username: currentUsername },
        aiMessage: { ...errorMessage.rows[0], username: currentUsername }
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

    // Fetch additional chat details
    const chatDetails = await pool.query(
      'SELECT id, title FROM chats WHERE id = $1',
      [chatId]
    );
    const owner = await pool.query(
      'SELECT username FROM users WHERE id = $1',
      [chat.rows[0].owner_id]
    );

    res.json({
      success: true,
      chatId: chatId,
      title: chatDetails.rows[0].title || 'Public Chat',
      ownerUsername: owner.rows[0]?.username || 'Unknown'
    });
  } catch (error) {
    console.error('Join public chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;