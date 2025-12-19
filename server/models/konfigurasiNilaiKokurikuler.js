const db = require('../config/db');

// Fungsi untuk mendapatkan konfigurasi berdasarkan nilai numerik (per aspek)
const getGradeDeskripsiByNilai = async (nilai, aspek) => {
    const numNilai = Number(nilai);
    if (isNaN(numNilai) || numNilai < 0 || numNilai > 100 || !aspek) {
        return { grade: 'D', deskripsi: 'Nilai atau aspek tidak valid' };
    }

    // Ambil konfigurasi dari tabel KATEGORI_GRADE_KOKURIKULER
    const [rows] = await db.execute(`
        SELECT grade, deskripsi
        FROM kategori_grade_kokurikuler
        WHERE id_aspek_kokurikuler = ?
          AND ? BETWEEN rentang_min AND rentang_max
        ORDER BY urutan ASC
        LIMIT 1
    `, [aspek, numNilai]);

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
        SELECT 
            id_kategori_grade_kokurikuler AS id,
            id_aspek_kokurikuler,
            rentang_min AS min_nilai,
            rentang_max AS max_nilai,
            grade,
            deskripsi,
            urutan
        FROM kategori_grade_kokurikuler
        ORDER BY urutan ASC
    `);
    return rows;
};

// Fungsi untuk membuat kategori baru (dengan grade) → ke tabel KATEGORI_GRADE_KOKURIKULER
const createKategori = async ({ id_aspek_kokurikuler, min_nilai, max_nilai, grade, deskripsi, urutan }) => {
    const [result] = await db.execute(`
        INSERT INTO kategori_grade_kokurikuler (
            id_aspek_kokurikuler,
            rentang_min,
            rentang_max,
            grade,
            deskripsi,
            urutan
        ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
        id_aspek_kokurikuler,   
        min_nilai,
        max_nilai,
        grade,
        deskripsi,
        urutan || 0
    ]);

    return {
        id: result.insertId,
        id_aspek_kokurikuler,
        min_nilai,
        max_nilai,
        grade,
        deskripsi,
        urutan: urutan || 0
    };
};

// Fungsi untuk memperbarui kategori
const updateKategori = async (id, { id_aspek_kokurikuler, min_nilai, max_nilai, grade, deskripsi, urutan }) => {
    const [result] = await db.execute(`
        UPDATE kategori_grade_kokurikuler
        SET 
            id_aspek_kokurikuler = ?,
            rentang_min = ?,
            rentang_max = ?,
            grade = ?,
            deskripsi = ?,
            urutan = ?
        WHERE id_kategori_grade_kokurikuler = ?
    `, [
        id_aspek_kokurikuler,
        min_nilai,
        max_nilai,
        grade,
        deskripsi,
        urutan || 0,
        id
    ]);

    return result.affectedRows > 0;
};

// Fungsi untuk menghapus kategori
const deleteKategori = async (id) => {
    const [result] = await db.execute(`
        DELETE FROM kategori_grade_kokurikuler
        WHERE id_kategori_grade_kokurikuler = ?
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