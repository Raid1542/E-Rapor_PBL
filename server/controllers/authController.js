const jwt = require('jsonwebtoken');
const { comparePassword } = require('../utils/hash');
const db = require('../config/db');
const userModel = require('../models/userModel');

const login = async (req, res) => {
    const { email_sekolah, password, role: selectedRole } = req.body;

    // ✅ Validasi input
    if (!email_sekolah || !password || !selectedRole) {
        return res.status(400).json({
            success: false,
            message: 'Email, password, dan role wajib diisi'
        });
    }

    try {
        // ✅ Cari user
        const [userRows] = await db.execute(
            `SELECT id_user, email_sekolah, password, nama_lengkap, status 
         FROM user 
         WHERE email_sekolah = ?`,
            [email_sekolah]
        );

        if (userRows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        const user = userRows[0];

        // ✅ Cek status
        if (user.status !== 'aktif') {
            return res.status(403).json({
                success: false,
                message: 'Akun tidak aktif'
            });
        }

        // ✅ Verifikasi password
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        // ✅ Ambil roles
        const roles = await userModel.getRolesByUserId(user.id_user);

        // ✅ Validasi role
        if (!roles.includes(selectedRole)) {
            return res.status(403).json({
                success: false,
                message: `Anda tidak memiliki akses sebagai ${selectedRole}`
            });
        }

        // ✅ Generate token
        const token = jwt.sign(
            { id: user.id_user, role: selectedRole },
            process.env.JWT_SECRET,
            { expiresIn: '5h' }
        );

        // ✅ Ambil data guru — PASTIKAN user.id_user VALID
        console.log('🔍 User ID:', user.id_user); // 👈 LOG INI

        const [guruRows] = await db.execute(
            `SELECT niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon, foto_path 
         FROM guru 
         WHERE user_id = ?`,
            [user.id_user]
        );

        console.log('📊 Guru Rows:', guruRows); // 👈 LOG INI
        const guruData = guruRows[0] || {};

        console.log('📄 Guru Data:', guruData); // 👈 LOG INI

        // ✅ Response
        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id_user,
                role: selectedRole,
                roles: roles,
                nama_lengkap: user.nama_lengkap,
                email_sekolah: user.email_sekolah,
                profileImage: guruData.foto_path || null, // 👈 INI HARUS BISA NILAI
                niy: guruData.niy || '',
                nuptk: guruData.nuptk || '',
                jenis_kelamin: guruData.jenis_kelamin || 'Laki-laki',
                alamat: guruData.alamat || '',
                no_telepon: guruData.no_telepon || '',
                tempat_lahir: guruData.tempat_lahir || '',
                tanggal_lahir: guruData.tanggal_lahir || null
            }
        });

    } catch (err) {
        console.error('Error login:', err);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
};

module.exports = { login };