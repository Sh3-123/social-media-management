const express = require('express');
const router = express.Router();
const intelligenceController = require('../controllers/intelligenceController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/post/:postId', intelligenceController.analyzePostSentiment);
router.get('/comments/:postId', intelligenceController.analyzeCommentsSentiment);
router.get('/trending', intelligenceController.getTrendingTopics);

module.exports = router;
