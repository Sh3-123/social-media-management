const db = require('../config/db');
const { decrypt } = require('../utils/crypto');
const axios = require('axios');
const youtubeService = require('../services/youtubeService');

const getPosts = async (req, res) => {
    const { platform, type } = req.query;
    const userId = req.user.id;

    try {
        let query = `
            SELECT p.*,
            (
                COALESCE(p.comments_count, 0) + 
                (SELECT COUNT(*) FROM posts r WHERE r.parent_post_id = p.platform_post_id AND r.user_id = p.user_id)
            ) as display_comments_count 
            FROM posts p 
            WHERE p.user_id = $1
        `;
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

        query += ' ORDER BY p.published_at DESC LIMIT 50';
        const result = await db.query(query, params);

        // Map the updated comments count
        const posts = result.rows.map(post => {
            post.comments_count = parseInt(post.display_comments_count, 10);
            return post;
        });

        res.json(posts);
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ message: 'Server error fetching posts' });
    }
};

const getPostById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(`
            SELECT p.*, 
            (
                COALESCE(p.comments_count, 0) + 
                (SELECT COUNT(*) FROM posts r WHERE r.parent_post_id = p.platform_post_id AND r.user_id = p.user_id)
            ) as display_comments_count
            FROM posts p
            WHERE p.id = $1 AND p.user_id = $2
        `, [id, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Map the calculated display score to the field the frontend expects
        const post = result.rows[0];
        post.comments_count = parseInt(post.display_comments_count, 10);

        res.json(post);
    } catch (error) {
        console.error('Get post by id error:', error);
        res.status(500).json({ message: 'Server error fetching post' });
    }
};

