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
        SELECT grade, deskripsi
        FROM konfigurasi_nilai_rapor
        WHERE ? BETWEEN min_nilai AND max_nilai
            AND is_active = 1
        ORDER BY urutan ASC
        LIMIT 1
    `, [numNilai]);

    if (rows.length === 0) {
        return { grade: null, deskripsi: 'Tidak ada konfigurasi yang sesuai' };
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
            id_config AS id, -- Alias untuk kompatibilitas dengan frontend
            mapel_id,
            min_nilai,
            max_nilai,
            grade,
            deskripsi,
            urutan,
            is_active,
            created_at,
            updated_at
        FROM konfigurasi_nilai_rapor
        WHERE is_active = 1
        ORDER BY urutan ASC
    `);
    return rows;
};

// Fungsi untuk membuat kategori baru (tanpa grade)
const createKategori = async ({ mapel_id, min_nilai, max_nilai, grade, deskripsi, urutan }) => {
    // Jika grade tidak diberikan, set default ke 'A'
    const gradeValue = grade || 'A';

    const [result] = await db.execute(`
        INSERT INTO konfigurasi_nilai_rapor (
            mapel_id, min_nilai, max_nilai, grade, deskripsi, urutan, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [mapel_id, min_nilai, max_nilai, gradeValue, deskripsi, urutan || 0]);

    // Kembalikan data yang baru dibuat
    const [newRow] = await db.execute(`
        SELECT 
            id_config AS id,
            mapel_id,
            min_nilai,
            max_nilai,
            grade,
            deskripsi,
            urutan,
            is_active,
            created_at,
            updated_at
        FROM konfigurasi_nilai_rapor
        WHERE id_config = ?
    `, [result.insertId]);

    return newRow[0];
};

// Fungsi untuk memperbarui kategori (tanpa grade)
const updateKategori = async (id, { mapel_id, min_nilai, max_nilai, grade, deskripsi, urutan }) => {
    // Jika grade tidak diberikan, jangan ubah
    const [result] = await db.execute(`
        UPDATE konfigurasi_nilai_rapor
        SET 
            mapel_id = ?,
            min_nilai = ?,
            max_nilai = ?,
            grade = COALESCE(?, grade),
            deskripsi = ?,
            urutan = ?,
            updated_at = NOW()
        WHERE id_config = ?
    `, [
        mapel_id,
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
        UPDATE konfigurasi_nilai_rapor
        SET is_active = 0, updated_at = NOW()
        WHERE id_config = ?
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