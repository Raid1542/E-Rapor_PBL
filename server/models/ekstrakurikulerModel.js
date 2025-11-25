const db = require('../config/db');

const getAll = async () => {
    const [rows] = await db.execute('SELECT * FROM ekstrakurikuler ORDER BY nama_ekskul');
    return rows;
};

const getById = async (id) => {
    const [rows] = await db.execute('SELECT * FROM ekstrakurikuler WHERE id_ekskul = ?', [id]);
    return rows[0];
};

// Mengambil ekstrakurikuler dengan jumlah pesertanya
const getAllWithParticipants = async () => {
    const [rows] = await db.execute(`
    SELECT 
        e.*,
        COUNT(pe.id_peserta_ekskul) as jumlah_peserta
    FROM ekstrakurikuler e
    LEFT JOIN peserta_ekstrakurikuler pe ON e.id_ekskul = pe.ekskul_id
    GROUP BY e.id_ekskul
    ORDER BY e.nama_ekskul
    `);
    return rows;
};

const create = async (data) => {
    const { nama_ekskul, nama_pembina, keterangan } = data;

    const [result] = await db.execute(
        'INSERT INTO ekstrakurikuler (nama_ekskul, nama_pembina, keterangan) VALUES (?, ?, ?)',
        [nama_ekskul, nama_pembina, keterangan]
    );

    return {
        id_ekskul: result.insertId,
        message: 'Data ekstrakurikuler berhasil ditambahkan'
    };
};

const update = async (id, data) => {
    const { nama_ekskul, nama_pembina, keterangan } = data;

    await db.execute(
        'UPDATE ekstrakurikuler SET nama_ekskul = ?, nama_pembina = ?, keterangan = ? WHERE id_ekskul = ?',
        [nama_ekskul, nama_pembina, keterangan, id]
    );

    return { message: 'Data ekstrakurikuler berhasil diupdate' };
};

const remove = async (id) => {
    // Hapus peserta terlebih dahulu (cascade)
    await db.execute('DELETE FROM peserta_ekstrakurikuler WHERE ekskul_id = ?', [id]);
    // Hapus ekstrakurikuler
    await db.execute('DELETE FROM ekstrakurikuler WHERE id_ekskul = ?', [id]);

    return { message: 'Data ekstrakurikuler berhasil dihapus' };
};

module.exports = {
    getAll,
    getById,
    getAllWithParticipants,
    create,
    update,
    remove
};