const rateLimit = require('express-rate-limit');

// Nur POST-Requests zählen (Login/Register) — GET /auth/me wird nie geblockt
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  skip: (req) => req.method !== 'POST',
});

module.exports = { authLimiter };
