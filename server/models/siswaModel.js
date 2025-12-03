const db = require('../config/db');

// Ambil semua siswa — JOIN dengan kelas untuk dapatkan nama_kelas dan fase
const getAllSiswa = async () => {
    const [rows] = await db.execute(`
        SELECT 
            s.id_siswa AS id,
            s.nis,
            s.nisn,
            s.nama_lengkap AS nama,
            k.nama_kelas AS kelas,
            k.fase,
            s.tempat_lahir,
            s.tanggal_lahir,
            s.jenis_kelamin,
            s.alamat,
            s.status
        FROM siswa s
        LEFT JOIN kelas k ON s.kelas_id = k.id_kelas
        ORDER BY s.nama_lengkap ASC
    `);
    return rows;
};

// Ambil siswa by ID — juga JOIN kelas
const getSiswaById = async (id) => {
    const [rows] = await db.execute(`
        SELECT 
            s.id_siswa AS id,
            s.nis,
            s.nisn,
            s.nama_lengkap AS nama,
            k.nama_kelas AS kelas,
            k.fase,
            s.tempat_lahir,
            s.tanggal_lahir,
            s.jenis_kelamin,
            s.alamat,
            s.status
        FROM siswa s
        LEFT JOIN kelas k ON s.kelas_id = k.id_kelas
        WHERE s.id_siswa = ?
    `, [id]);
    return rows[0] || null;
};

// Tambah siswa baru
const createSiswa = async (siswaData, connection = null) => {
    const useConnection = connection || db;
    const {
        nis,
        nisn,
        nama_lengkap,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        alamat,
        kelas_id,
        status = 'aktif'
    } = siswaData;

    const [result] = await useConnection.execute(`
        INSERT INTO siswa (
            nis, nisn, nama_lengkap, tempat_lahir, tanggal_lahir,
            jenis_kelamin, alamat, kelas_id, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        nis,
        nisn,
        nama_lengkap,
        tempat_lahir || '',
        tanggal_lahir || null,
        jenis_kelamin || '',
        alamat || '',
        kelas_id,
        status
    ]);

    return result.insertId;
};

// Update siswa
const updateSiswa = async (id, siswaData, connection = null) => {
    const useConnection = connection || db;
    const {
        nis,
        nisn,
        nama_lengkap,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        alamat,
        kelas_id,
        status
    } = siswaData;

    const [result] = await useConnection.execute(`
        UPDATE siswa SET
            nis = ?,
            nisn = ?,
            nama_lengkap = ?,
            tempat_lahir = ?,
            tanggal_lahir = ?,
            jenis_kelamin = ?,
            alamat = ?,
            kelas_id = ?,
            status = ?
        WHERE id_siswa = ?
    `, [
        nis,
        nisn,
        nama_lengkap,
        tempat_lahir || '',
        tanggal_lahir || null,
        jenis_kelamin || '',
        alamat || '',
        kelas_id,
        status || 'aktif',
        id
    ]);

    return result.affectedRows > 0;
};

// Hapus siswa
const deleteSiswa = async (id) => {
    const [result] = await db.execute('DELETE FROM siswa WHERE id_siswa = ?', [id]);
    return result.affectedRows > 0;
};

module.exports = {
    getAllSiswa,
    getSiswaById,
    createSiswa,
    updateSiswa,
    deleteSiswa
};