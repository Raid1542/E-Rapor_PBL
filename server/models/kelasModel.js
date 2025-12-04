const db = require('../config/db');

/**
 * Mengambil semua data kelas
 */
const getAll = async () => {
    const [rows] = await db.execute('SELECT * FROM kelas ORDER BY id_kelas ASC');
    return rows;
};

/**
 * Mengambil data kelas berdasarkan ID
 */
const getById = async (id) => {
    const [rows] = await db.execute('SELECT * FROM kelas WHERE id_kelas = ?', [id]);
    return rows[0] || null;
};

/**
 * Menambahkan kelas baru
 */
const create = async (data) => {
    const { nama_kelas, fase } = data;
    const [result] = await db.execute(
        'INSERT INTO kelas (nama_kelas, fase, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [nama_kelas, fase]
    );
    return result.insertId;
};

/**
 * Memperbarui data kelas
 */
const update = async (id, data) => {
    const { nama_kelas, fase } = data;
    const [result] = await db.execute(
        'UPDATE kelas SET nama_kelas = ?, fase = ?, updated_at = NOW() WHERE id_kelas = ?',
        [nama_kelas, fase, id]
    );
    return result.affectedRows > 0;
};

/**
 * Menghapus kelas
 */
const remove = async (id) => {
    const [result] = await db.execute('DELETE FROM kelas WHERE id_kelas = ?', [id]);
    return result.affectedRows > 0;
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};