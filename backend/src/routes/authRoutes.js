const express = require('express');
const router = express.Router();
const { signup, verifyEmail, login, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Auth routes
router.post('/signup', signup);
router.post('/verify/:token', verifyEmail);
router.post('/login', login);

// Protected routes
router.get('/me', verifyToken, getMe);

module.exports = router;
