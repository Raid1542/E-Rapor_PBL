const jwt = require('jsonwebtoken');
const { comparePassword } = require('../utils/hash');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const login = async (req, res) => {
    const { email_sekolah, password, role: selectedRole } = req.body; 

    if (!email_sekolah || !password || !selectedRole) {
        return res.status(400).json({ message: 'Email, password, dan role wajib diisi' });
    }

    try {
        const [rows] = await db.execute(
            'SELECT id_user, email_sekolah, password, role, nama_lengkap, status FROM user WHERE email_sekolah = ?',
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

        // ✅ VALIDASI: Apakah user benar-benar punya role yang dipilih?
        if (user.role !== selectedRole) {
            return res.status(403).json({
                message: `Tidak dapat akses sebagai ${selectedRole}`
            });
        }

        const token = jwt.sign(
            { id: user.id_user, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id_user,
                role: user.role,
                nama_lengkap: user.nama_lengkap,
                email_sekolah: user.email_sekolah
            }
        });

    } catch (err) {
        console.error('Error login:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

module.exports = { login };