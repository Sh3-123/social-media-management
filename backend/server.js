const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();

const { initDB } = require('./src/models/init');
const authRoutes = require('./src/routes/authRoutes');
const platformRoutes = require('./src/routes/platformRoutes');
const postRoutes = require('./src/routes/postRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const intelligenceRoutes = require('./src/routes/intelligenceRoutes');

const app = express();

const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        let hostname = '';
        try {
            hostname = new URL(origin).hostname;
        } catch (error) {
            hostname = '';
        }

        const isLocalDev = hostname === 'localhost' || hostname === '127.0.0.1';
        const isVercel = hostname.endsWith('.vercel.app');
        const isAllowed = allowedOrigins.includes(origin) || isVercel;

        if (isAllowed || isLocalDev) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/intelligence', intelligenceRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    const startServer = async () => {
        try {
            await initDB();
            console.log('Database initialized');
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    };
    startServer();
}
// Force redeploy Mon Feb 23 01:19:47 PM IST 2026
