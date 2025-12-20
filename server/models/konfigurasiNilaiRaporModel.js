const db = require('../config/db');

// Fungsi untuk mendapatkan konfigurasi berdasarkan nilai numerik
const getDeskripsiByNilai = async (nilai, mapelId) => {
    const numNilai = Number(nilai);
    if (isNaN(numNilai) || numNilai < 0 || numNilai > 100) {
        return 'Nilai tidak valid';
    }

    const [rows] = await db.execute(`
        SELECT deskripsi
        FROM konfigurasi_nilai_rapor
        WHERE mapel_id = ?
          AND ? BETWEEN min_nilai AND max_nilai
          AND is_active = 1
        ORDER BY urutan ASC
        LIMIT 1
    `, [mapelId, numNilai]);

    return rows.length > 0 ? rows[0].deskripsi : 'Tidak ada deskripsi';
};


// Fungsi untuk mendapatkan semua kategori/rentang nilai
const getAllKategori = async (mapelId = null) => {
    let query = `
        SELECT 
            id_config AS id,
            mapel_id,
            min_nilai,
            max_nilai,
            deskripsi,
            urutan,
            is_active,
            created_at,
            updated_at
        FROM konfigurasi_nilai_rapor
        WHERE is_active = 1
    `;
    const params = [];

    if (mapelId !== null) {
        query += ' AND mapel_id = ?';
        params.push(mapelId);
    }

    query += ' ORDER BY urutan ASC';

    const [rows] = await db.execute(query, params);
    return rows;
};

// Fungsi untuk membuat kategori baru (tanpa grade)
const createKategori = async ({ mapel_id, min_nilai, max_nilai, deskripsi, urutan }) => {
    if (mapel_id == null) {
        throw new Error('mapel_id wajib diisi');
    }

    const [result] = await db.execute(`
        INSERT INTO konfigurasi_nilai_rapor (
            mapel_id, min_nilai, max_nilai, deskripsi, urutan, is_active
        ) VALUES (?, ?, ?, ?, ?, 1)
    `, [mapel_id, min_nilai, max_nilai, deskripsi, urutan || 0]);

    const [newRow] = await db.execute(`
        SELECT 
            id_config AS id,
            mapel_id,
            min_nilai,
            max_nilai,
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
const updateKategori = async (id, { mapel_id, min_nilai, max_nilai, deskripsi, urutan }) => {
    // Validasi: pastikan mapel_id tidak null
    if (mapel_id == null) {
        throw new Error('mapel_id wajib diisi');
    }

    const [result] = await db.execute(`
        UPDATE konfigurasi_nilai_rapor
        SET 
            mapel_id = ?,
            min_nilai = ?,
            max_nilai = ?,
            deskripsi = ?,
            urutan = ?,
            updated_at = NOW()
        WHERE id_config = ?
    `, [
        mapel_id,
        min_nilai,
        max_nilai,
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
    getDeskripsiByNilai,
    getAllKategori,
    createKategori,
    updateKategori,
    deleteKategori
};