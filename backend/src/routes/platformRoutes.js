const express = require('express');
const router = express.Router();
const { getConnectedAccounts, connectPlatform, disconnectPlatform } = require('../controllers/platformController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/accounts', getConnectedAccounts);
router.post('/connect', connectPlatform);
router.delete('/disconnect/:platform', disconnectPlatform);

module.exports = router;