const syncPosts = async (req, res) => {
    const { platform } = req.body;
    const userId = req.user.id;

    if (!platform || (platform.toLowerCase() !== 'threads' && platform.toLowerCase() !== 'youtube')) {
        return res.status(400).json({ message: 'Only Threads and YouTube sync is supported currently' });
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

        if (platform.toLowerCase() === 'threads') {
            // 2. Fetch Threads (Posts) with Pagination
            let threads = [];
            let url = `https://graph.threads.net/v1.0/${threadsUserId}/threads`;
            let params = {
                fields: 'id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,shortcode,thumbnail_url,is_quote_post,like_count,reply_count',
                limit: 25,
                access_token: accessToken
            };

            while (true) {
                const res = await axios.get(url, { params });
                const data = res.data;
                if (data.error) break;

                threads.push(...(data.data || []));

                const nextUrl = data.paging?.next;
                if (!nextUrl || threads.length >= 50) break;
                url = nextUrl;
                params = {}; // nextUrl already contains all params
            }

            console.log(`Fetched ${threads.length} threads for syncing`);

            // 3. Fetch Replies (Comments) with Pagination
            let replies = [];
            url = `https://graph.threads.net/v1.0/${threadsUserId}/replies`;
            params = {
                fields: 'id,text,username,permalink,timestamp,media_product_type,media_type,media_url,shortcode,thumbnail_url,is_quote_post,has_replies,like_count,reply_count',
                limit: 50,
                access_token: accessToken
            };

            while (true) {
                const res = await axios.get(url, { params });
                const data = res.data;
                if (data.error) break;

                replies.push(...(data.data || []));

                const nextUrl = data.paging?.next;
                if (!nextUrl || replies.length >= 100) break;
                url = nextUrl;
                params = {}; // nextUrl already contains all params
            }
            console.log(`Fetched ${replies.length} self replies for syncing`);

            // 4. Upsert Threads into DB
            for (const thread of threads) {
                await db.query(
                    `INSERT INTO posts (user_id, platform, platform_post_id, content, media_url, published_at, post_type, likes_count, comments_count)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                     ON CONFLICT (user_id, platform, platform_post_id) DO UPDATE SET
                     content = EXCLUDED.content,
                     media_url = EXCLUDED.media_url,
                     published_at = EXCLUDED.published_at,
                     likes_count = EXCLUDED.likes_count,
                     comments_count = EXCLUDED.comments_count,
                     updated_at = CURRENT_TIMESTAMP`,
                    [userId, platform.toLowerCase(), thread.id, thread.text, thread.media_url || null, thread.timestamp, 'POST', thread.like_count || 0, thread.reply_count || 0]
                );
            }

            // 5. Upsert Replies into DB
            for (const reply of replies) {
                await db.query(
                    `INSERT INTO posts (user_id, platform, platform_post_id, content, media_url, published_at, post_type, likes_count, comments_count)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                     ON CONFLICT (user_id, platform, platform_post_id) DO UPDATE SET
                     content = EXCLUDED.content,
                     media_url = EXCLUDED.media_url,
                     published_at = EXCLUDED.published_at,
                     likes_count = EXCLUDED.likes_count,
                     comments_count = EXCLUDED.comments_count,
                     updated_at = CURRENT_TIMESTAMP`,
                    [userId, platform.toLowerCase(), reply.id, reply.text, reply.media_url || null, reply.timestamp, 'REPLY', reply.like_count || 0, reply.reply_count || 0]
                );
            }

            return res.json({
                message: `Successfully synced ${platform} content`,
                stats: { posts: threads.length, comments: replies.length }
            });
        }

        if (platform.toLowerCase() === 'youtube') {
            const { platform_user_id: channelId } = accountResult.rows[0];

            // 1. Get channel details to find the uploads playlist
            const channelDetails = await youtubeService.getChannelDetails(channelId);
            const uploadsPlaylistId = channelDetails.uploadsPlaylistId;

            // 2. Fetch videos from the playlist
            let allVideos = [];
            let nextPageToken = '';

            do {
                const result = await youtubeService.getPlaylistVideos(uploadsPlaylistId, 50, nextPageToken);
                allVideos.push(...result.items);
                nextPageToken = result.nextPageToken;
                if (allVideos.length >= 50) break;
            } while (nextPageToken);

            console.log(`Fetched ${allVideos.length} videos from playlist`);

            // 3. Fetch statistics for videos in batches of 50
            const videoIds = allVideos.map(item => item.snippet.resourceId.videoId);
            let videoStats = [];

            for (let i = 0; i < videoIds.length; i += 50) {
                const batchIds = videoIds.slice(i, i + 50);
                const stats = await youtubeService.getVideoDetails(batchIds);
                videoStats.push(...stats);
            }

            // Create a lookup map for stats
            const statsMap = {};
            for (const stat of videoStats) {
                statsMap[stat.id] = stat;
            }

            // 4. Upsert videos into DB
            for (const item of allVideos) {
                const videoId = item.snippet.resourceId.videoId;
                const stat = statsMap[videoId];

                await db.query(
                    `INSERT INTO posts (user_id, platform, platform_post_id, content, media_url, published_at, post_type, likes_count, comments_count, views_count)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                     ON CONFLICT (user_id, platform, platform_post_id) DO UPDATE SET
                     content = EXCLUDED.content,
                     media_url = EXCLUDED.media_url,
                     published_at = EXCLUDED.published_at,
                     likes_count = EXCLUDED.likes_count,
                     comments_count = EXCLUDED.comments_count,
                     views_count = EXCLUDED.views_count,
                     updated_at = CURRENT_TIMESTAMP`,
                    [
                        userId,
                        platform.toLowerCase(),
                        videoId,
                        item.snippet.title, // Use title as content for grid
                        item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
                        item.snippet.publishedAt,
                        'POST',
                        stat?.statistics?.likeCount || 0,
                        stat?.statistics?.commentCount || 0,
                        stat?.statistics?.viewCount || 0
                    ]
                );
            }

            return res.json({
                message: `Successfully synced ${platform} content`,
                stats: { posts: allVideos.length, comments: 0 }
            });
        }

    } catch (error) {
        console.error('Sync posts error:', error.response?.data || error.message);
        res.status(500).json({
            message: 'Server error syncing content',
            details: error.response?.data?.error?.message || error.message
        });
    }
};

