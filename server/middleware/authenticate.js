/**
 * Nama File: authenticate.js
 * Fungsi: Middleware untuk memverifikasi token JWT pada setiap request yang memerlukan autentikasi.
 *         Mendukung token dari header Authorization (Bearer) atau query string (?token=...).
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 1 Oktober 2025
 */

const jwt = require('jsonwebtoken');

// Middleware autentikasi untuk memvalidasi token JWT
const authenticate = (req, res, next) => {
  // Coba ambil token dari header Authorization (format: Bearer <token>)
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Jika token tidak ditemukan di header, coba ambil dari query string (?token=...)
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }

  // Jika token tetap tidak ditemukan, tolak permintaan
  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  try {
    // Verifikasi token menggunakan secret key dari environment
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Pastikan payload token berisi ID dan role pengguna
    if (!decoded.id || !decoded.role) {
      return res.status(403).json({ message: 'Token tidak valid: payload tidak lengkap' });
    }

    // Simpan data pengguna terverifikasi ke objek request
    req.user = decoded;
    next();
  } catch (err) {
    // Tangani error token tidak valid atau kadaluarsa
    return res.status(403).json({ message: 'Token tidak valid' });
  }
};

module.exports = authenticate;