const db = require('../config/db');

const getAll = async () => {
    const [rows] = await db.execute('SELECT * FROM mata_pelajaran ORDER BY nama_mapel');
    return rows;
};

const getById = async (id) => {
    const [rows] = await db.execute('SELECT * FROM mata_pelajaran WHERE id_mata_pelajaran = ?', [id]);
    return rows[0];
};

const getByJenis = async (jenis) => {
    const [rows] = await db.execute(
        'SELECT * FROM mata_pelajaran WHERE jenis = ? ORDER BY nama_mapel',
        [jenis]
    );
    return rows;
};

const create = async (data) => {
    const { nama_mapel, jenis, kurikulum } = data;

    const [result] = await db.execute(
        'INSERT INTO mata_pelajaran (nama_mapel, jenis, kurikulum) VALUES (?, ?, ?)',
        [nama_mapel, jenis, kurikulum]
    );

    return {
        id_mata_pelajaran: result.insertId,
        message: 'Data mata pelajaran berhasil ditambahkan'
    };
};

const update = async (id, data) => {
    const { nama_mapel, jenis, kurikulum } = data;

    await db.execute(
        'UPDATE mata_pelajaran SET nama_mapel = ?, jenis = ?, kurikulum = ? WHERE id_mata_pelajaran = ?',
        [nama_mapel, jenis, kurikulum, id]
    );

    return { message: 'Data mata pelajaran berhasil diupdate' };
};

const remove = async (id) => {
    await db.execute('DELETE FROM mata_pelajaran WHERE id_mata_pelajaran = ?', [id]);
    return { message: 'Data mata pelajaran berhasil dihapus' };
};

module.exports = {
    getAll,
    getById,
    getByJenis,
    create,
    update,
    remove
};