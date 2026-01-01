/**
 * Nama File: userModel.js
 * Fungsi: Model untuk mengelola data pengguna (user), termasuk autentikasi,
 *         manajemen role, dan operasi CRUD untuk admin serta guru.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 1 Oktober 2025
 */

const db = require('../config/db');

const userModel = {
  // Mencari pengguna berdasarkan email sekolah
  async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM user WHERE email_sekolah = ?',
      [email]
    );
    return rows[0];
  },

  // Mengambil data pengguna lengkap berdasarkan ID (termasuk data guru)
  async findById(id) {
    const [rows] = await db.execute(
      `
        SELECT 
            u.*,
            g.niy,
            g.nuptk,
            g.tempat_lahir,
            g.tanggal_lahir,
            g.jenis_kelamin,
            g.alamat,
            g.no_telepon,
            g.foto_path  
        FROM user u
        LEFT JOIN guru g ON u.id_user = g.user_id
        WHERE u.id_user = ?
      `,
      [id]
    );
    return rows[0] || null;
  },

  // Membuat pengguna baru (tanpa role khusus)
  async createUser(data) {
    const { email_sekolah, password, nama_lengkap, role } = data;
    const hashedPassword = await require('../utils/hash').hashPassword(password);
    const [result] = await db.execute(
      'INSERT INTO user (email_sekolah, password, nama_lengkap, status, created_at, updated_at) VALUES (?, ?, ?, "aktif", NOW(), NOW())',
      [email_sekolah, hashedPassword, nama_lengkap]
    );
    const id_user = result.insertId;

    if (role) {
      await db.execute('INSERT INTO user_role (id_user, role) VALUES (?, ?)', [
        id_user,
        role,
      ]);
    }

    return id_user;
  },

  // Memperbarui data pengguna (tanpa transaksi eksternal)
  async updateUser(id, data, connection = db) {
    const { email_sekolah, nama_lengkap, status } = data;
    await connection.execute(
      'UPDATE user SET email_sekolah = ?, nama_lengkap = ?, status = ?, updated_at = NOW() WHERE id_user = ?',
      [email_sekolah, nama_lengkap, status, id]
    );
  },

  // Mengambil daftar role berdasarkan ID pengguna
  async getRolesByUserId(id_user) {
    const [rows] = await db.execute(
      'SELECT role FROM user_role WHERE id_user = ?',
      [id_user]
    );
    return rows.map(row => row.role);
  },

  // Mengambil daftar semua admin
  async getAdminList() {
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
            g.no_telepon,
            g.foto_path  
        FROM user u
        LEFT JOIN guru g ON u.id_user = g.user_id
        WHERE u.id_user IN (
            SELECT id_user FROM user_role WHERE role = 'admin'
        )
        ORDER BY u.id_user
    `);
    return rows;
  },

  // Membuat admin baru (dengan transaksi opsional)
  async createAdmin(userData, connection = db) {
    const {
      email_sekolah,
      password,
      nama_lengkap,
      niy = '',
      nuptk = '',
      tempat_lahir = '',
      tanggal_lahir = null,
      jenis_kelamin = 'Laki-laki',
      alamat = '',
      no_telepon = '',
    } = userData;

    const finalPassword = password?.trim() || 'sekolah123';
    const hashedPassword = await require('../utils/hash').hashPassword(finalPassword);

    const [result] = await connection.execute(
      'INSERT INTO user (email_sekolah, password, nama_lengkap, status, created_at, updated_at) VALUES (?, ?, ?, "aktif", NOW(), NOW())',
      [email_sekolah, hashedPassword, nama_lengkap]
    );
    const id_user = result.insertId;

    await connection.execute(
      'INSERT INTO user_role (id_user, role) VALUES (?, "admin")',
      [id_user]
    );

    await connection.execute(
      `INSERT INTO guru (
            user_id, niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_user,
        niy,
        nuptk,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        alamat,
        no_telepon,
      ]
    );

    return id_user;
  },

  // Memperbarui data admin (dengan transaksi opsional)
  async updateAdmin(id, data, connection = db) {
    const {
      email_sekolah = '',
      nama_lengkap = '',
      password,
      status = '',
      niy = '',
      nuptk = '',
      tempat_lahir = '',
      tanggal_lahir = null,
      jenis_kelamin = 'Laki-laki',
      alamat = '',
      no_telepon = '',
    } = data;

    let updateUserQuery =
      'UPDATE user SET email_sekolah = ?, nama_lengkap = ?, status = ?';
    let updateUserParams = [email_sekolah, nama_lengkap, status];

    if (password?.trim()) {
      const hashedPassword = await require('../utils/hash').hashPassword(password);
      updateUserQuery += ', password = ?';
      updateUserParams.push(hashedPassword);
    }

    updateUserQuery += ', updated_at = NOW() WHERE id_user = ?';
    updateUserParams.push(id);
    await connection.execute(updateUserQuery, updateUserParams);

    const [guruRows] = await connection.execute(
      'SELECT 1 FROM guru WHERE user_id = ?',
      [id]
    );

    if (guruRows.length > 0) {
      await connection.execute(
        `UPDATE guru SET 
          niy = ?, nuptk = ?, tempat_lahir = ?, tanggal_lahir = ?,
          jenis_kelamin = ?, alamat = ?, no_telepon = ?
          WHERE user_id = ?`,
        [
          niy,
          nuptk,
          tempat_lahir,
          tanggal_lahir,
          jenis_kelamin,
          alamat,
          no_telepon,
          id,
        ]
      );
    } else {
      await connection.execute(
        `INSERT INTO guru (user_id, niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          niy,
          nuptk,
          tempat_lahir,
          tanggal_lahir,
          jenis_kelamin,
          alamat,
          no_telepon,
        ]
      );
    }
  },

  // Memperbarui password pengguna
  async updatePassword(id_user, hashedPassword) {
    const [result] = await db.execute(
      'UPDATE user SET password = ?, updated_at = NOW() WHERE id_user = ?',
      [hashedPassword, id_user]
    );
    return result.affectedRows > 0;
  },
};

module.exports = userModel;