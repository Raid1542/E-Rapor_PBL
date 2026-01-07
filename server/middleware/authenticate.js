/**
 * Nama File: authenticate.js
 * Fungsi: Middleware untuk memverifikasi token JWT pada setiap request yang memerlukan autentikasi.
 *         Mendukung token dari cookie (utama), header Authorization (Bearer), dan query string.
 *         Menangani token tidak ditemukan, tidak valid, atau kedaluwarsa dengan pesan umum.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 7 Januari 2026
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware autentikasi yang memprioritaskan token dari cookie.
 */
const authenticate = (req, res, next) => {
  let token = null;

  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query?.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Silakan login.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid.',
      });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Silakan login.',
    });
  }
};

module.exports = authenticate;