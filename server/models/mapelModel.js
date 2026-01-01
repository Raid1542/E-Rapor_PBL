/**
 * Nama File: mapelModel.js
 * Fungsi: Model untuk mengelola data mata pelajaran, termasuk validasi,
 *         pengurutan di rapor, dan integrasi dengan tahun ajaran.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 1 Oktober 2025
 */

const db = require('../config/db');

const mapelModel = {
  // Mengambil semua mata pelajaran berdasarkan tahun ajaran
  async getAllByTahunAjaran(tahun_ajaran_id) {
    const sql = `
      SELECT 
          mp.id_mata_pelajaran,
          mp.kode_mapel,
          mp.nama_mapel,
          mp.jenis,
          mp.kurikulum,
          mp.tahun_ajaran_id,
          mp.urutan_rapor,
          ta.tahun_ajaran,
          ta.semester
      FROM mata_pelajaran mp
      JOIN tahun_ajaran ta ON mp.tahun_ajaran_id = ta.id_tahun_ajaran
      WHERE mp.tahun_ajaran_id = ?
      ORDER BY mp.urutan_rapor ASC, mp.id_mata_pelajaran ASC 
    `;
    const [rows] = await db.execute(sql, [tahun_ajaran_id]);
    return rows;
  },

  // Mengambil satu mata pelajaran berdasarkan ID
  async getById(id) {
    const sql = `
      SELECT 
          mp.id_mata_pelajaran,
          mp.kode_mapel,
          mp.nama_mapel,
          mp.jenis,
          mp.kurikulum,
          mp.tahun_ajaran_id,
          mp.urutan_rapor,
          ta.tahun_ajaran,
          ta.semester
      FROM mata_pelajaran mp
      JOIN tahun_ajaran ta ON mp.tahun_ajaran_id = ta.id_tahun_ajaran
      WHERE mp.id_mata_pelajaran = ?
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows;
  },

  // Menambahkan mata pelajaran baru
  async create(data) {
    const {
      kode_mapel,
      nama_mapel,
      jenis,
      kurikulum,
      tahun_ajaran_id,
      urutan_rapor,
    } = data;
    const sql = `
      INSERT INTO mata_pelajaran 
        (kode_mapel, nama_mapel, jenis, kurikulum, tahun_ajaran_id, urutan_rapor)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      kode_mapel,
      nama_mapel,
      jenis,
      kurikulum,
      tahun_ajaran_id,
      urutan_rapor,
    ]);
    return result;
  },

  // Memperbarui data mata pelajaran
  async update(id, data) {
    const {
      kode_mapel,
      nama_mapel,
      jenis,
      kurikulum,
      tahun_ajaran_id,
      urutan_rapor,
    } = data;
    const sql = `
      UPDATE mata_pelajaran 
      SET 
        kode_mapel = ?,
        nama_mapel = ?,
        jenis = ?,
        kurikulum = ?,
        tahun_ajaran_id = ?,
        urutan_rapor = ?
      WHERE id_mata_pelajaran = ?
    `;
    const [result] = await db.execute(sql, [
      kode_mapel,
      nama_mapel,
      jenis,
      kurikulum,
      tahun_ajaran_id,
      urutan_rapor,
      id,
    ]);
    return result;
  },

  // Menghapus mata pelajaran
  async delete(id) {
    const sql = `DELETE FROM mata_pelajaran WHERE id_mata_pelajaran = ?`;
    const [result] = await db.execute(sql, [id]);
    return result;
  },

  // Mengecek apakah kode_mapel sudah digunakan di tahun ajaran yang sama
  async isKodeMapelExist(kode_mapel, tahun_ajaran_id, excludeId = null) {
    let sql = `
      SELECT 1
      FROM mata_pelajaran 
      WHERE kode_mapel = ? AND tahun_ajaran_id = ?
    `;
    const params = [kode_mapel, tahun_ajaran_id];

    if (excludeId !== null && excludeId !== undefined) {
      sql += ` AND id_mata_pelajaran != ?`;
      params.push(excludeId);
    }

    const [rows] = await db.execute(sql, params);
    return rows.length > 0;
  },

  // Mengecek apakah tahun_ajaran_id valid
  async isTahunAjaranValid(tahun_ajaran_id) {
    const sql = `SELECT 1 FROM tahun_ajaran WHERE id_tahun_ajaran = ?`;
    const [rows] = await db.execute(sql, [tahun_ajaran_id]);
    return rows.length > 0;
  },
};

module.exports = mapelModel;