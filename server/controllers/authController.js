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
        // ✅ Cari user berdasarkan email
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

        // ✅ Cek status akun
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

        // ✅ Ambil semua role dari tabel user_role
        const roles = await userModel.getRolesByUserId(user.id_user);

        // ✅ Validasi: apakah role yang dipilih tersedia?
        if (!roles.includes(selectedRole)) {
            return res.status(403).json({
                success: false,
                message: `Anda tidak memiliki akses sebagai ${selectedRole}`
            });
        }

        // ✅ Generate JWT dengan role yang dipilih
        const token = jwt.sign(
            { id: user.id_user, role: selectedRole },
            process.env.JWT_SECRET,
            { expiresIn: '5h' }
        );

        // ✅ Ambil data tambahan guru (jika ada)
        const [guruRows] = await db.execute(
            `SELECT niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon 
             FROM guru 
             WHERE user_id = ?`,
            [user.id_user]
        );
        const guruData = guruRows[0] || {};

        // ✅ Response sukses — HANYA data dasar, TIDAK ADA kelas_yang_diajar!
        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id_user,
                role: selectedRole,
                roles: roles,
                nama_lengkap: user.nama_lengkap,
                email_sekolah: user.email_sekolah,

                // Data guru
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