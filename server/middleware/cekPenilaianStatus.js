/**
 * Nama File: cekPenilaianStatus.js
 * Fungsi: Middleware untuk memeriksa status periode penilaian aktif (PTS/PAS) pada tahun ajaran berjalan.
 *         Menentukan jenis penilaian yang sedang berlangsung dan memvalidasi akses berdasarkan status tersebut.
 *         Hasil pemeriksaan disimpan ke objek `req` untuk digunakan oleh handler berikutnya.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 1 Oktober 2025
 */

const db = require('../config/db');

// Middleware untuk memeriksa status periode penilaian (PTS/PAS) pada tahun ajaran aktif
const cekPenilaianStatus = async (req, res, next) => {
  try {
    // Ambil data tahun ajaran aktif dari database
    const [taRows] = await db.execute(`
      SELECT id_tahun_ajaran, semester, status_pts, status_pas 
      FROM tahun_ajaran 
      WHERE status = 'aktif' 
      LIMIT 1
    `);

    if (taRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tahun ajaran aktif belum diatur oleh admin',
      });
    }

    const { status_pts, status_pas } = taRows[0];

    // Tentukan jenis penilaian yang sedang aktif
    let jenis_penilaian = null;
    if (status_pts === 'aktif' && status_pas === 'aktif') {
      // Hindari konflik: kedua periode tidak boleh aktif bersamaan
      return res.status(400).json({
        success: false,
        message: 'Kesalahan sistem: PTS dan PAS tidak boleh aktif bersamaan.',
      });
    } else if (status_pts === 'aktif') {
      jenis_penilaian = 'PTS';
    } else if (status_pas === 'aktif') {
      jenis_penilaian = 'PAS';
    } else {
      // Tidak ada periode aktif — periksa apakah sudah dikunci
      const isAnyLocked = status_pts === 'selesai' || status_pas === 'selesai';
      if (isAnyLocked) {
        return res.status(403).json({
          success: false,
          message: '🔒 Periode penilaian saat ini telah ditutup. Data tidak dapat diubah.',
        });
      } else {
        return res.status(403).json({
          success: false,
          message: '⏳ Belum ada periode penilaian yang dibuka oleh admin.',
        });
      }
    }

    // Simpan data tahun ajaran dan jenis penilaian ke objek request
    req.tahunAjaranAktif = taRows[0];
    req.jenis_penilaian = jenis_penilaian;
    next();
  } catch (err) {
    console.error('Error di cekPenilaianStatus:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal memeriksa status penilaian',
    });
  }
};

module.exports = cekPenilaianStatus;