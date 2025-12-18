const db = require('../config/db');

// Fungsi untuk mendapatkan konfigurasi berdasarkan nilai numerik
const getGradeDeskripsiByNilai = async (nilai) => {
    // Pastikan nilai adalah angka
    const numNilai = Number(nilai);
    if (isNaN(numNilai) || numNilai < 0 || numNilai > 100) {
        return { grade: 'D', deskripsi: 'Nilai tidak valid' };
    }

    // Ambil konfigurasi dari tabel konfigurasi_nilai_kokurikuler
    const [rows] = await db.execute(`
        SELECT grade, deskripsi
        FROM konfigurasi_nilai_kokurikuler
        WHERE ? BETWEEN min_nilai AND max_nilai
        ORDER BY urutan ASC
        LIMIT 1
    `, [numNilai]);

    if (rows.length === 0) {
        return { grade: 'D', deskripsi: 'Tidak ada konfigurasi yang sesuai' };
    }

    return {
        grade: rows[0].grade,
        deskripsi: rows[0].deskripsi
    };
};

// Fungsi untuk mendapatkan semua kategori/rentang nilai
const getAllKategori = async () => {
    const [rows] = await db.execute(`
        SELECT id, min_nilai, max_nilai, grade, deskripsi, urutan
        FROM konfigurasi_nilai_kokurikuler
        ORDER BY urutan ASC
    `);
    return rows;
};

// Fungsi untuk membuat kategori baru (dengan grade)
const createKategori = async ({ min_nilai, max_nilai, grade, deskripsi, urutan }) => {
    const [result] = await db.execute(`
        INSERT INTO konfigurasi_nilai_kokurikuler (min_nilai, max_nilai, grade, deskripsi, urutan)
        VALUES (?, ?, ?, ?, ?)
    `, [min_nilai, max_nilai, grade, deskripsi, urutan || 0]);

    return {
        id: result.insertId,
        min_nilai,
        max_nilai,
        grade,
        deskripsi,
        urutan: urutan || 0
    };
};

// Fungsi untuk memperbarui kategori (dengan grade)
const updateKategori = async (id, { min_nilai, max_nilai, grade, deskripsi, urutan }) => {
    const [result] = await db.execute(`
        UPDATE konfigurasi_nilai_kokurikuler
        SET min_nilai = ?, max_nilai = ?, grade = ?, deskripsi = ?, urutan = ?
        WHERE id = ?
    `, [min_nilai, max_nilai, grade, deskripsi, urutan || 0, id]);

    return result.affectedRows > 0;
};

// Fungsi untuk menghapus kategori
const deleteKategori = async (id) => {
    const [result] = await db.execute(`
        DELETE FROM konfigurasi_nilai_kokurikuler
        WHERE id = ?
    `, [id]);

    return result.affectedRows > 0;
};

module.exports = {
    getGradeDeskripsiByNilai,
    getAllKategori,
    createKategori,
    updateKategori,
    deleteKategori
};