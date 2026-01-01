/**
 * Nama File: sekolahModel.js
 * Fungsi: Model untuk mengelola data profil sekolah (hanya satu baris, id = 1),
 *         mencakup pengambilan dan pembaruan informasi institusi seperti nama, alamat, kontak, dan logo.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 1 Oktober 2025
 */

const db = require('../config/db');

const sekolahModel = {
  // Mengambil data sekolah (hanya satu entri, id = 1)
  async getSekolah() {
    const [rows] = await db.execute('SELECT * FROM sekolah WHERE id = 1');
    return rows[0] || null;
  },

  // Memperbarui atau membuat data sekolah jika belum ada
  async updateSekolah(newData) {
    try {
      const existing = await sekolahModel.getSekolah();

      const defaultData = {
        nama_sekolah: 'SDIT ULIL ALBAB',
        npsn: '0000000000',
        nss: '00000000',
        alamat: 'Alamat Sekolah',
        kode_pos: '00000',
        telepon: '0000000000',
        email: 'info@sekolah.sch.id',
        website: 'https://sekolah.sch.id',
        kepala_sekolah: 'Kepala Sekolah',
        niy_kepala_sekolah: '0000000000000000',
        logo_path: '/images/logo-default.png',
      };

      const current = existing || defaultData;

      const merged = {
        nama_sekolah: newData.nama_sekolah ?? current.nama_sekolah,
        npsn: newData.npsn ?? current.npsn,
        nss: newData.nss ?? current.nss,
        alamat: newData.alamat ?? current.alamat,
        kode_pos: newData.kode_pos ?? current.kode_pos,
        telepon: newData.telepon ?? current.telepon,
        email: newData.email ?? current.email,
        website: (newData.website ?? current.website).trim(),
        kepala_sekolah: newData.kepala_sekolah ?? current.kepala_sekolah,
        niy_kepala_sekolah: newData.niy_kepala_sekolah ?? current.niy_kepala_sekolah,
        logo_path: newData.logo_path ?? current.logo_path,
      };

      const [result] = await db.execute(
        `UPDATE sekolah SET 
          nama_sekolah = ?,
          npsn = ?,
          nss = ?,
          alamat = ?,
          kode_pos = ?,
          telepon = ?,
          email = ?,
          website = ?,
          kepala_sekolah = ?,
          niy_kepala_sekolah = ?,
          logo_path = ?
        WHERE id = 1`,
        Object.values(merged)
      );

      if (result.affectedRows === 0) {
        await db.execute(
          `INSERT INTO sekolah (
            id, nama_sekolah, npsn, nss, alamat, kode_pos, telepon, email, website,
            kepala_sekolah, niy_kepala_sekolah, logo_path
          ) VALUES (
            1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          )`,
          Object.values(merged)
        );
      }
    } catch (err) {
      console.error('Error updateSekolah:', err);
      throw err;
    }
  },
};

module.exports = sekolahModel;