const db = require('../config/db');
const { encrypt } = require('../utils/crypto');

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
    const { platform, token, username, platform_user_id } = req.body;

    if (!platform || !token) {
        return res.status(400).json({ message: 'Platform and token are required' });
    }

    try {
        const encryptedToken = encrypt(token);

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
            [req.user.id, platform, encryptedToken, username, platform_user_id]
        );

        res.json({ message: `${platform} connected successfully` });
    } catch (error) {
        console.error('Connect platform error:', error);
        res.status(500).json({ message: 'Server error connecting platform' });
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

module.exports = {
    getConnectedAccounts,
    connectPlatform,
    disconnectPlatform
};
