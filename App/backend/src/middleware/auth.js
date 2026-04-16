const jwt = require('jsonwebtoken');

// Reads JWT from HttpOnly cookie — never from localStorage
function verifyToken(req, res, next) {
  const token = req.cookies?.token;

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, email }
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { verifyToken };
