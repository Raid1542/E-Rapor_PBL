const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { connectDB, getConnection } = require('./config/db');
const jwt = require('jsonwebtoken');

dotenv.config(); // ← pastikan ini di awal!

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

// Endpoint login — TANPA meminta role dari frontend
app.post('/api/login', async (req, res) => {
    const { email_sekolah, password } = req.body;

    // Validasi input
    if (!email_sekolah || !password) {
        return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const conn = getConnection(); // pastikan getConnection() mengembalikan koneksi langsung (bukan promise)

    try {
        // Cari user hanya berdasarkan email_sekolah
        const [rows] = await conn.execute(
            'SELECT id_user, email_sekolah, password, role, status FROM user WHERE email_sekolah = ?',
            [email_sekolah]
        );

        // Cek apakah user ditemukan
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Email salah' });
        }

        const user = rows[0];

        // Cek status aktif/nonaktif (opsional tapi sangat disarankan)
        if (user.status !== 'aktif') {
            return res.status(403).json({ message: 'Akun ini tidak aktif' });
        }

        // Verifikasi password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'password salah' });
        }

        // Buat token JWT
        const token = jwt.sign(
            {
                id: user.id_user,
                email: user.email_sekolah,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Respons sukses
        return res.json({
            success: true,
            token,
            user: {
                id: user.id_user,
                email: user.email_sekolah,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Error saat login:', err);
        return res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

// Route uji coba
app.get('/', (req, res) => {
    res.send('Backend E-Rapor SDIT Ulil Albab berjalan!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server berjalan di port ${PORT}`);
});