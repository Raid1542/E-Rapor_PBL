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

const updateUser = async (id, data, connection) => {
    const { email_sekolah, nama_lengkap, status } = data;
    await db.execute(
        'UPDATE user SET email_sekolah = ?, nama_lengkap = ?, status = ?, updated_at = NOW() WHERE id_user = ?',
        [email_sekolah, nama_lengkap, status, id]
    );
};

const getRolesByUserId = async (id_user) => {
    const [rows] = await db.execute('SELECT role FROM user_role WHERE id_user = ?', [id_user]);
    return rows.map(row => row.role);
};

const getAdminList = async () => {
    const [rows] = await db.execute(`
    SELECT 
        u.id_user, 
        u.email_sekolah, 
        u.nama_lengkap, 
        u.status,
        g.niy, 
        g.nuptk, 
        g.tempat_lahir, 
        g.tanggal_lahir, 
        g.jenis_kelamin, 
        g.alamat, 
        g.no_telepon
    FROM user u
    LEFT JOIN guru g ON u.id_user = g.user_id
    WHERE u.id_user IN (
        SELECT id_user FROM user_role WHERE role = 'Admin'
    )
    ORDER BY u.id_user
    `);
    return rows;
};

const createAdmin = async (userData, connection = db) => {
    const { email_sekolah, password, nama_lengkap } = userData;
    const hashedPassword = await require('../utils/hash').hashPassword(password);

    const [result] = await connection.execute(
        'INSERT INTO user (email_sekolah, password, nama_lengkap, status, created_at, updated_at) VALUES (?, ?, ?, "aktif", NOW(), NOW())',
        [email_sekolah, hashedPassword, nama_lengkap]
    );

    const id_user = result.insertId;

    // Simpan role Admin
    await connection.execute(
        'INSERT INTO user_role (id_user, role) VALUES (?, "Admin")',
        [id_user]
    );

    return id_user;
};

module.exports = {
    findByEmail,
    findById,
    createUser,
    updateUser,
    getRolesByUserId,
    getAdminList,
    createAdmin
};