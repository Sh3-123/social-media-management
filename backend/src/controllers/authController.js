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

        // Verification disabled for now - auto verify
        const verificationToken = null;
        const tokenExpiresAt = null;
        const isVerified = true;

        // Insert user
        const newUser = await db.query(
            `INSERT INTO users (name, email, password, verification_token, token_expires_at, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email`,
            [name, email, hashedPassword, verificationToken, tokenExpiresAt, isVerified]
        );

        res.status(201).json({
            message: 'User registered successfully. You can now log in.',
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
    res.json({ message: 'Email verification is currently disabled. All users are auto-verified.' });
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

const getMe = async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, email, is_verified, created_at FROM users WHERE id = $1', [req.user.id]);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { signup, verifyEmail, login, getMe };
