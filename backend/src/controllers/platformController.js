const db = require('../config/db');
const { encrypt, decrypt } = require('../utils/crypto');
const axios = require('axios');
const youtubeService = require('../services/youtubeService');

const getConnectedAccounts = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT platform, platform_username, created_at FROM connected_accounts WHERE user_id = $1',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({ message: 'Server error fetching connected accounts' });
    }
};

const connectPlatform = async (req, res) => {
    let { platform, token, username, platform_user_id } = req.body;

    if (!platform || !token) {
        return res.status(400).json({ message: 'Platform and token are required' });
    }

    try {
        // Verification for Threads
        if (platform.toLowerCase() === 'threads') {
            try {
                const response = await axios.get('https://graph.threads.net/v1.0/me', {
                    params: {
                        fields: 'id,username,name',
                        access_token: token
                    }
                });

                if (response.data && response.data.id) {
                    platform_user_id = response.data.id;
                    username = response.data.username || response.data.name;
                    console.log(`Verified Threads account: ${username} (${platform_user_id})`);
                }
            } catch (err) {
                console.error('Threads verification failed:', err.response?.data || err.message);
                return res.status(401).json({
                    message: 'Invalid Threads access token. Please ensure it is a valid Long-Lived Access Token.',
                    details: err.response?.data?.error?.message
                });
            }
        } else if (platform.toLowerCase() === 'youtube') {
            // For YouTube, 'token' in the request body from frontend will actually be the channelId
            // since we don't use OAuth, we just rely on API key in backend.
            try {
                const channelDetails = await youtubeService.getChannelDetails(token);
                platform_user_id = channelDetails.id;
                username = channelDetails.title;
                token = 'dummy_token_not_used'; // We use backend API key
                console.log(`Verified YouTube account: ${username} (${platform_user_id})`);
            } catch (err) {
                console.error('YouTube verification failed:', err.message);
                return res.status(400).json({
                    message: 'Invalid YouTube channel ID or channel not found.',
                    details: err.message
                });
            }
        }

        const encryptedToken = encrypt(token);

        // Wipe old cached posts and analytics so the dashboard doesn't mix channels
        await db.query('DELETE FROM posts WHERE user_id = $1 AND platform = $2', [req.user.id, platform.toLowerCase()]);
        await db.query('DELETE FROM analytics_history WHERE user_id = $1 AND platform = $2', [req.user.id, platform.toLowerCase()]);

        // Use upsert logic
        await db.query(
            `INSERT INTO connected_accounts (user_id, platform, access_token, platform_username, platform_user_id, updated_at)
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
             ON CONFLICT (user_id, platform) 
             DO UPDATE SET 
                access_token = EXCLUDED.access_token,
                platform_username = EXCLUDED.platform_username,
                platform_user_id = EXCLUDED.platform_user_id,
                updated_at = EXCLUDED.updated_at`,
            [req.user.id, platform.toLowerCase(), encryptedToken, username, platform_user_id]
        );

        res.json({
            message: `${platform} connected successfully`,
            account: { platform, username, platform_user_id }
        });
    } catch (error) {
        console.error('Connect platform error:', error);

        let statusCode = 500;
        let message = 'Server error connecting platform';

        if (error.message.includes('ENCRYPTION_KEY')) {
            message = 'Security configuration error: Encryption key missing on server.';
        } else if (error.code === '23505') { // Unique constraint
            message = 'Account already connected.';
        }

        res.status(statusCode).json({ message, details: error.message });
    }
};

const disconnectPlatform = async (req, res) => {
    const { platform } = req.params;

    try {
        await db.query(
            'DELETE FROM connected_accounts WHERE user_id = $1 AND platform = $2',
            [req.user.id, platform]
        );
        res.json({ message: `${platform} disconnected successfully` });
    } catch (error) {
        console.error('Disconnect error:', error);
        res.status(500).json({ message: 'Server error disconnecting platform' });
    }
};

const searchYouTubeChannel = async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    try {
        const results = await youtubeService.searchChannels(query);
        res.json(results);
    } catch (error) {
        console.error('Search YouTube channels error:', error);
        res.status(500).json({ message: 'Server error searching YouTube channels' });
    }
};

module.exports = {
    getConnectedAccounts,
    connectPlatform,
    disconnectPlatform,
    searchYouTubeChannel
};
