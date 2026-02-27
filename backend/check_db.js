require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

async function checkDB() {
    try {
        const users = await pool.query('SELECT * FROM users');
        console.log('Users:', users.rows.map(u => ({ id: u.id, email: u.email })));

        const accounts = await pool.query('SELECT * FROM connected_accounts WHERE platform = $1', ['youtube']);
        console.log('YouTube Accounts:', accounts.rows.map(a => ({ user_id: a.user_id, platform_username: a.platform_username, platform_user_id: a.platform_user_id })));

        for (const account of accounts.rows) {
            const posts = await pool.query('SELECT COUNT(*) FROM posts WHERE user_id = $1 AND platform = $2 AND post_type = $3', [account.user_id, 'youtube', 'POST']);
            console.log(`User ${account.user_id} has ${posts.rows[0].count} YouTube videos.`);

            const samplePosts = await pool.query('SELECT content FROM posts WHERE user_id = $1 AND platform = $2 AND post_type = $3 LIMIT 3', [account.user_id, 'youtube', 'POST']);
            console.log('Sample video titles:', samplePosts.rows.map(p => p.content));
        }

    } catch (err) {
        console.error('DB error', err);
    } finally {
        pool.end();
    }
}

checkDB();
