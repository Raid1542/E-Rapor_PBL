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
        'INSERT INTO user (email_sekolah, password, nama_lengkap, role, status) VALUES (?, ?, ?, ?, "aktif")',
        [email_sekolah, hashedPassword, nama_lengkap, role]
    );
    return result.insertId;
};

const updateUser = async (id, data) => {
    const { email_sekolah, nama_lengkap } = data;
    await db.execute(
        'UPDATE user SET email_sekolah = ?, nama_lengkap = ? WHERE id_user = ?',
        [email_sekolah, nama_lengkap, id]
    );
};

module.exports = { findByEmail, findById, createUser, updateUser };