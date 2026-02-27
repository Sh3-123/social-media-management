const axios = require('axios');

const YOUTUBE_API_V3_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Helper to construct YouTube API URL with key
 * @param {string} endpoint 
 * @param {object} params 
 * @returns {string} url
 */
const getYoutubeUrl = (endpoint, params = {}) => {
    const url = new URL(`${YOUTUBE_API_V3_URL}/${endpoint}`);
    url.searchParams.append('key', process.env.YOUTUBE_API_KEY);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    return url.toString();
};

/**
 * Search for YouTube channels
 * @param {string} query 
 * @param {number} maxResults 
 */
const searchChannels = async (query, maxResults = 10) => {
    if (!query) return [];
    try {
        const url = getYoutubeUrl('search', {
            part: 'snippet',
            q: query,
            type: 'channel',
            maxResults
        });
        const response = await axios.get(url);
        return response.data.items.map(item => ({
            channelId: item.snippet.channelId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails?.default?.url || item.snippet.thumbnails?.high?.url,
        }));
    } catch (error) {
        console.error('YouTube searchChannels error:', error.response?.data || error.message);
        throw new Error('Failed to search YouTube channels');
    }
};

/**
 * Get channel details (especially the uploads playlist ID)
 * @param {string} channelId 
 */
const getChannelDetails = async (channelId) => {
    try {
        const url = getYoutubeUrl('channels', {
            part: 'snippet,contentDetails,statistics',
            id: channelId
        });
        const response = await axios.get(url);
        if (!response.data.items || response.data.items.length === 0) {
            throw new Error('Channel not found');
        }

        const channel = response.data.items[0];
        return {
            id: channel.id,
            title: channel.snippet.title,
            description: channel.snippet.description,
            customUrl: channel.snippet.customUrl,
            thumbnailUrl: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url,
            uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
            subscriberCount: channel.statistics.subscriberCount,
            videoCount: channel.statistics.videoCount,
            viewCount: channel.statistics.viewCount
        };
    } catch (error) {
        console.error('YouTube getChannelDetails error:', error.response?.data || error.message);
        throw new Error('Failed to fetch channel details');
    }
};

/**
 * Get videos from a playlist (used for fetching all uploads)
 * @param {string} playlistId 
 * @param {number} maxResults 
 * @param {string} pageToken 
 */
const getPlaylistVideos = async (playlistId, maxResults = 50, pageToken = '') => {
    try {
        const params = {
            part: 'snippet',
            playlistId,
            maxResults,
        };
        if (pageToken) params.pageToken = pageToken;

        const url = getYoutubeUrl('playlistItems', params);
        const response = await axios.get(url);

        return {
            items: response.data.items,
            nextPageToken: response.data.nextPageToken
        };
    } catch (error) {
        console.error('YouTube getPlaylistVideos error:', error.response?.data || error.message);
        throw new Error('Failed to fetch playlist videos');
    }
};

/**
 * Fetch video details (statistics like views, likes, comments)
 * @param {string|string[]} videoIds 
 */
const getVideoDetails = async (videoIds) => {
    try {
        const idsString = Array.isArray(videoIds) ? videoIds.join(',') : videoIds;
        const url = getYoutubeUrl('videos', {
            part: 'snippet,statistics',
            id: idsString
        });

        const response = await axios.get(url);
        return response.data.items;
    } catch (error) {
        console.error('YouTube getVideoDetails error:', error.response?.data || error.message);
        throw new Error('Failed to fetch video details');
    }
};

/**
 * Get comments for a specific video
 * @param {string} videoId 
 * @param {number} maxResults 
 * @param {string} pageToken 
 */
const getVideoComments = async (videoId, maxResults = 50, pageToken = '') => {
    try {
        const params = {
            part: 'snippet',
            videoId,
            maxResults,
            textFormat: 'plainText'
        };
        if (pageToken) params.pageToken = pageToken;

        const url = getYoutubeUrl('commentThreads', params);
        const response = await axios.get(url);

        return {
            items: response.data.items,
            nextPageToken: response.data.nextPageToken
        };
    } catch (error) {
        // Some videos have comments disabled, return empty array in that case
        if (error.response?.data?.error?.errors?.[0]?.reason === 'commentsDisabled') {
            console.log(`Comments disabled for video: ${videoId}`);
            return { items: [], nextPageToken: null };
        }
        console.error('YouTube getVideoComments error:', error.response?.data || error.message);
        throw new Error('Failed to fetch video comments');
    }
};

module.exports = {
    searchChannels,
    getChannelDetails,
    getPlaylistVideos,
    getVideoDetails,
    getVideoComments
};
