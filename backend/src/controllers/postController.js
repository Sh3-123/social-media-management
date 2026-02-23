const db = require('../config/db');
const { decrypt } = require('../utils/crypto');
const axios = require('axios');

const getPosts = async (req, res) => {
    const { platform, type } = req.query;
    const userId = req.user.id;

    try {
        let query = 'SELECT * FROM posts WHERE user_id = $1';
        let params = [userId];

        if (platform) {
            query += ' AND platform = $2';
            params.push(platform.toLowerCase());
        }

        if (type) {
            // type could be 'POST' or 'REPLY'
            query += ` AND post_type = $${params.length + 1}`;
            params.push(type);
        }

        query += ' ORDER BY published_at DESC';
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ message: 'Server error fetching posts' });
    }
};

const getPostById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM posts WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get post by id error:', error);
        res.status(500).json({ message: 'Server error fetching post' });
    }
};

const syncPosts = async (req, res) => {
    const { platform } = req.body;
    const userId = req.user.id;

    if (!platform || platform.toLowerCase() !== 'threads') {
        return res.status(400).json({ message: 'Only Threads sync is supported currently' });
    }

    try {
        // 1. Get encrypted token and user ID for this platform
        const accountResult = await db.query(
            'SELECT access_token, platform_user_id FROM connected_accounts WHERE user_id = $1 AND platform = $2',
            [userId, platform.toLowerCase()]
        );

        if (accountResult.rows.length === 0) {
            return res.status(404).json({ message: 'No connected account found for this platform' });
        }

        const { access_token: encryptedToken, platform_user_id: threadsUserId } = accountResult.rows[0];
        const accessToken = decrypt(encryptedToken);

        // 2. Fetch Threads (Posts)
        const threadsRes = await axios.get(`https://graph.threads.net/v1.0/${threadsUserId}/threads`, {
            params: {
                fields: 'id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,shortcode,thumbnail_url,is_quote_post',
                access_token: accessToken
            }
        });

        const threads = threadsRes.data.data || [];
        console.log(`Fetched ${threads.length} threads for syncing`);

        // 3. Fetch Replies (Comments)
        const repliesRes = await axios.get(`https://graph.threads.net/v1.0/${threadsUserId}/replies`, {
            params: {
                fields: 'id,text,username,permalink,timestamp,media_product_type,media_type,media_url,shortcode,thumbnail_url,is_quote_post,has_replies',
                access_token: accessToken
            }
        });

        const replies = repliesRes.data.data || [];
        console.log(`Fetched ${replies.length} replies for syncing`);

        // 4. Upsert Threads into DB
        for (const thread of threads) {
            await db.query(
                `INSERT INTO posts (user_id, platform, platform_post_id, content, media_url, published_at, post_type)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (user_id, platform, platform_post_id) DO UPDATE SET
                 content = EXCLUDED.content,
                 media_url = EXCLUDED.media_url,
                 published_at = EXCLUDED.published_at,
                 updated_at = CURRENT_TIMESTAMP`,
                [userId, platform.toLowerCase(), thread.id, thread.text, thread.media_url || null, thread.timestamp, 'POST']
            );
        }

        // 5. Upsert Replies into DB
        for (const reply of replies) {
            await db.query(
                `INSERT INTO posts (user_id, platform, platform_post_id, content, media_url, published_at, post_type)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (user_id, platform, platform_post_id) DO UPDATE SET
                 content = EXCLUDED.content,
                 media_url = EXCLUDED.media_url,
                 published_at = EXCLUDED.published_at,
                 updated_at = CURRENT_TIMESTAMP`,
                [userId, platform.toLowerCase(), reply.id, reply.text, reply.media_url || null, reply.timestamp, 'REPLY']
            );
        }

        res.json({
            message: `Successfully synced ${platform} content`,
            stats: { posts: threads.length, comments: replies.length }
        });
    } catch (error) {
        console.error('Sync posts error:', error.response?.data || error.message);
        res.status(500).json({
            message: 'Server error syncing content',
            details: error.response?.data?.error?.message || error.message
        });
    }
};

module.exports = { getPosts, getPostById, syncPosts };
