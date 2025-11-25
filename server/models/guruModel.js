const db = require('../config/db');

// Ambil semua data guru (JOIN user + guru)
const getAllGuru = async () => {
    const [rows] = await db.execute(`
    SELECT 
        u.id_user AS id,
        u.nama_lengkap AS nama,
        u.email_sekolah AS email,
        g.niy,
        g.nuptk,
        g.jenis_kelamin,
        g.alamat,
        g.no_telepon AS telepon,
        u.status AS statusGuru,
        CASE 
        WHEN g.jenis_kelamin = 'LAKI-LAKI' THEN 'L'
        ELSE 'P'
        END AS lp
    FROM user u
    LEFT JOIN guru g ON u.id_user = g.user_id
    WHERE u.role = 'Guru Kelas' OR u.role = 'Guru Bidang Studi'
    `);
    return rows;
};

// Tambah data guru → simpan ke user + guru
const createGuru = async (userData, guruData) => {
    // 1. Simpan ke tabel user
    const [userResult] = await db.execute(
        'INSERT INTO user (email_sekolah, password, nama_lengkap, role, status) VALUES (?, ?, ?, ?, "aktif")',
        [userData.email_sekolah, userData.password, userData.nama_lengkap, userData.role]
    );
    const userId = userResult.insertId;

    // 2. Simpan ke tabel guru
    await db.execute(
        'INSERT INTO guru (user_id, niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, guruData.niy, guruData.nuptk, guruData.tempat_lahir, guruData.tanggal_lahir, guruData.jenis_kelamin, guruData.alamat, guruData.no_telepon]
    );

    return userId;
};

module.exports = { getAllGuru, createGuru };