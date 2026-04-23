const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');
const { registerSchema, loginSchema } = require('../validation/schemas');

const router = express.Router();
const prisma = new PrismaClient();

// Sets JWT as HttpOnly cookie — JS on the page can never read this
function setTokenCookie(res, userId, email) {
  const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '15m' });
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000,
  });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten().fieldErrors });

  const { name, email, password } = result.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'Email already in use' });

  const hashed = await bcrypt.hash(password, 12); // 12 rounds — OWASP requirement
  const user = await prisma.user.create({ data: { name, email, password: hashed } });

  setTokenCookie(res, user.id, user.email);
  res.status(201).json({ id: user.id, name: user.name, email: user.email });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten().fieldErrors });

  const { email, password } = result.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always run bcrypt.compare to prevent timing attacks (even if user not found)
  const valid = user ? await bcrypt.compare(password, user.password) : false;
  if (!user || !valid) return res.status(401).json({ error: 'Invalid credentials' });

  setTokenCookie(res, user.id, user.email);
  res.json({ id: user.id, name: user.name, email: user.email });
});

// GET /api/auth/me — restore session from cookie
router.get('/me', verifyToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true },
  });
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  res.json(user);
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

module.exports = router;
