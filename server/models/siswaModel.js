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
const getSiswaById = async (id, tahunAjaranId = null) => {
    let query = `
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
            s.status,
            sk.kelas_id,
            sk.tahun_ajaran_id
        FROM siswa s
        INNER JOIN siswa_kelas sk ON s.id_siswa = sk.siswa_id
        INNER JOIN kelas k ON sk.kelas_id = k.id_kelas
    `;
    const params = [id];

    if (tahunAjaranId) {
        query += ` WHERE s.id_siswa = ? AND sk.tahun_ajaran_id = ?`;
        params.push(tahunAjaranId);
    } else {
        query += ` WHERE s.id_siswa = ?`;
    }

    const [rows] = await db.execute(query, params);
    return rows[0] || null;
};

// ─── TAMBAH SISWA BARU (HANYA KE TABEL `siswa`, TANPA `kelas_id`) ───────────
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
        status = 'aktif'
        // ⚠️ kelas_id TIDAK dikirim ke tabel `siswa`
    } = siswaData;

    // ✅ HAPUS kelas_id dari sini!
    const [result] = await useConn.execute(`
        INSERT INTO siswa (
            nis, nisn, nama_lengkap, tempat_lahir, tanggal_lahir,
            jenis_kelamin, alamat, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        nis,
        nisn,
        nama_lengkap,
        tempat_lahir || null,
        tanggal_lahir || null,
        jenis_kelamin,
        alamat || null,
        status
    ]);

    const siswaId = result.insertId;

    // ✅ Tapi tetap simpan ke `siswa_kelas`
    await useConn.execute(`
        INSERT INTO siswa_kelas (siswa_id, kelas_id, tahun_ajaran_id)
        VALUES (?, ?, ?)
    `, [siswaId, siswaData.kelas_id, tahunAjaranId]);

    return siswaId;
};

// ─── UPDATE DATA SISWA (TANPA `kelas_id`) ───────────────────────────────────
const updateSiswa = async (id, siswaData, tahunAjaranId, connection = null) => {
    const useConn = connection || db;
    const {
        nis,
        nisn,
        nama_lengkap,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        alamat,
        status = 'aktif'
        // ⚠️ kelas_id TIDAK di-update di tabel `siswa`
    } = siswaData;

    // ✅ UPDATE TANPA kelas_id
    await useConn.execute(`
        UPDATE siswa SET
            nis = ?,
            nisn = ?,
            nama_lengkap = ?,
            tempat_lahir = ?,
            tanggal_lahir = ?,
            jenis_kelamin = ?,
            alamat = ?,
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
        status,
        id
    ]);

    // ✅ Update hanya di `siswa_kelas`
    const [existing] = await useConn.execute(
        `SELECT 1 FROM siswa_kelas WHERE siswa_id = ? AND tahun_ajaran_id = ?`,
        [id, tahunAjaranId]
    );

    if (existing.length > 0) {
        await useConn.execute(
            `UPDATE siswa_kelas SET kelas_id = ? WHERE siswa_id = ? AND tahun_ajaran_id = ?`,
            [siswaData.kelas_id, id, tahunAjaranId]
        );
    } else {
        await useConn.execute(
            `INSERT INTO siswa_kelas (siswa_id, kelas_id, tahun_ajaran_id) VALUES (?, ?, ?)`,
            [id, siswaData.kelas_id, tahunAjaranId]
        );
    }

    return true;
};

// ─── HAPUS SISWA ────────────────────────────────────────────────────────────
const deleteSiswa = async (id) => {
    await db.execute('DELETE FROM siswa_kelas WHERE siswa_id = ?', [id]);
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