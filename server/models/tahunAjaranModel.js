const db = require('../config/db');

// Ambil SEMUA data (untuk ditampilkan di tabel)
const getAllTahunAjaran = async () => {
    const [rows] = await db.execute(`
        SELECT 
            id_tahun_ajaran,
            tahun_ajaran,
            semester,
            status,
            tanggal_pembagian_pts,
            tanggal_pembagian_pas,
            status_pts,
            status_pas
        FROM tahun_ajaran
        ORDER BY 
            CASE 
                WHEN status = 'aktif' THEN 0 
                ELSE 1 
            END,
            id_tahun_ajaran DESC
    `);
    return rows;
};

// Tambah data BARU (dan nonaktifkan yang lama)
const createTahunAjaran = async (data) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Nonaktifkan yang lama
        await connection.execute("UPDATE tahun_ajaran SET status = 'nonaktif'");

        // Tambah yang baru sebagai aktif
        const [result] = await connection.execute(
            `INSERT INTO tahun_ajaran (
                tahun_ajaran, 
                semester, 
                tanggal_pembagian_pts, 
                tanggal_pembagian_pas, 
                status
            ) VALUES (?, ?, ?, ?, 'aktif')`,
            [
                data.tahun_ajaran, 
                data.semester, 
                data.tanggal_pembagian_pts, 
                data.tanggal_pembagian_pas
            ]
        );

        await connection.commit();
        return result.insertId > 0;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

// Update berdasarkan ID (untuk edit)
const updateTahunAjaranById = async (id, data) => {
    const [result] = await db.execute(
        `UPDATE tahun_ajaran 
        SET 
            tahun_ajaran = ?, 
            semester = ?, 
            tanggal_pembagian_pts = ?, 
            tanggal_pembagian_pas = ?
        WHERE id_tahun_ajaran = ?`,
        [
            data.tahun_ajaran, 
            data.semester, 
            data.tanggal_pembagian_pts, 
            data.tanggal_pembagian_pas, 
            id
        ]
    );
    return result.affectedRows > 0;
};

module.exports = {
    getAllTahunAjaran,
    createTahunAjaran,
    updateTahunAjaranById
};