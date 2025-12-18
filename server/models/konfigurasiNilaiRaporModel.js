const db = require('../config/db');

// Fungsi untuk mendapatkan konfigurasi berdasarkan nilai numerik
const getGradeDeskripsiByNilai = async (nilai) => {
    // Pastikan nilai adalah angka
    const numNilai = Number(nilai);
    if (isNaN(numNilai) || numNilai < 0 || numNilai > 100) {
        return { grade: null, deskripsi: 'Nilai tidak valid' };
    }

    // Ambil konfigurasi dari tabel konfigurasi_nilai_rapor
    const [rows] = await db.execute(`
        SELECT deskripsi
        FROM konfigurasi_nilai_rapor
        WHERE ? BETWEEN min_nilai AND max_nilai
        ORDER BY urutan ASC
        LIMIT 1
    `, [numNilai]);

    if (rows.length === 0) {
        return { grade: null, deskripsi: 'Tidak ada konfigurasi yang sesuai' };
    }

    return {
        grade: null, // ← Penting! Grade selalu null untuk akademik
        deskripsi: rows[0].deskripsi
    };
};

// Fungsi untuk mendapatkan semua kategori/rentang nilai
const getAllKategori = async () => {
    const [rows] = await db.execute(`
        SELECT id, min_nilai, max_nilai, deskripsi, urutan
        FROM konfigurasi_nilai_rapor
        ORDER BY urutan ASC
    `);
    return rows;
};

// Fungsi untuk membuat kategori baru (tanpa grade)
const createKategori = async ({ min_nilai, max_nilai, deskripsi, urutan }) => {
    const [result] = await db.execute(`
        INSERT INTO konfigurasi_nilai_rapor (min_nilai, max_nilai, deskripsi, urutan)
        VALUES (?, ?, ?, ?)
    `, [min_nilai, max_nilai, deskripsi, urutan || 0]);

    return {
        id: result.insertId,
        min_nilai,
        max_nilai,
        deskripsi,
        urutan: urutan || 0
    };
};

// Fungsi untuk memperbarui kategori (tanpa grade)
const updateKategori = async (id, { min_nilai, max_nilai, deskripsi, urutan }) => {
    const [result] = await db.execute(`
        UPDATE konfigurasi_nilai_rapor
        SET min_nilai = ?, max_nilai = ?, deskripsi = ?, urutan = ?
        WHERE id = ?
    `, [min_nilai, max_nilai, deskripsi, urutan || 0, id]);

    return result.affectedRows > 0;
};

// Fungsi untuk menghapus kategori
const deleteKategori = async (id) => {
    const [result] = await db.execute(`
        DELETE FROM konfigurasi_nilai_rapor
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