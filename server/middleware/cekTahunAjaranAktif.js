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
    const [rows] = await db.execute(`
      SELECT id_tahun_ajaran, status_pts, status_pas
      FROM tahun_ajaran
      WHERE status = 'aktif'
      LIMIT 1
    `);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tidak ada tahun ajaran aktif'
      });
    }

    const ta = rows[0];

    // Simpan ID sebagai req.tahunAjaranAktifId (sesuai ekspektasi controller)
    req.tahunAjaranAktifId = ta.id_tahun_ajaran;

    // Simpan juga objek lengkap jika fitur lain membutuhkan status_pts/status_pas
    req.tahunAjaranAktif = ta;

    next();
  } catch (err) {
    console.error('Middleware cekTahunAjaranAktif error:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat data tahun ajaran aktif'
    });
  }
};