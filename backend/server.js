const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { initDB } = require('./src/models/init');
const authRoutes = require('./src/routes/authRoutes');
const platformRoutes = require('./src/routes/platformRoutes');
const postRoutes = require('./src/routes/postRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

const app = express();

const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const isVercel = origin.endsWith('.vercel.app');
        const isAllowed = allowedOrigins.includes(origin) || isVercel;

        if (isAllowed) {
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
