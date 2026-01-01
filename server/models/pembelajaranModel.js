/**
 * Nama File: pembelajaranModel.js
 * Fungsi: Model untuk mengelola data pembelajaran (penugasan guru mengajar),
 *         mencakup operasi CRUD, serta fungsi helper untuk daftar kelas, mapel, dan guru.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 1 Oktober 2025
 */

const db = require('../config/db');

const pembelajaranModel = {
  // Mengambil semua data pembelajaran berdasarkan tahun ajaran
  async getAllByTahunAjaran(tahunAjaranId) {
    const [rows] = await db.execute(
      `
        SELECT p.*, k.nama_kelas, mp.nama_mapel, mp.jenis AS jenis_mapel, u.nama_lengkap AS nama_guru
        FROM pembelajaran p
        JOIN kelas k ON p.kelas_id = k.id_kelas
        JOIN mata_pelajaran mp ON p.mata_pelajaran_id = mp.id_mata_pelajaran
        JOIN user u ON p.user_id = u.id_user
        WHERE p.tahun_ajaran_id = ?
        ORDER BY k.nama_kelas, mp.nama_mapel
      `,
      [tahunAjaranId]
    );
    return rows;
  },

  // Menambahkan data pembelajaran baru
  async create(data, connection = db) {
    const { tahun_ajaran_id, kelas_id, mata_pelajaran_id, user_id } = data;
    const [result] = await connection.execute(
      `INSERT INTO pembelajaran (tahun_ajaran_id, kelas_id, mata_pelajaran_id, user_id)
        VALUES (?, ?, ?, ?)`,
      [tahun_ajaran_id, kelas_id, mata_pelajaran_id, user_id]
    );
    return result.insertId;
  },

  // Memperbarui data pembelajaran berdasarkan ID
  async update(id, data, connection = db) {
    const { kelas_id, mata_pelajaran_id, user_id } = data;
    const [result] = await connection.execute(
      `UPDATE pembelajaran 
        SET kelas_id = ?, mata_pelajaran_id = ?, user_id = ?
        WHERE id = ?`,
      [kelas_id, mata_pelajaran_id, user_id, id]
    );
    return result.affectedRows > 0;
  },

  // Menghapus data pembelajaran berdasarkan ID
  async deleteById(id, connection = db) {
    const [result] = await connection.execute(
      `DELETE FROM pembelajaran WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  },

  // Mengambil daftar guru aktif dengan role guru
  async getGuruAktif() {
    const [rows] = await db.execute(`
      SELECT 
          u.id_user AS id,
          u.nama_lengkap AS nama
      FROM user u
      INNER JOIN user_role ur ON u.id_user = ur.id_user
      WHERE u.status = 'aktif'
        AND ur.role IN ('guru kelas', 'guru bidang studi')
      ORDER BY u.nama_lengkap ASC
    `);
    return rows;
  },

  // Mengambil daftar kelas berdasarkan tahun ajaran
  async getKelasByTahunAjaran(tahunAjaranId) {
    const [rows] = await db.execute(
      `
        SELECT 
            id_kelas AS id,
            nama_kelas AS nama
        FROM kelas
        WHERE tahun_ajaran_id = ?
        ORDER BY nama_kelas ASC
      `,
      [tahunAjaranId]
    );
    return rows;
  },

  // Mengambil daftar mata pelajaran berdasarkan tahun ajaran
  async getMapelByTahunAjaran(tahunAjaranId) {
    const [rows] = await db.execute(
      `
        SELECT 
            id_mata_pelajaran AS id,
            nama_mapel AS nama
        FROM mata_pelajaran
        WHERE tahun_ajaran_id = ?
        ORDER BY nama_mapel ASC
      `,
      [tahunAjaranId]
    );
    return rows;
  },
};

module.exports = pembelajaranModel;