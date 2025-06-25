import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

export const initializeDatabase = async () => {
  try {
    // Enable uuid-ossp extension
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
        public_link VARCHAR(255) UNIQUE,
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'user',
        context_messages TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_participants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(chat_id, user_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_shares (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
        shared_with_email VARCHAR(255) NOT NULL,
        shared_by_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(chat_id, shared_with_email)
      )
    `);

    // Create index for efficient message retrieval
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_chat_id_created_at
      ON messages (chat_id, created_at DESC)
    `);

    console.log('Database initialized successfully with uuid-ossp extension');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

export { pool };