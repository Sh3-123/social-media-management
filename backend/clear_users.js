require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
});

async function clearUsers() {
    try {
        console.log('Clearing users table...');
        await pool.query('TRUNCATE TABLE users CASCADE;');
        console.log('Successfully cleared users and related data.');
    } catch (err) {
        console.error('Error clearing users:', err);
    } finally {
        pool.end();
    }
}

clearUsers();
