const db = require('../config/db');

/**
 * Ambil semua bobot untuk satu mata pelajaran
 */
const getBobotByMapel = async (mapelId) => {
    const [rows] = await db.execute(
        `SELECT komponen_id, bobot, is_active
         FROM konfigurasi_mapel_komponen
         WHERE mapel_id = ?
         ORDER BY komponen_id`,
        [mapelId]
    );
    return rows;
};

/**
 * Update semua bobot untuk satu mata pelajaran
 */
const updateBobotByMapel = async (mapelId, bobotList) => {
    // Hapus semua data bobot lama untuk mapel ini
    await db.execute('DELETE FROM konfigurasi_mapel_komponen WHERE mapel_id = ?', [mapelId]);

    // Masukkan data baru
    for (const item of bobotList) {
        await db.execute(`
            INSERT INTO konfigurasi_mapel_komponen (mapel_id, komponen_id, bobot, is_active)
            VALUES (?, ?, ?, ?)
        `, [mapelId, item.komponen_id, item.bobot, item.is_active]);
    }

    // Ambil ulang data yang sudah disimpan
    const [rows] = await db.execute(`
        SELECT komponen_id, bobot, is_active 
        FROM konfigurasi_mapel_komponen 
        WHERE mapel_id = ?
    `, [mapelId]);

    return rows;
};

/**
 * Ambil total bobot (untuk validasi: harus = 100%)
 */
const getTotalBobot = async (mapelId) => {
    const [rows] = await db.execute(
        `SELECT SUM(bobot) AS total
         FROM konfigurasi_mapel_komponen
         WHERE mapel_id = ? AND is_active = 1`,
        [mapelId]
    );
    return rows[0]?.total || 0;
};

module.exports = {
    getBobotByMapel,
    updateBobotByMapel,
    getTotalBobot
};