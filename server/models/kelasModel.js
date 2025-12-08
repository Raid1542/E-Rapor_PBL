const db = require('../config/db');

/**
 * Mengambil semua data kelas (template statis)
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
 * Menambahkan kelas baru (template)
 * — Tidak boleh duplikat nama_kelas
 */
const create = async (data) => {
    const { nama_kelas, fase } = data;

    // Cek duplikasi nama_kelas
    const [existing] = await db.execute(
        'SELECT id_kelas FROM kelas WHERE nama_kelas = ?',
        [nama_kelas]
    );
    if (existing.length > 0) {
        throw new Error(`Kelas dengan nama "${nama_kelas}" sudah ada`);
    }

    const [result] = await db.execute(
        'INSERT INTO kelas (nama_kelas, fase, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [nama_kelas, fase]
    );
    return result.insertId;
};

/**
 * Memperbarui data kelas (template)
 */
const update = async (id, data) => {
    const { nama_kelas, fase } = data;

    // Cek duplikasi (kecuali untuk kelas ini sendiri)
    const [existing] = await db.execute(
        'SELECT id_kelas FROM kelas WHERE nama_kelas = ? AND id_kelas != ?',
        [nama_kelas, id]
    );
    if (existing.length > 0) {
        throw new Error(`Kelas dengan nama "${nama_kelas}" sudah digunakan`);
    }

    const [result] = await db.execute(
        'UPDATE kelas SET nama_kelas = ?, fase = ?, updated_at = NOW() WHERE id_kelas = ?',
        [nama_kelas, fase, id]
    );
    return result.affectedRows > 0;
};


module.exports = {
    getAll,
    getById,
    create,
    update
};