// controllers/authController.js
const jwt = require('jsonwebtoken');
const { comparePassword } = require('../utils/hash');
const db = require('../config/db');
const userModel = require('../models/userModel');

const login = async (req, res) => {
    const { email_sekolah, password, role: selectedRole } = req.body;

    if (!email_sekolah || !password || !selectedRole) {
        return res.status(400).json({ message: 'Email, password, dan role wajib diisi' });
    }

    try {
        // Cari user (tanpa ambil kolom `role` dari tabel `user`)
        const [rows] = await db.execute(
            'SELECT id_user, email_sekolah, password, nama_lengkap, status FROM user WHERE email_sekolah = ?',
            [email_sekolah]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const user = rows[0];
        if (user.status !== 'aktif') {
            return res.status(403).json({ message: 'Akun tidak aktif' });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        // ✅ Ambil SEMUA role dari tabel user_role
        const roles = await userModel.getRolesByUserId(user.id_user);

        // Jika tidak ada role (misal user lama), fallback ke kolom role (opsional)
        if (roles.length === 0) {
            // Opsional: ambil dari kolom `role` di `user` jika masih ada
            const [userWithRole] = await db.execute('SELECT role FROM user WHERE id_user = ?', [user.id_user]);
            if (userWithRole[0]?.role) {
                roles.push(userWithRole[0].role);
            }
        }

        // ✅ Validasi: apakah user punya role yang dipilih?
        if (!roles.includes(selectedRole)) {
            return res.status(403).json({
                message: `Anda tidak memiliki akses sebagai ${selectedRole}`
            });
        }

        const token = jwt.sign(
            { id: user.id_user, role: selectedRole },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Ambil data guru berdasarkan user_id
        const [guruRows] = await db.execute(
            'SELECT niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon FROM guru WHERE user_id = ?',
            [user.id_user]
        );
        const guruData = guruRows[0] || {};

        res.json({
            success: true,
            token,
            user: {
                id: user.id_user,
                role: selectedRole,
                nama_lengkap: user.nama_lengkap,
                email_sekolah: user.email_sekolah,
                roles: roles,

                // ✅ Tambahkan data guru ke response
                niy: guruData.niy || '',
                nuptk: guruData.nuptk || '',
                jenis_kelamin: guruData.jenis_kelamin || 'Laki-laki', // Default jika tidak ada
                alamat: guruData.alamat || '',
                no_telepon: guruData.no_telepon || '',
                tempat_lahir: guruData.tempat_lahir || '',
                tanggal_lahir: guruData.tanggal_lahir || null
            }
        });

    } catch (err) {
        console.error('Error login:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

module.exports = { login };