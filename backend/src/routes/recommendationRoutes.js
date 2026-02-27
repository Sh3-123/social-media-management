const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/', recommendationController.generateRecommendation);

module.exports = router;
