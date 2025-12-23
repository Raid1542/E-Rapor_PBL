const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  // 1. Coba ambil dari header Authorization (Bearer token)
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Jika tidak ada di header, coba dari query string ?token=...
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }

  // 3. Jika tetap tidak ada token
  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id || !decoded.role) {
      return res.status(403).json({ message: 'Token tidak valid: payload tidak lengkap' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid' });
  }
};

module.exports = authenticate;