/**
 * Nama File: hash.js
 * Fungsi: Utilitas untuk hashing dan verifikasi password menggunakan bcryptjs.
 *         Digunakan untuk keamanan autentikasi pengguna.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 1 Oktober 2025
 */

const bcrypt = require('bcryptjs');

const hash = {
  // Menghasilkan hash dari password teks biasa
  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  },

  // Membandingkan password teks biasa dengan hash yang tersimpan
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  },
};

module.exports = hash;