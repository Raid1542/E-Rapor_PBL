// models/konfigurasiNilaiModel.js
const db = require('../config/db');

/**
 * Ambil semua kategori nilai berdasarkan tipe (default: 'umum')
 */
const getAllKategori = async (kategori = 'umum') => {
    const [rows] = await db.execute(
        `SELECT id, min_nilai, max_nilai, kategori, grade, deskripsi, urutan
         FROM konfigurasi_nilai_kokurikuler
         WHERE kategori = ?
         ORDER BY urutan ASC`,
        [kategori]
    );
    return rows;
};

/**
 * Ambil semua kategori tanpa filter (opsional untuk admin)
 */
const getAllKategoriLengkap = async () => {
    const [rows] = await db.execute(
        `SELECT id, min_nilai, max_nilai, kategori, grade, deskripsi, urutan
         FROM konfigurasi_nilai_kokurikuler
         ORDER BY kategori, urutan ASC`
    );
    return rows;
};

/**
 * Tambah kategori baru
 */
const createKategori = async (data) => {
    const { min_nilai, max_nilai, kategori, grade, deskripsi } = data;
    const [result] = await db.execute(
        `INSERT INTO konfigurasi_nilai_kokurikuler 
         (min_nilai, max_nilai, kategori, grade, deskripsi, urutan)
         VALUES (?, ?, ?, ?, ?, (
             SELECT COALESCE(MAX(urutan), 0) + 1 
             FROM (SELECT urutan FROM konfigurasi_nilai_kokurikuler) AS tmp
         ))`,
        [min_nilai, max_nilai, kategori, grade, deskripsi]
    );
    return { id: result.insertId, ...data };
};

/**
 * Update kategori berdasarkan ID
 */
const updateKategori = async (id, data) => {
    const { min_nilai, max_nilai, kategori, grade, deskripsi } = data;
    const [result] = await db.execute(
        `UPDATE konfigurasi_nilai_kokurikuler
         SET min_nilai = ?, max_nilai = ?, kategori = ?, grade = ?, deskripsi = ?, updated_at = NOW()
         WHERE id = ?`,
        [min_nilai, max_nilai, kategori, grade, deskripsi, id]
    );
    return result.affectedRows > 0;
};

/**
 * Hapus kategori
 */
const deleteKategori = async (id) => {
    const [result] = await db.execute(
        `DELETE FROM konfigurasi_nilai_kokurikuler WHERE id = ?`,
        [id]
    );
    return result.affectedRows > 0;
};

/**
 * Cari grade & deskripsi berdasarkan nilai dan kategori
 */
const getGradeDeskripsiByNilai = async (nilai, kategori = 'umum') => {
    if (nilai == null || nilai < 0 || nilai > 100) {
        return { grade: null, deskripsi: null };
    }
    const [rows] = await db.execute(
        `SELECT grade, deskripsi
         FROM konfigurasi_nilai_kokurikuler
         WHERE kategori = ? AND ? BETWEEN min_nilai AND max_nilai
         ORDER BY urutan ASC
         LIMIT 1`,
        [kategori, nilai]
    );
    if (rows.length > 0) {
        return { grade: rows[0].grade, deskripsi: rows[0].deskripsi };
    }
    return { grade: 'D', deskripsi: 'Nilai di luar kategori yang ditentukan' };
};

module.exports = {
    getAllKategori,
    getAllKategoriLengkap,
    createKategori,
    updateKategori,
    deleteKategori,
    getGradeDeskripsiByNilai
};