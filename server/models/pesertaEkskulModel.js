const db = require('../config/db');

/**
 * Hitung jumlah ekskul yang diikuti siswa di tahun ajaran tertentu
 */
const getJumlahEkskulSiswa = async (siswa_id, tahun_ajaran_id) => {
    const [rows] = await db.execute(
        'SELECT COUNT(*) AS total FROM peserta_ekstrakurikuler WHERE siswa_id = ? AND tahun_ajaran_id = ?',
        [siswa_id, tahun_ajaran_id]
    );
    return rows[0].total;
};

/**
 * Tambah anggota ke ekstrakurikuler
 */
const addPeserta = async (siswa_id, ekskul_id, tahun_ajaran_id, deskripsi = null) => {
    // Cek apakah sudah terdaftar
    const [exists] = await db.execute(
        'SELECT id_peserta_ekskul FROM peserta_ekstrakurikuler WHERE siswa_id = ? AND ekskul_id = ? AND tahun_ajaran_id = ?',
        [siswa_id, ekskul_id, tahun_ajaran_id]
    );
    if (exists.length > 0) {
        throw new Error('Siswa ini sudah terdaftar di ekstrakurikuler tersebut.');
    }

    const [result] = await db.execute(
        `INSERT INTO peserta_ekstrakurikuler 
        (siswa_id, ekskul_id, tahun_ajaran_id, deskripsi, created_at) 
        VALUES (?, ?, ?, ?, NOW())`,
        [siswa_id, ekskul_id, tahun_ajaran_id, deskripsi || null]
    );
    return result.insertId;
};

/**
 * Update deskripsi peserta
 */
const updateDeskripsi = async (id, deskripsi) => {
    const [result] = await db.execute(
        'UPDATE peserta_ekstrakurikuler SET deskripsi = ? WHERE id_peserta_ekskul = ?',
        [deskripsi || null, id]
    );
    return result.affectedRows > 0;
};

/**
 * Hapus peserta dari ekstrakurikuler
 */
const removePeserta = async (id) => {
    const [result] = await db.execute('DELETE FROM peserta_ekstrakurikuler WHERE id_peserta_ekskul = ?', [id]);
    return result.affectedRows > 0;
};

/**
 * Ambil daftar anggota suatu ekstrakurikuler
 */
const getPesertaByEkskul = async (ekskul_id, tahun_ajaran_id) => {
    const [rows] = await db.execute(`
        SELECT 
            pe.id_peserta_ekskul,
            s.id_siswa,
            s.nis,
            s.nama_lengkap,
            pe.deskripsi
        FROM peserta_ekstrakurikuler pe
        JOIN siswa s ON pe.siswa_id = s.id_siswa
        WHERE pe.ekskul_id = ? AND pe.tahun_ajaran_id = ?
        ORDER BY s.nama_lengkap ASC
    `, [ekskul_id, tahun_ajaran_id]);
    return rows;
};

/**
 * Ambil daftar ekstrakurikuler yang diikuti siswa
 */
const getEkskulBySiswa = async (siswa_id, tahun_ajaran_id) => {
    const [rows] = await db.execute(`
        SELECT 
            e.id_ekskul,
            e.nama_ekskul,
            e.nama_pembina,
            pe.deskripsi
        FROM peserta_ekstrakurikuler pe
        JOIN ekstrakurikuler e ON pe.ekskul_id = e.id_ekskul
        WHERE pe.siswa_id = ? AND pe.tahun_ajaran_id = ?
        ORDER BY e.nama_ekskul ASC
    `, [siswa_id, tahun_ajaran_id]);
    return rows;
};

module.exports = {
    getJumlahEkskulSiswa,
    addPeserta,
    updateDeskripsi,
    removePeserta,
    getPesertaByEkskul,
    getEkskulBySiswa
};