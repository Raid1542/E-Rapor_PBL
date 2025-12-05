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
        u.id_user AS id, 
        u.email_sekolah AS email, 
        u.nama_lengkap AS nama, 
        u.status AS statusAdmin,
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
        SELECT id_user FROM user_role WHERE role = 'admin'
    )
    ORDER BY u.id_user
  `);
    return rows;
};

const createAdmin = async (userData, connection = db) => {
    const {
        email_sekolah,
        password, // bisa undefined
        nama_lengkap,
        niy = '',
        nuptk = '',
        tempat_lahir = '',
        tanggal_lahir = null,
        jenis_kelamin = 'Laki-laki',
        alamat = '',
        no_telepon = ''
    } = userData;

    // ✅ Jika tidak ada password, gunakan default
    const finalPassword = password && password.trim() !== '' 
        ? password 
        : 'sekolah123'; // atau "admin123", dll

    const hashedPassword = await require('../utils/hash').hashPassword(finalPassword);

    // 1. Insert ke user
    const [result] = await connection.execute(
        'INSERT INTO user (email_sekolah, password, nama_lengkap, status, created_at, updated_at) VALUES (?, ?, ?, "aktif", NOW(), NOW())',
        [email_sekolah, hashedPassword, nama_lengkap]
    );
    const id_user = result.insertId;

    // 2. Insert role
    await connection.execute(
        'INSERT INTO user_role (id_user, role) VALUES (?, "admin")',
        [id_user]
    );

    // 3. Insert ke guru
    await connection.execute(
        `INSERT INTO guru (
            user_id, niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id_user, niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon]
    );

    return id_user;
};

const updateAdmin = async (id, data, connection = db) => {
    // ✅ Beri nilai default untuk semua field
    const {
        email_sekolah = '',
        nama_lengkap = '',
        password = undefined, // biarkan undefined untuk dicek
        status = '',
        niy = '',
        nuptk = '',
        tempat_lahir = '',
        tanggal_lahir = null,       // DATE boleh null
        jenis_kelamin = 'Laki-laki',
        alamat = '',
        no_telepon = ''
    } = data;

    // 1. Update user
    let updateUserQuery = 'UPDATE user SET email_sekolah = ?, nama_lengkap = ?, status = ?';
    let updateUserParams = [email_sekolah, nama_lengkap, status];

    if (password && password.trim() !== '') {
        const hashedPassword = await require('../utils/hash').hashPassword(password);
        updateUserQuery += ', password = ?';
        updateUserParams.push(hashedPassword);
    }

    updateUserQuery += ', updated_at = NOW() WHERE id_user = ?';
    updateUserParams.push(id);
    await connection.execute(updateUserQuery, updateUserParams);

    // 2. Update guru — pastikan TIDAK ADA undefined
    const [guruRows] = await connection.execute('SELECT 1 FROM guru WHERE user_id = ?', [id]);
    if (guruRows.length > 0) {
        await connection.execute(
            `UPDATE guru SET 
        niy = ?, nuptk = ?, tempat_lahir = ?, tanggal_lahir = ?,
        jenis_kelamin = ?, alamat = ?, no_telepon = ?
        WHERE user_id = ?`,
            [niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon, id]
        );
    } else {
        await connection.execute(
            `INSERT INTO guru (user_id, niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon]
        );
    }
};

    const deleteUserById = async (id) => {
        await db.execute('DELETE FROM user_role WHERE id_user = ?', [id]);
        await db.execute('DELETE FROM guru WHERE user_id = ?', [id]);
        await db.execute('DELETE FROM user WHERE id_user = ?', [id]);
    };

    module.exports = {
        findByEmail,
        findById,
        createUser,
        updateUser,
        getRolesByUserId,
        getAdminList,
        createAdmin,
        updateAdmin,
        deleteUserById
    };