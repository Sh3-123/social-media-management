const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const { sendVerificationEmail } = require('../utils/email');

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

        // Create verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Insert user
        const newUser = await db.query(
            `INSERT INTO users (name, email, password, verification_token, token_expires_at) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email`,
            [name, email, hashedPassword, verificationToken, tokenExpiresAt]
        );

        // Send email
        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({
            message: 'User registered successfully. Please check your email to verify your account.',
            user: newUser.rows[0],
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const result = await db.query(
            'SELECT id, token_expires_at FROM users WHERE verification_token = $1',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid verification token' });
        }

        const user = result.rows[0];

        // Check expiration
        if (new Date() > new Date(user.token_expires_at)) {
            return res.status(400).json({ message: 'Verification token has expired' });
        }

        // Update user
        await db.query(
            'UPDATE users SET is_verified = TRUE, verification_token = NULL, token_expires_at = NULL WHERE id = $1',
            [user.id]
        );

        res.json({ message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ message: 'Server error during verification' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];

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
        res.status(500).json({ message: 'Server error during login' });
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

module.exports = { signup, verifyEmail, login, getMe };
