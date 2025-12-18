const db = require('../config/db');

/**
 * Ambil semua komponen penilaian aktif
 */
const getAllKomponen = async () => {
    const [rows] = await db.execute(
        `SELECT id_komponen, nama_komponen, urutan
         FROM komponen_penilaian
         ORDER BY urutan ASC`
    );
    return rows;
};

/**
 * Ambil komponen berdasarkan ID
 */
const getKomponenById = async (id) => {
    const [rows] = await db.execute(
        `SELECT id_komponen, nama_komponen, urutan
         FROM komponen_penilaian
         WHERE id_komponen = ?`,
        [id]
    );
    return rows[0] || null;
};

module.exports = {
    getAllKomponen,
    getKomponenById
};