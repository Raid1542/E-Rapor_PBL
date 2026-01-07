/**
 * Nama File: cekTahunAjaranAktif.js
 * Fungsi: Middleware untuk memastikan terdapat tahun ajaran aktif di sistem.
 *         Menyediakan status PTS/PAS aktif ke req.tahunAjaranAktif.
 * Pembuat: Raid Aqil Athallah
 * Tanggal: Januari 2026
 */

const db = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    // Ambil status periode penilaian dari tahun ajaran aktif
    const [rows] = await db.execute(
      "SELECT id_tahun_ajaran, status_pts, status_pas FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1"
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tidak ada tahun ajaran aktif' 
      });
    }

    // Simpan seluruh data tahun ajaran aktif ke req.tahunAjaranAktif
    req.tahunAjaranAktif = rows[0]; 
    next();
  } catch (err) {
    console.error('Middleware cekTahunAjaranAktif error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal memuat data tahun ajaran aktif' 
    });
  }
};