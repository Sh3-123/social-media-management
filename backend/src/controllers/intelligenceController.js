const db = require('../config/db');
const aiService = require('../utils/aiService');

const parseRawResults = (rawResults) => {
    if (!rawResults) return {};
    if (typeof rawResults === 'object') return rawResults;
    if (typeof rawResults !== 'string') return {};

    try {
        return JSON.parse(rawResults);
    } catch (error) {
        return {};
    }
};

const toClientResponse = (row) => {
    const raw = parseRawResults(row?.raw_results);

    const rawEmotion = typeof raw.emotion === 'string' ? raw.emotion : raw.emotion?.label;
    const rawSentiment = typeof raw.sentiment === 'string' ? raw.sentiment : raw.sentiment?.label;
    const normalizedEmotion = String(rawEmotion || row?.subclass_label || 'neutral').toLowerCase();
    const normalizedSentiment = String(rawSentiment || row?.sentiment_label || 'neutral').toLowerCase();
    const normalizedConfidence =
        Number(raw.confidence ?? raw.emotion?.score ?? raw.sentiment?.score ?? row?.subclass_score ?? row?.sentiment_score ?? 0) || 0;

    const allScores = Array.isArray(raw.allScores)
        ? raw.allScores
        : (Array.isArray(raw.emotion?.raw) ? raw.emotion.raw : []);

    return {
        ...row,
        emotion: normalizedEmotion,
        sentiment: normalizedSentiment,
        confidence: normalizedConfidence,
        allScores
    };
};

exports.analyzePostSentiment = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;

    try {
        const existing = await db.query(
            'SELECT * FROM intelligence_results WHERE target_id = $1 AND target_type = $2',
            [postId, 'POST']
        );

        if (existing.rows.length > 0) {
            return res.json(toClientResponse(existing.rows[0]));
        }

        const postRes = await db.query(
            'SELECT content FROM posts WHERE platform_post_id = $1 AND user_id = $2',
            [postId, userId]
        );

        if (postRes.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const content = postRes.rows[0].content;
        const classification = await aiService.classifyEmotionSentiment(content);

        const result = await db.query(
            `INSERT INTO intelligence_results 
       (target_id, target_type, sentiment_label, sentiment_score, subclass_label, subclass_score, raw_results)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [
                postId,
                'POST',
                classification.sentiment,
                classification.confidence,
                classification.emotion,
                classification.confidence,
                JSON.stringify(classification)
            ]
        );

        res.json(toClientResponse(result.rows[0]));
    } catch (error) {
        console.error('Analyze post sentiment error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.analyzeCommentsSentiment = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;

    try {
        const commentsRes = await db.query(
            'SELECT * FROM posts WHERE parent_post_id = $1 AND user_id = $2 AND post_type = $3',
            [postId, userId, 'REPLY']
        );

        const comments = commentsRes.rows;
        if (comments.length === 0) {
            return res.json({ message: 'No comments to analyze', breakdown: {}, results: [] });
        }

        const results = [];
        const breakdown = {
            positive: 0,
            negative: 0,
            neutral: 0
        };

        for (const comment of comments) {
            const existing = await db.query(
                'SELECT * FROM intelligence_results WHERE target_id = $1 AND target_type = $2',
                [comment.platform_post_id, 'COMMENT']
            );

            let analysis;
            if (existing.rows.length > 0) {
                analysis = existing.rows[0];
            } else {
                const classification = await aiService.classifyEmotionSentiment(comment.content);

                const inserted = await db.query(
                    `INSERT INTO intelligence_results 
           (target_id, target_type, sentiment_label, sentiment_score, subclass_label, subclass_score, raw_results)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
                    [
                        comment.platform_post_id,
                        'COMMENT',
                        classification.sentiment,
                        classification.confidence,
                        classification.emotion,
                        classification.confidence,
                        JSON.stringify(classification)
                    ]
                );
                analysis = inserted.rows[0];
            }

            results.push(analysis);

            const label = analysis.sentiment_label?.toLowerCase();
            if (breakdown.hasOwnProperty(label)) {
                breakdown[label]++;
            } else {
                breakdown.neutral++;
            }
        }

        const total = results.length;
        const percentages = {
            positive: ((breakdown.positive / total) * 100).toFixed(1),
            negative: ((breakdown.negative / total) * 100).toFixed(1),
            neutral: ((breakdown.neutral / total) * 100).toFixed(1)
        };

        res.json({
            total,
            breakdown: percentages,
            results
        });
    } catch (error) {
        console.error('Analyze comments sentiment error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getTrendingTopics = async (req, res) => {
    try {
        const topics = await aiService.getTrendingTopics();
        res.json(topics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
