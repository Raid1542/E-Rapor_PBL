/**
 * Nama File: cekTahunAjaranAktif.js
 * Fungsi: Middleware untuk memastikan terdapat tahun ajaran aktif di sistem.
 *         Jika ditemukan, ID tahun ajaran aktif disimpan ke objek `req` untuk digunakan handler berikutnya.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 1 Oktober 2025
 */

const db = require('../config/db');

// Middleware untuk memeriksa dan menyimpan ID tahun ajaran aktif
module.exports = async (req, res, next) => {
  // Ambil ID tahun ajaran yang sedang aktif dari database
  const [rows] = await db.execute(
    "SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1"
  );

  // Jika tidak ada tahun ajaran aktif, kembalikan error
  if (rows.length === 0) {
    return res.status(400).json({ message: 'Tidak ada tahun ajaran aktif' });
  }

  // Simpan ID tahun ajaran aktif ke objek request
  req.tahunAjaranAktifId = rows[0].id_tahun_ajaran;
  next();
};