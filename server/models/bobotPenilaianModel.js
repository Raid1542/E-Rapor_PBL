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
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Hapus dulu semua entri lama untuk mapel ini
        await connection.execute(
            `DELETE FROM konfigurasi_mapel_komponen WHERE mapel_id = ?`,
            [mapelId]
        );

        // Insert yang baru
        if (bobotList.length > 0) {
            const values = bobotList.map(item => [
                mapelId,
                item.komponen_id,
                item.bobot,
                item.is_active ? 1 : 0
            ]);
            await connection.query(
                `INSERT INTO konfigurasi_mapel_komponen (mapel_id, komponen_id, bobot, is_active)
                 VALUES ?`,
                [values]
            );
        }

        await connection.commit();
        return true;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
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