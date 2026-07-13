import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT token and extract user details.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Access Denied.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token. Access Denied.' });
    }
    req.user = user;
    next();
  });
}
