const express = require('express');
const router = express.Router();
const { getAnalyticsOverview, syncAnalytics } = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/overview', getAnalyticsOverview);
router.post('/sync', syncAnalytics);

module.exports = router;
