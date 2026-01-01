/**
 * Nama File: tahunAjaranModel.js
 * Fungsi: Model untuk mengelola data tahun ajaran dan semester,
 *         termasuk operasi CRUD dan logika status aktif/nonaktif.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 1 Oktober 2025
 */

const db = require('../config/db');

const tahunAjaranModel = {
  // Mengambil semua data tahun ajaran, diurutkan dengan status 'aktif' di atas
  async getAllTahunAjaran() {
    const [rows] = await db.execute(`
      SELECT 
          id_tahun_ajaran,
          tahun_ajaran,
          semester,
          status,
          tanggal_pembagian_pts,
          tanggal_pembagian_pas,
          status_pts,
          status_pas
      FROM tahun_ajaran
      ORDER BY 
          CASE 
              WHEN status = 'aktif' THEN 0 
              ELSE 1 
          END,
          id_tahun_ajaran DESC
    `);
    return rows;
  },

  // Menambahkan tahun ajaran baru dan menonaktifkan yang lama
  async createTahunAjaran(data) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute("UPDATE tahun_ajaran SET status = 'nonaktif'");

      const [result] = await connection.execute(
        `INSERT INTO tahun_ajaran (
            tahun_ajaran, 
            semester, 
            tanggal_pembagian_pts, 
            tanggal_pembagian_pas, 
            status
        ) VALUES (?, ?, ?, ?, 'aktif')`,
        [
          data.tahun_ajaran,
          data.semester,
          data.tanggal_pembagian_pts,
          data.tanggal_pembagian_pas,
        ]
      );

      await connection.commit();
      return result.insertId > 0;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  // Memperbarui data tahun ajaran berdasarkan ID
  async updateTahunAjaranById(id, data) {
    const [result] = await db.execute(
      `UPDATE tahun_ajaran 
        SET 
            tahun_ajaran = ?, 
            semester = ?, 
            tanggal_pembagian_pts = ?, 
            tanggal_pembagian_pas = ?
        WHERE id_tahun_ajaran = ?`,
      [
        data.tahun_ajaran,
        data.semester,
        data.tanggal_pembagian_pts,
        data.tanggal_pembagian_pas,
        id,
      ]
    );
    return result.affectedRows > 0;
  },
};

module.exports = tahunAjaranModel;