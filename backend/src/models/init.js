const db = require('../config/db');

const createTables = async () => {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      is_verified BOOLEAN DEFAULT FALSE,
      verification_token VARCHAR(255),
      token_expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const connectedAccountsTable = `
    CREATE TABLE IF NOT EXISTS connected_accounts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      platform VARCHAR(50) NOT NULL, -- e.g., 'threads', 'twitter'
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      token_expires_at TIMESTAMP,
      platform_user_id VARCHAR(255),
      platform_username VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, platform)
    );
  `;

  const postsTable = `
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      platform VARCHAR(50) NOT NULL,
      platform_post_id VARCHAR(255) NOT NULL,
      content TEXT,
      media_url TEXT,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      views_count INTEGER DEFAULT 0,
      published_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, platform, platform_post_id)
    );
  `;

  const analyticsHistoryTable = `
    CREATE TABLE IF NOT EXISTS analytics_history (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      platform VARCHAR(50) NOT NULL,
      follower_count INTEGER DEFAULT 0,
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await db.query(usersTable);
  await db.query(connectedAccountsTable);
  await db.query(postsTable);
  await db.query(analyticsHistoryTable);
};

const initDB = async () => {
  try {
    // Check if db exists logic or assume it exists based on config
    await createTables();
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = { initDB };
