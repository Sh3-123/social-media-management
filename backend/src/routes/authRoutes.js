const express = require('express');
const router = express.Router();
const { signup, verifyEmail, resendVerification, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Auth routes
router.post('/signup', signup);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', verifyToken, getMe);

module.exports = router;
