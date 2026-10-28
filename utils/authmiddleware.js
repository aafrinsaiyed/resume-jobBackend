// ✅ PATCHED: Same AuthanticateToken (backward-compatible) + NEW requireRole helper
import jwt from 'jsonwebtoken';
import secretKey from '../jwtConfig.js';

function AuthanticateToken(req, res, next) {
  const authToken = req.header('Authorization');

  if (!authToken) {
    return res.status(401).json({ message: 'Authorization missing' });
  }

  const [bearer, token] = authToken.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Invalid Token Format' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid Token' });
    }
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  });
}

// ✅ NEW: Role-based access control
// Usage: router.post('/api/...', AuthanticateToken, requireRole('admin'), handler)
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
    }
    next();
  };
}

export default AuthanticateToken;