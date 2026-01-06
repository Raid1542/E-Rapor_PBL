/**
 * Nama File: authenticate.js
 * Fungsi: Middleware untuk memverifikasi token JWT pada setiap request yang memerlukan autentikasi.
 *         Mendukung token dari cookie (utama), header Authorization (Bearer), dan query string.
 *         Menangani token tidak ditemukan, tidak valid, atau kedaluwarsa dengan pesan jelas.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 6 Januari 2026
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware autentikasi yang memprioritaskan token dari cookie,
 * sesuai dengan cara token disimpan saat login.
 */
const authenticate = (req, res, next) => {
  let token = null;

  // Prioritas utama: ambil dari cookie (karena login menyimpan di cookie)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Fallback: header Authorization
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Fallback: query string (misal untuk testing)
  else if (req.query && req.query.token) {
    token = req.query.token;
  }

  // Jika tidak ada token sama sekali
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Sesi Anda telah berakhir. Silakan login ulang.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Pastikan payload minimal memiliki id dan role
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid: data pengguna tidak lengkap.',
      });
    }

    // Simpan ke req.user untuk middleware/rute berikutnya
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Sesi Anda telah berakhir. Silakan login ulang.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token tidak valid. Silakan login ulang.',
    });
  }
};

module.exports = authenticate;