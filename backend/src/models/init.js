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

    await db.query(usersTable);
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
