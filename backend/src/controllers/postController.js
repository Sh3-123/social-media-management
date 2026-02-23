const db = require('../config/db');

const getPosts = async (req, res) => {
    const { platform } = req.query;
    const userId = req.user.id;

    try {
        let query = 'SELECT * FROM posts WHERE user_id = $1';
        let params = [userId];

        if (platform) {
            query += ' AND platform = $2';
            params.push(platform);
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

    try {
        // In a real app, this would call the Threads/YouTube API using the stored token
        // For demonstration, we generate mock posts if they don't exist
        const mockPosts = [
            {
                id: `p1_${Date.now()}`,
                content: `🚀 Just launched my new social media management tool! #SaaS #Growth`,
                likes: 120,
                comments: 15,
                views: 1500,
                published_at: new Date(Date.now() - 3600000 * 2)
            },
            {
                id: `p2_${Date.now()}`,
                content: `What's your favorite platform for community building in 2026?`,
                likes: 85,
                comments: 42,
                views: 2100,
                published_at: new Date(Date.now() - 3600000 * 24)
            },
            {
                id: `p3_${Date.now()}`,
                content: `Check out our latest analytics deep-dive on YouTube!`,
                media_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
                likes: 340,
                comments: 28,
                views: 12000,
                published_at: new Date(Date.now() - 3600000 * 48)
            }
        ];

        for (const post of mockPosts) {
            await db.query(
                `INSERT INTO posts (user_id, platform, platform_post_id, content, media_url, likes_count, comments_count, views_count, published_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 ON CONFLICT (user_id, platform, platform_post_id) DO UPDATE SET
                 likes_count = EXCLUDED.likes_count,
                 comments_count = EXCLUDED.comments_count,
                 views_count = EXCLUDED.views_count`,
                [userId, platform, post.id, post.content, post.media_url || null, post.likes, post.comments, post.views, post.published_at]
            );
        }

        res.json({ message: `Successfully synced ${platform} posts` });
    } catch (error) {
        console.error('Sync posts error:', error);
        res.status(500).json({ message: 'Server error syncing posts' });
    }
};

module.exports = { getPosts, getPostById, syncPosts };
