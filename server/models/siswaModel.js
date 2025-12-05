const db = require('../config/db');

// ─── AMBIL SEMUA DATA SISWA BERDASARKAN TAHUN AJARAN ────────────────────────
const getSiswaByTahunAjaran = async (tahunAjaranId) => {
    const [rows] = await db.execute(`
    SELECT 
        s.id_siswa AS id,
        s.nama_lengkap AS nama,
        s.nis,
        s.nisn,
        s.tempat_lahir,
        s.tanggal_lahir,
        s.jenis_kelamin,
        s.alamat,
        k.nama_kelas AS kelas,
        k.fase,
        s.status
    FROM siswa s
    INNER JOIN siswa_kelas sk ON s.id_siswa = sk.siswa_id
    INNER JOIN kelas k ON sk.kelas_id = k.id_kelas
    WHERE sk.tahun_ajaran_id = ?
    ORDER BY s.nama_lengkap ASC
    `, [tahunAjaranId]);

    return rows;
};

// ─── AMBIL SISWA BERDASARKAN ID ─────────────────────────────────────────────
const getSiswaById = async (id) => {
    const [rows] = await db.execute(`
    SELECT 
        s.id_siswa AS id,
        s.nama_lengkap AS nama,
        s.nis,
        s.nisn,
        s.tempat_lahir,
        s.tanggal_lahir,
        s.jenis_kelamin,
        s.alamat,
        k.nama_kelas AS kelas,
        k.fase,
        s.status
    FROM siswa s
    LEFT JOIN kelas k ON s.kelas_id = k.id_kelas
    WHERE s.id_siswa = ?
    `, [id]);

    return rows[0] || null;
};

// ─── TAMBAH SISWA BARU (DAN MASUKKAN KE siswa_kelas) ────────────────────────
const createSiswa = async (siswaData, tahunAjaranId, connection = null) => {
    const useConn = connection || db;
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

    // Simpan ke tabel `siswa`
    const [result] = await useConn.execute(`
    INSERT INTO siswa (
        nis, nisn, nama_lengkap, tempat_lahir, tanggal_lahir,
        jenis_kelamin, alamat, kelas_id, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        nis,
        nisn,
        nama_lengkap,
        tempat_lahir || null,
        tanggal_lahir || null,
        jenis_kelamin,
        alamat || null,
        kelas_id, // ✅ HARUS INTEGER
        status
    ]);

    const siswaId = result.insertId;

    // Simpan ke tabel `siswa_kelas`
    await useConn.execute(`
    INSERT INTO siswa_kelas (siswa_id, kelas_id, tahun_ajaran_id)
    VALUES (?, ?, ?)
    `, [siswaId, kelas_id, tahunAjaranId]);

    return siswaId;
};

// ─── UPDATE DATA SISWA ──────────────────────────────────────────────────────
const updateSiswa = async (id, siswaData, connection = null) => {
    const useConn = connection || db;
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

    const [result] = await useConn.execute(`
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
        tempat_lahir || null,
        tanggal_lahir || null,
        jenis_kelamin,
        alamat || null,
        kelas_id,
        status || 'aktif',
        id
    ]);

    return result.affectedRows > 0;
};

// ─── HAPUS SISWA ────────────────────────────────────────────────────────────
const deleteSiswa = async (id) => {
    const [result] = await db.execute('DELETE FROM siswa WHERE id_siswa = ?', [id]);
    return result.affectedRows > 0;
};

module.exports = {
    getSiswaByTahunAjaran,
    getSiswaById,
    createSiswa,
    updateSiswa,
    deleteSiswa
};