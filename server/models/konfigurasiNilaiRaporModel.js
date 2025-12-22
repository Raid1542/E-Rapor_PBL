const db = require('../config/db');

// Fungsi untuk mendapatkan konfigurasi berdasarkan nilai numerik
const getDeskripsiByNilai = async (nilai, mapelId) => {
    if (nilai == null || mapelId == null) {
        return 'Belum ada deskripsi';
    }

    const [rows] = await db.execute(`
        SELECT deskripsi
        FROM konfigurasi_nilai_rapor
        WHERE mapel_id = ?
          AND ? BETWEEN min_nilai AND max_nilai
          AND is_active = 1
        ORDER BY min_nilai DESC
        LIMIT 1
    `, [mapelId, nilai]);

    return rows.length > 0 ? rows[0].deskripsi : 'Belum ada deskripsi';
};


// Fungsi untuk mendapatkan semua kategori/rentang nilai
const getAllKategori = async (mapelId = null, isRataRata = false) => {
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

    if (isRataRata) {
        query += ' AND mapel_id IS NULL';
    } else if (mapelId !== null) {
        query += ' AND mapel_id = ?';
        params.push(mapelId);
    }

    query += ' ORDER BY urutan ASC';

    const [rows] = await db.execute(query, params);
    return rows;
};


// Fungsi untuk membuat kategori baru (tanpa grade)
const createKategori = async ({ mapel_id, min_nilai, max_nilai, deskripsi, urutan }) => {

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