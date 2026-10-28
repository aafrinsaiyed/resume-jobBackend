// ✅ PATCHED: Now includes `role` in token payload so req.user.role works everywhere
import jwt from 'jsonwebtoken';
import secretKey from '../jwtConfig.js';

function genrateToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role || 'user',
  };
  return jwt.sign(payload, secretKey, { expiresIn: '365d' });
}

export default genrateToken;