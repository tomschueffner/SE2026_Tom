require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { authLimiter } = require('./middleware/rateLimiter');
const { verifyToken } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const subjectRoutes = require('./routes/subjects');
const topicRoutes = require('./routes/topics');
const progressRoutes = require('./routes/progress');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security middleware ────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // required for HttpOnly cookies
}));
app.use(cookieParser());
app.use(express.json());

// ── Public routes (no auth) ───────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.get('/health', (_req, res) => res.json({ ok: true }));

// ── Protected routes (Default-Deny: verifyToken runs first) ───
app.use('/api/subjects', verifyToken, subjectRoutes);
app.use('/api/topics',   verifyToken, topicRoutes);
app.use('/api/progress', verifyToken, progressRoutes);

// ── 404 ───────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Central error handler (never leaks stack traces) ──────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`TrackIt API running on :${PORT}`));
