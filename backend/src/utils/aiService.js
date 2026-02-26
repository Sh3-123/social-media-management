const axios = require('axios');

const HF_MODEL_URL = 'https://api-inference.huggingface.co/models/SamLowe/roberta-base-go_emotions';
const MAX_RETRIES = 4;
const DEFAULT_RETRY_DELAY_MS = 2000;

const POSITIVE_EMOTIONS = new Set([
    'joy',
    'love',
    'admiration',
    'excitement',
    'gratitude',
    'optimism',
    'approval',
    'pride',
    'relief'
]);

const NEGATIVE_EMOTIONS = new Set([
    'anger',
    'annoyance',
    'sadness',
    'fear',
    'disgust',
    'disappointment',
    'grief',
    'remorse'
]);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const deriveSentiment = (emotion) => {
    if (POSITIVE_EMOTIONS.has(emotion)) return 'positive';
    if (NEGATIVE_EMOTIONS.has(emotion)) return 'negative';
    return 'neutral';
};

const parseEstimatedWaitMs = (estimatedTimeSeconds) => {
    if (typeof estimatedTimeSeconds !== 'number' || Number.isNaN(estimatedTimeSeconds)) {
        return DEFAULT_RETRY_DELAY_MS;
    }
    return Math.max(Math.ceil(estimatedTimeSeconds * 1000), DEFAULT_RETRY_DELAY_MS);
};

const normalizeScores = (payload) => {
    if (!Array.isArray(payload) || !Array.isArray(payload[0])) return [];
    return payload[0]
        .map((entry) => ({
            label: String(entry.label || '').toLowerCase(),
            score: Number(entry.score) || 0
        }))
        .sort((a, b) => b.score - a.score);
};

const classifyWithHuggingFace = async (text, attempt = 0) => {
    if (!process.env.HUGGINGFACE_API_KEY) {
        throw new Error('HUGGINGFACE_API_KEY is not configured');
    }

    const sanitizedText = String(text ?? '');
    if (!sanitizedText.trim()) {
        return {
            emotion: 'neutral',
            sentiment: 'neutral',
            confidence: 0,
            allScores: []
        };
    }

    try {
        const response = await axios.post(
            HF_MODEL_URL,
            { inputs: sanitizedText },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 20000
            }
        );

        const scores = normalizeScores(response.data);
        if (!scores.length) {
            throw new Error('Unexpected Hugging Face response format');
        }

        const top = scores[0];
        return {
            emotion: top.label,
            sentiment: deriveSentiment(top.label),
            confidence: top.score,
            allScores: scores
        };
    } catch (error) {
        const errorPayload = error.response?.data || {};
        const errorMessage = String(errorPayload.error || error.message || '').toLowerCase();
        const modelLoading = error.response?.status === 503 || errorMessage.includes('loading');

        if (modelLoading && attempt < MAX_RETRIES) {
            const retryDelay = parseEstimatedWaitMs(errorPayload.estimated_time);
            await wait(retryDelay);
            return classifyWithHuggingFace(sanitizedText, attempt + 1);
        }

        if (modelLoading) {
            throw new Error('Hugging Face model is still loading. Please retry shortly.');
        }

        throw new Error(`Hugging Face inference failed: ${errorPayload.error || error.message}`);
    }
};

exports.classifyEmotionSentiment = classifyWithHuggingFace;

exports.getTrendingTopics = async () => {
    try {
        return [
            { topic: 'Artificial Intelligence', volume: '1.2M', category: 'Technology', growth: '+25%' },
            { topic: 'Sustainable Design', volume: '850K', category: 'Environment', growth: '+12%' },
            { topic: 'Remote Work 2026', volume: '600K', category: 'Business', growth: '+18%' },
            { topic: 'Cybersecurity', volume: '1.5M', category: 'Tech', growth: '+30%' },
            { topic: 'Web3 Evolution', volume: '420K', category: 'Technology', growth: '-5%' },
            { topic: 'Mental Health Awareness', volume: '2.1M', category: 'Society', growth: '+40%' }
        ];
    } catch (error) {
        return [];
    }
};
