const path = require('path');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const db = require('../config/db');

const resetDB = async () => {
    console.log('Starting Database Reset...');
    try {
        // Drop all tables in reverse order of dependencies
        await db.query('DROP TABLE IF EXISTS analytics_history CASCADE');
        await db.query('DROP TABLE IF EXISTS posts CASCADE');
        await db.query('DROP TABLE IF EXISTS connected_accounts CASCADE');
        await db.query('DROP TABLE IF EXISTS users CASCADE');

        console.log('All tables dropped successfully.');

        // Re-run initialization to create fresh tables
        const { initDB } = require('../models/init');
        await initDB();

        console.log('Database reset and re-initialized successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }
};

resetDB();
