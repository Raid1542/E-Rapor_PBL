const db = require('../config/db');
const { hashPassword } = require('../utils/hash');

/**
 * Ambil SEMUA guru (data master global)
 */
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
        g.foto_path,
        CASE WHEN u.status = 'aktif' THEN 'AKTIF' ELSE 'NONAKTIF' END AS statusGuru,
        GROUP_CONCAT(ur.role) AS roles
    FROM user u
    INNER JOIN guru g ON u.id_user = g.user_id
    INNER JOIN user_role ur ON u.id_user = ur.id_user
    -- ✅ FILTER HANYA USER DENGAN ROLE GURU
    WHERE ur.role IN ('guru kelas', 'guru bidang studi')
    GROUP BY u.id_user
    ORDER BY u.nama_lengkap ASC
    `);

    return rows.map(row => ({
        ...row,
        roles: row.roles ? row.roles.split(',') : [],
        profileImage: row.foto_path || null
    }));
};

/**
 * Ambil detail guru berdasarkan ID
 */
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
        g.no_telepon,
        g.foto_path,
        GROUP_CONCAT(ur.role) AS roles
    FROM user u
    INNER JOIN guru g ON u.id_user = g.user_id
    LEFT JOIN user_role ur ON u.id_user = ur.id_user
    WHERE u.id_user = ?
    GROUP BY u.id_user
    `, [id]);

    const row = rows[0];
    if (!row) return null;

    return {
        ...row,
        roles: row.roles ? row.roles.split(',') : [],
        profileImage: row.foto_path || null
    };
};

/**
 * Buat guru baru (user + guru + role)
 */
const createGuru = async (userData, guruData, roles) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Hash password (default jika tidak ada)
        const passwordToHash = userData.password?.trim() || 'sekolah123';
        const hashedPassword = await hashPassword(passwordToHash);

        // 2. Insert ke tabel user
        const [userResult] = await connection.execute(
            `INSERT INTO user (email_sekolah, password, nama_lengkap, status) 
        VALUES (?, ?, ?, 'aktif')`,
            [userData.email_sekolah, hashedPassword, userData.nama_lengkap]
        );
        const userId = userResult.insertId;

        // 3. Insert ke tabel guru
        await connection.execute(
            `INSERT INTO guru (user_id, niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                guruData.niy || null,
                guruData.nuptk || null,
                guruData.tempat_lahir || null,
                guruData.tanggal_lahir || null,
                guruData.jenis_kelamin || null,
                guruData.alamat || null,
                guruData.no_telepon || null
            ]
        );

        // 4. Simpan role (minimal satu role)
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

/**
 * Update data guru (user + guru + role)
 */
const updateGuru = async (id, userData, guruData, roles = null) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // --- 1. Update data user ---
        let updateUserQuery = 'UPDATE user SET email_sekolah = ?, nama_lengkap = ?';
        let updateUserParams = [userData.email_sekolah, userData.nama_lengkap];

        if (userData.status !== undefined) {
            updateUserQuery += ', status = ?';
            updateUserParams.push(userData.status);
        }

        if (userData.password?.trim()) {
            const hashedPassword = await hashPassword(userData.password.trim());
            updateUserQuery += ', password = ?';
            updateUserParams.push(hashedPassword);
        }

        updateUserQuery += ' WHERE id_user = ?';
        updateUserParams.push(id);
        await connection.execute(updateUserQuery, updateUserParams);

        // --- 2. Update atau insert data guru ---
        const [guruExists] = await connection.execute(
            'SELECT 1 FROM guru WHERE user_id = ?',
            [id]
        );

        if (guruExists.length > 0) {
            // Update existing
            await connection.execute(
                `UPDATE guru SET 
            niy = ?, nuptk = ?, tempat_lahir = ?, tanggal_lahir = ?,
            jenis_kelamin = ?, alamat = ?, no_telepon = ?
        WHERE user_id = ?`,
                [
                    guruData.niy || null,
                    guruData.nuptk || null,
                    guruData.tempat_lahir || null,
                    guruData.tanggal_lahir || null,
                    guruData.jenis_kelamin || null,
                    guruData.alamat || null,
                    guruData.no_telepon || null,
                    id // ✅ benar: id = user_id
                ]
            );
        } else {
            // Insert baru (jika belum ada)
            await connection.execute(
                `INSERT INTO guru (user_id, niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id, // ✅ benar
                    guruData.niy || null,
                    guruData.nuptk || null,
                    guruData.tempat_lahir || null,
                    guruData.tanggal_lahir || null,
                    guruData.jenis_kelamin || null,
                    guruData.alamat || null,
                    guruData.no_telepon || null
                ]
            );
        }

        // --- 3. Update roles (jika dikirim) ---
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
        console.error('ModelError updateGuru:', err);
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

const updateFoto = async (userId, fotoPath) => {
    const [result] = await db.execute(
        'UPDATE guru SET foto_path = ? WHERE user_id = ?',
        [fotoPath, userId]
    );
    return result.affectedRows > 0; // true jika ada baris yang diupdate
};

module.exports = {
    getAllGuru,
    getGuruById,
    createGuru,
    updateGuru,
    updateFoto
};