const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

const signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user exists
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        const tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        const isVerified = false;

        // Insert user
        const newUser = await db.query(
            `INSERT INTO users (name, email, password, verification_token, token_expires_at, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email`,
            [name, email, hashedPassword, hashedToken, tokenExpiresAt, isVerified]
        );

        // Send Email
        await sendVerificationEmail(email, rawToken);

        res.status(201).json({
            message: 'User registered successfully. Please check your email to verify your account.',
            user: newUser.rows[0],
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            message: 'Server error during registration',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const verifyEmail = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const result = await db.query(
            'SELECT * FROM users WHERE verification_token = $1 AND token_expires_at > NOW()',
            [hashedToken]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        const user = result.rows[0];

        // Update user
        await db.query(
            'UPDATE users SET is_verified = TRUE, verification_token = NULL, token_expires_at = NULL WHERE id = $1',
            [user.id]
        );

        res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({ message: 'Server error during verification' });
    }
};

const resendVerification = async (req, res) => {
    const { email } = req.body;

    try {
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        // We shouldn't reveal if email exists or not, but for our case, if they exist and are unverified:
        if (userCheck.rows.length > 0) {
            const user = userCheck.rows[0];

            if (!user.is_verified) {
                const rawToken = crypto.randomBytes(32).toString('hex');
                const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
                const tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

                await db.query(
                    'UPDATE users SET verification_token = $1, token_expires_at = $2 WHERE id = $3',
                    [hashedToken, tokenExpiresAt, user.id]
                );

                await sendVerificationEmail(user.email, rawToken);
            }
        }

        // Always return success regardless
        res.json({ message: 'If your account exists and is unverified, a new verification link has been sent.' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ message: 'Server error while resending verification' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            console.log(`Login failed: User not found for ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];
        console.log(`User found: ${user.email}, is_verified status in DB: ${user.is_verified}`);

        // Check if verified
        if (!user.is_verified) {
            return res.status(403).json({ message: 'Please verify your email before logging in.' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT payload
        const payload = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'JWT_SECRET is missing on server' });
        }

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    message: 'Logged in successfully',
                    token,
                    user: payload
                });
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Server error during login',
            error: error.message
        });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length > 0) {
            const user = result.rows[0];

            const rawToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            await db.query(
                'UPDATE users SET reset_password_token = $1, reset_password_expires_at = $2 WHERE id = $3',
                [hashedToken, expiresAt, user.id]
            );

            await sendPasswordResetEmail(user.email, rawToken);
        }

        res.json({ message: 'If an account exists, a reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error during forgot password' });
    }
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const result = await db.query(
            'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires_at > NOW()',
            [hashedToken]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const user = result.rows[0];

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query(
            'UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires_at = NULL WHERE id = $2',
            [hashedToken, user.id]
        );

        res.json({ message: 'Password reset successful. You can now log in with your new password.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error during reset password' });
    }
};

const getMe = async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, email, is_verified, created_at FROM users WHERE id = $1', [req.user.id]);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { signup, verifyEmail, resendVerification, login, forgotPassword, resetPassword, getMe };
