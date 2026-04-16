const rateLimit = require('express-rate-limit');

// Max 5 attempts per IP per 15 minutes on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

module.exports = { authLimiter };
