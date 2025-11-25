// models/userModel.js
const db = require('../config/db');

const findByEmail = async (email) => {
    const [rows] = await db.execute('SELECT * FROM user WHERE email_sekolah = ?', [email]);
    return rows[0];
};

const findById = async (id) => {
    const [rows] = await db.execute('SELECT * FROM user WHERE id_user = ?', [id]);
    return rows[0];
};

const createUser = async (data) => {
    const { email_sekolah, password, nama_lengkap, role } = data;
    const hashedPassword = await require('../utils/hash').hashPassword(password);
    const [result] = await db.execute(
        'INSERT INTO user (email_sekolah, password, nama_lengkap, status, created_at, updated_at) VALUES (?, ?, ?, "aktif", NOW(), NOW())',
        [email_sekolah, hashedPassword, nama_lengkap]
    );
    const id_user = result.insertId;

    // Jika role diberikan, simpan ke user_role
    if (role) {
        await db.execute('INSERT INTO user_role (id_user, role) VALUES (?, ?)', [id_user, role]);
    }

    return id_user;
};

const updateUser = async (id, data) => {
    const { email_sekolah, nama_lengkap } = data;
    await db.execute(
        'UPDATE user SET email_sekolah = ?, nama_lengkap = ?, updated_at = NOW() WHERE id_user = ?',
        [email_sekolah, nama_lengkap, id]
    );
};

// ✅ FUNGSI BARU: Ambil semua role user
const getRolesByUserId = async (id_user) => {
    const [rows] = await db.execute('SELECT role FROM user_role WHERE id_user = ?', [id_user]);
    return rows.map(row => row.role);
};

module.exports = {
    findByEmail,
    findById,
    createUser,
    updateUser,
    getRolesByUserId // ← tambahkan ini
};