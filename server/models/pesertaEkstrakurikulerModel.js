const db = require('../config/db');

const getAll = async () => {
    const [rows] = await db.execute(`
    SELECT 
        pe.*,
        e.nama_ekskul,
        e.nama_pembina
    FROM peserta_ekstrakurikuler pe
    JOIN ekstrakurikuler e ON pe.ekskul_id = e.id_ekskul
    ORDER BY pe.created_at DESC
    `);
    return rows;
};

const getById = async (id) => {
    const [rows] = await db.execute(`
    SELECT 
        pe.*,
        e.nama_ekskul,
        e.nama_pembina
    FROM peserta_ekstrakurikuler pe
    JOIN ekstrakurikuler e ON pe.ekskul_id = e.id_ekskul
    WHERE pe.id_peserta_ekskul = ?
    `, [id]);
    return rows[0];
};

// Mengambil peserta berdasarkan ekstrakurikuler
const getByEkskulId = async (ekskulId) => {
    const [rows] = await db.execute(`
    SELECT 
        pe.*
    FROM peserta_ekstrakurikuler pe
    WHERE pe.ekskul_id = ?
    ORDER BY pe.created_at DESC
    `, [ekskulId]);
    return rows;
};

// Mengambil peserta berdasarkan siswa_id
const getBySiswaId = async (siswaId) => {
    const [rows] = await db.execute(`
    SELECT 
        pe.*,
        e.nama_ekskul,
        e.nama_pembina
    FROM peserta_ekstrakurikuler pe
    JOIN ekstrakurikuler e ON pe.ekskul_id = e.id_ekskul
    WHERE pe.siswa_id = ?
    ORDER BY pe.created_at DESC
    `, [siswaId]);
    return rows;
};

// Mengambil peserta berdasarkan tahun ajaran
const getByTahunAjaran = async (tahunAjaranId) => {
    const [rows] = await db.execute(`
    SELECT 
        pe.*,
        e.nama_ekskul,
        e.nama_pembina
    FROM peserta_ekstrakurikuler pe
    JOIN ekstrakurikuler e ON pe.ekskul_id = e.id_ekskul
    WHERE pe.tahun_ajaran_id = ?
    ORDER BY e.nama_ekskul, pe.created_at DESC
    `, [tahunAjaranId]);
    return rows;
};

// Cek apakah siswa sudah terdaftar di ekstrakurikuler tertentu
const checkExisting = async (siswaId, ekskulId, tahunAjaranId) => {
    const [rows] = await db.execute(`
    SELECT * FROM peserta_ekstrakurikuler 
    WHERE siswa_id = ? AND ekskul_id = ? AND tahun_ajaran_id = ?
    `, [siswaId, ekskulId, tahunAjaranId]);
    return rows.length > 0;
};

const create = async (data) => {
    const { siswa_id, ekskul_id, tahun_ajaran_id } = data;

    // Cek apakah sudah terdaftar
    const exists = await checkExisting(siswa_id, ekskul_id, tahun_ajaran_id);
    if (exists) {
        throw new Error('Siswa sudah terdaftar di ekstrakurikuler ini untuk tahun ajaran yang sama');
    }

    const [result] = await db.execute(
        'INSERT INTO peserta_ekstrakurikuler (siswa_id, ekskul_id, tahun_ajaran_id) VALUES (?, ?, ?)',
        [siswa_id, ekskul_id, tahun_ajaran_id]
    );

    return {
        id_peserta_ekskul: result.insertId,
        message: 'Peserta berhasil didaftarkan ke ekstrakurikuler'
    };
};

const update = async (id, data) => {
    const { siswa_id, ekskul_id, tahun_ajaran_id } = data;

    await db.execute(
        'UPDATE peserta_ekstrakurikuler SET siswa_id = ?, ekskul_id = ?, tahun_ajaran_id = ? WHERE id_peserta_ekskul = ?',
        [siswa_id, ekskul_id, tahun_ajaran_id, id]
    );

    return { message: 'Data peserta ekstrakurikuler berhasil diupdate' };
};

const remove = async (id) => {
    await db.execute('DELETE FROM peserta_ekstrakurikuler WHERE id_peserta_ekskul = ?', [id]);
    return { message: 'Peserta berhasil dihapus dari ekstrakurikuler' };
};

// Hapus semua peserta dari ekstrakurikuler tertentu
const removeByEkskulId = async (ekskulId) => {
    await db.execute('DELETE FROM peserta_ekstrakurikuler WHERE ekskul_id = ?', [ekskulId]);
    return { message: 'Semua peserta berhasil dihapus dari ekstrakurikuler' };
};

module.exports = {
    getAll,
    getById,
    getByEkskulId,
    getBySiswaId,
    getByTahunAjaran,
    checkExisting,
    create,
    update,
    remove,
    removeByEkskulId
};