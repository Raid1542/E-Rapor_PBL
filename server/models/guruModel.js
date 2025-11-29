// models/guruModel.js
const db = require('../config/db');
const { hashPassword } = require('../utils/hash');

// Ambil semua guru (JOIN user + guru + user_role)
const getAllGuru = async () => {
    const [rows] = await db.execute(`
    SELECT 
        u.id_user AS id,
        u.nama_lengkap AS nama,
        u.email_sekolah AS email,
        u.status,
        g.niy,
        g.nuptk,
        g.tempat_lahir,
        g.tanggal_lahir,
        g.jenis_kelamin,
        g.alamat,
        g.no_telepon,
        CASE 
        WHEN g.jenis_kelamin = 'Perempuan' THEN 'P' 
        ELSE 'L' 
        END AS lp,
        CASE 
        WHEN u.status = 'aktif' THEN 'AKTIF' 
        ELSE 'NONAKTIF' 
        END AS statusGuru
    FROM user u
    INNER JOIN guru g ON u.id_user = g.user_id
    INNER JOIN user_role ur ON u.id_user = ur.id_user
    WHERE ur.role IN ('guru kelas', 'guru bidang studi')
    GROUP BY u.id_user
    ORDER BY u.nama_lengkap
    `);
    return rows;
};

// Ambil guru by ID
const getGuruById = async (id) => {
    const [rows] = await db.execute(`
    SELECT 
        u.id_user,
        u.nama_lengkap,
        u.email_sekolah,
        u.status,
        g.niy,
        g.nuptk,
        g.tempat_lahir,
        g.tanggal_lahir,
        g.jenis_kelamin,
        g.alamat,
        g.no_telepon
    FROM user u
    INNER JOIN guru g ON u.id_user = g.user_id
    WHERE u.id_user = ?
    `, [id]);
    return rows[0];
};

// Buat guru baru (dengan multi-role)
const createGuru = async (userData, guruData, roles) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Hash password
        const hashedPassword = await hashPassword(userData.password);

        // 2. Insert ke user
        const [userResult] = await connection.execute(
            `INSERT INTO user (email_sekolah, password, nama_lengkap, status) 
        VALUES (?, ?, ?, 'aktif')`,
            [userData.email_sekolah, hashedPassword, userData.nama_lengkap]
        );
        const userId = userResult.insertId;

        // 3. Insert ke guru
        await connection.execute(
            `INSERT INTO guru (user_id, niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                guruData.niy || '',
                guruData.nuptk || '',
                guruData.tempat_lahir || '',
                guruData.tanggal_lahir || '',
                guruData.jenis_kelamin || 'Laki-laki',
                guruData.alamat || '',
                guruData.no_telepon || ''
            ]
        );

        // 4. Insert roles ke user_role
        for (const role of roles) {
            await connection.execute(
                `INSERT INTO user_role (id_user, role) VALUES (?, ?)`,
                [userId, role]
            );
        }

        await connection.commit();
        return userId;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

// Update guru
const updateGuru = async (id, userData, guruData, roles = null) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Update user (termasuk password jika ada)
        let updateUserQuery = 'UPDATE user SET email_sekolah = ?, nama_lengkap = ?';
        let updateUserParams = [userData.email_sekolah, userData.nama_lengkap];

        if (userData.password && userData.password.trim() !== '') {
            const hashedPassword = await require('../utils/hash').hashPassword(userData.password);
            updateUserQuery += ', password = ?';
            updateUserParams.push(hashedPassword);
        }

        updateUserQuery += ' WHERE id_user = ?';
        updateUserParams.push(id);
        await connection.execute(updateUserQuery, updateUserParams);

        // 2. Update atau insert guru
        const [guruRows] = await connection.execute('SELECT 1 FROM guru WHERE user_id = ?', [id]);
        if (guruRows.length > 0) {
            await connection.execute(
                `UPDATE guru SET 
            niy = ?, nuptk = ?, tempat_lahir = ?, tanggal_lahir = ?,
            jenis_kelamin = ?, alamat = ?, no_telepon = ?
        WHERE user_id = ?`,
                [
                    guruData.niy,
                    guruData.nuptk,
                    guruData.tempat_lahir,
                    guruData.tanggal_lahir,
                    guruData.jenis_kelamin,
                    guruData.alamat,
                    guruData.no_telepon,
                    id
                ]
            );
        } else {
            await connection.execute(
                `INSERT INTO guru (user_id, niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    guruData.niy,
                    guruData.nuptk,
                    guruData.tempat_lahir,
                    guruData.tanggal_lahir,
                    guruData.jenis_kelamin,
                    guruData.alamat,
                    guruData.no_telepon
                ]
            );
        }

        // 3. Update roles
        if (Array.isArray(roles) && roles.length > 0) {
            await connection.execute('DELETE FROM user_role WHERE id_user = ?', [id]);
            for (const role of roles) {
                if (['guru kelas', 'guru bidang studi'].includes(role)) {
                    await connection.execute(
                        'INSERT INTO user_role (id_user, role) VALUES (?, ?)',
                        [id, role]
                    );
                }
            }
        }

        await connection.commit();
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};
// Hapus guru
const deleteGuru = async (id) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.execute('DELETE FROM user_role WHERE id_user = ?', [id]);
        await connection.execute('DELETE FROM guru WHERE user_id = ?', [id]);
        await connection.execute('DELETE FROM user WHERE id_user = ?', [id]);
        await connection.commit();
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

module.exports = {
    getAllGuru,
    getGuruById,
    createGuru,
    updateGuru,
    deleteGuru
};