const syncPublicReplies = async (req, res) => {
    const { id: threadId } = req.params;
    const userId = req.user.id;

    try {
        // 1. Get the original post and encrypted token
        const postResult = await db.query('SELECT platform_post_id, platform FROM posts WHERE id = $1 AND user_id = $2', [threadId, userId]);
        if (postResult.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const platformPostId = postResult.rows[0].platform_post_id;
        const platform = postResult.rows[0].platform;

        const accountResult = await db.query(
            'SELECT access_token FROM connected_accounts WHERE user_id = $1 AND platform = $2',
            [userId, platform]
        );

        if (accountResult.rows.length === 0) {
            return res.status(404).json({ message: 'No connected account found for this platform' });
        }

        const accessToken = decrypt(accountResult.rows[0].access_token);

        if (platform.toLowerCase() === 'threads') {
            // 2. Fetch public replies with pagination
            let publicReplies = [];
            let url = `https://graph.threads.net/v1.0/${platformPostId}/replies`;
            let params = {
                fields: 'id,text,username,permalink,timestamp,media_product_type,media_type,media_url,shortcode,thumbnail_url,children,is_quote_post,has_replies,like_count,reply_count',
                reverse: 'true',
                access_token: accessToken
            };

            while (true) {
                const response = await axios.get(url, { params });
                const data = response.data;
                if (data.error) break;

                publicReplies.push(...(data.data || []));

                const nextUrl = data.paging?.cursors?.after ? `${url}?after=${data.paging.cursors.after}` : null; // Threads replies sometimes use cursor
                if (!nextUrl || Object.keys(params).length === 0) break; // if we reset params on nextUrl, Object.keys logic fails. Let's just use the URL given by paging if it exists.

                // Note: Threads replies API pagination logic with cursors can be tricky, let's use the provided next url or construct it
                if (data.paging && data.paging.next) {
                    url = data.paging.next;
                    params = {};
                } else {
                    break;
                }
            }

            // 3. Upsert Public Replies into DB
            for (const reply of publicReplies) {
                await db.query(
                    `INSERT INTO posts (user_id, platform, platform_post_id, parent_post_id, platform_username, content, media_url, published_at, post_type, likes_count, comments_count)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                     ON CONFLICT (user_id, platform, platform_post_id) DO UPDATE SET
                     content = EXCLUDED.content,
                     media_url = EXCLUDED.media_url,
                     published_at = EXCLUDED.published_at,
                     platform_username = EXCLUDED.platform_username,
                     parent_post_id = EXCLUDED.parent_post_id,
                     likes_count = EXCLUDED.likes_count,
                     comments_count = EXCLUDED.comments_count,
                     updated_at = CURRENT_TIMESTAMP`,
                    [userId, platform, reply.id, platformPostId, reply.username, reply.text, reply.media_url || null, reply.timestamp, 'REPLY', reply.like_count || 0, reply.reply_count || 0]
                );
            }

            return res.json({
                message: 'Successfully synced public replies',
                count: publicReplies.length
            });
        }

        if (platform === 'youtube') {
            // Fetch YouTube comments
            let allComments = [];
            let nextPageToken = '';

            do {
                const result = await youtubeService.getVideoComments(platformPostId, 100, nextPageToken);
                allComments.push(...result.items);
                nextPageToken = result.nextPageToken;
                // Limit to first 200 comments to save API quota for now
                if (allComments.length >= 200) break;
            } while (nextPageToken);

            // Upsert YouTube comments
            for (const item of allComments) {
                const comment = item.snippet.topLevelComment.snippet;

                await db.query(
                    `INSERT INTO posts (user_id, platform, platform_post_id, parent_post_id, platform_username, content, media_url, published_at, post_type, likes_count, comments_count)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                     ON CONFLICT (user_id, platform, platform_post_id) DO UPDATE SET
                     content = EXCLUDED.content,
                     media_url = EXCLUDED.media_url,
                     published_at = EXCLUDED.published_at,
                     platform_username = EXCLUDED.platform_username,
                     parent_post_id = EXCLUDED.parent_post_id,
                     likes_count = EXCLUDED.likes_count,
                     comments_count = EXCLUDED.comments_count,
                     updated_at = CURRENT_TIMESTAMP`,
                    [
                        userId,
                        platform,
                        item.id,
                        platformPostId,
                        comment.authorDisplayName,
                        comment.textDisplay,
                        comment.authorProfileImageUrl,
                        comment.publishedAt,
                        'REPLY',
                        comment.likeCount || 0,
                        item.snippet.totalReplyCount || 0
                    ]
                );
            }

            return res.json({
                message: 'Successfully synced public replies',
                count: allComments.length
            });
        }

    } catch (error) {
        console.error('Sync public replies error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Server error syncing public replies' });
    }
};

const getPublicReplies = async (req, res) => {
    const { id: threadId } = req.params;
    const userId = req.user.id;

    try {
        const postResult = await db.query('SELECT platform_post_id, platform FROM posts WHERE id = $1 AND user_id = $2', [threadId, userId]);
        if (postResult.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const platformPostId = postResult.rows[0].platform_post_id;
        const platform = postResult.rows[0].platform;

        const result = await db.query(
            `SELECT * FROM posts 
             WHERE user_id = $1 AND platform = $3 AND parent_post_id = $2
             ORDER BY published_at DESC`,
            [userId, platformPostId, platform]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get public replies error:', error);
        res.status(500).json({ message: 'Server error fetching public replies' });
    }
};

module.exports = { getPosts, getPostById, syncPosts, syncPublicReplies, getPublicReplies };
