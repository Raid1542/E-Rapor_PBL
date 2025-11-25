const db = require('../config/db');

const getAll = async () => {
    const [rows] = await db.execute('SELECT * FROM kelas ORDER BY nama_kelas');
    return rows;
};

const getById = async (id) => {
    const [rows] = await db.execute('SELECT * FROM kelas WHERE id_kelas = ?', [id]);
    return rows[0];
};

const create = async (data) => {
    const { nama_kelas, tingkat } = data;

    const [result] = await db.execute(
        'INSERT INTO kelas (nama_kelas, tingkat) VALUES (?, ?)',
        [nama_kelas, tingkat]
    );

    return {
        id_kelas: result.insertId,
        message: 'Data kelas berhasil ditambahkan'
    };
};

const update = async (id, data) => {
    const { nama_kelas, tingkat } = data;

    await db.execute(
        'UPDATE kelas SET nama_kelas = ?, tingkat = ? WHERE id_kelas = ?',
        [nama_kelas, tingkat, id]
    );

    return { message: 'Data kelas berhasil diupdate' };
};

const remove = async (id) => {
    await db.execute('DELETE FROM kelas WHERE id_kelas = ?', [id]);
    return { message: 'Data kelas berhasil dihapus' };
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};