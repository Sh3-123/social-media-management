const db = require('../config/db');

const getAnalyticsOverview = async (req, res) => {
    const { platform } = req.query;
    const userId = req.user.id;

    try {
        // Fetch current stats (latest from history)
        const currentStats = await db.query(
            'SELECT * FROM analytics_history WHERE user_id = $1 AND platform = $2 ORDER BY recorded_at DESC LIMIT 1',
            [userId, platform]
        );

        // Fetch stats from 7 days ago for growth calculation
        const previousStats = await db.query(
            'SELECT * FROM analytics_history WHERE user_id = $1 AND platform = $2 AND recorded_at < NOW() - INTERVAL \'7 days\' ORDER BY recorded_at DESC LIMIT 1',
            [userId, platform]
        );

        // Fetch best performing post
        const bestPost = await db.query(
            'SELECT * FROM posts WHERE user_id = $1 AND platform = $2 ORDER BY likes_count DESC LIMIT 1',
            [userId, platform]
        );

        // Summary metrics
        const summary = await db.query(
            'SELECT SUM(likes_count) as total_likes, SUM(comments_count) as total_comments, SUM(views_count) as total_views FROM posts WHERE user_id = $1 AND platform = $2',
            [userId, platform]
        );

        res.json({
            current: currentStats.rows[0] || { follower_count: 0 },
            previous: previousStats.rows[0] || { follower_count: 0 },
            bestPost: bestPost.rows[0],
            summary: summary.rows[0] || { total_likes: 0, total_comments: 0, total_views: 0 }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ message: 'Server error fetching analytics' });
    }
};

const syncAnalytics = async (req, res) => {
    const { platform } = req.body;
    const userId = req.user.id;

    try {
        // Mock analytics sync
        const mockFollowers = Math.floor(Math.random() * 5000) + 10000;

        await db.query(
            'INSERT INTO analytics_history (user_id, platform, follower_count) VALUES ($1, $2, $3)',
            [userId, platform, mockFollowers]
        );

        res.json({ message: `Successfully synced ${platform} analytics` });
    } catch (error) {
        console.error('Sync analytics error:', error);
        res.status(500).json({ message: 'Server error syncing analytics' });
    }
};

module.exports = { getAnalyticsOverview, syncAnalytics };
