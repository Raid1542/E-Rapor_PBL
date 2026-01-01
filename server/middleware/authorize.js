/**
 * Nama File: authorize.js
 * Fungsi: Middleware factory untuk membatasi akses berdasarkan peran pengguna (role-based access control).
 *         Menerima daftar peran yang diizinkan dan memverifikasi apakah peran pengguna saat ini termasuk di dalamnya.
 *         Mendukung input peran dalam bentuk string tunggal atau array.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 1 Oktober 2025
 */

// Middleware factory untuk otorisasi berdasarkan peran pengguna
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    // Jika peran pengguna tidak ditemukan, tolak akses
    if (!userRole) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses' });
    }

    // Normalisasi input: kumpulkan semua peran yang diizinkan ke dalam satu array datar
    let rolesArray = [];
    for (const role of allowedRoles) {
      if (Array.isArray(role)) {
        rolesArray.push(...role);
      } else {
        rolesArray.push(role);
      }
    }

    // Bandingkan peran secara case-insensitive
    const normalizedUserRole = userRole.toLowerCase();
    const normalizedAllowedRoles = rolesArray.map(r => r.toLowerCase());

    // Jika peran pengguna tidak termasuk dalam daftar yang diizinkan, tolak akses
    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses' });
    }

    next();
  };
};

module.exports = authorize;