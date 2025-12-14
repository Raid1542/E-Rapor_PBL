const db = require('../config/db');
const bcrypt = require('bcrypt');
const guruModel = require('../models/guruModel');

//  Role
const ensureGuruBidangStudi = (req, res) => {
    if (req.user.role !== 'guru bidang studi') {
        return res.status(403).json({ message: 'Akses ditolak: hanya untuk guru bidang studi' });
    }
    return null;
};

exports.editProfil = async (req, res) => {
    const roleError = ensureGuruBidangStudi(req, res);
    if (roleError) return;

    try {
        const userId = req.user.id;
        const {
            nama_lengkap,
            email_sekolah,
            niy,
            nuptk,
            jenis_kelamin,
            no_telepon,
            alamat
        } = req.body;

        if (!nama_lengkap || !email_sekolah) {
            return res.status(400).json({ message: 'Nama dan email wajib diisi' });
        }

        await db.execute(
            `UPDATE user SET nama_lengkap = ?, email_sekolah = ? WHERE id_user = ?`,
            [nama_lengkap, email_sekolah, userId]
        );

        await db.execute(
            `UPDATE guru SET niy = ?, nuptk = ?, jenis_kelamin = ?, no_telepon = ?, alamat = ? WHERE user_id = ?`,
            [niy, nuptk, jenis_kelamin, no_telepon, alamat, userId]
        );

        const [userRows] = await db.execute(
            `SELECT id_user, nama_lengkap, email_sekolah FROM user WHERE id_user = ?`,
            [userId]
        );
        const [guruRows] = await db.execute(
            `SELECT niy, nuptk, jenis_kelamin, no_telepon, alamat FROM guru WHERE user_id = ?`,
            [userId]
        );

        if (userRows.length === 0 || guruRows.length === 0) {
            return res.status(404).json({ message: 'Profil tidak ditemukan' });
        }

        const updatedData = { ...userRows[0], ...guruRows[0] };

        res.json({
            message: 'Profil berhasil diperbarui',
            data: updatedData
        });

    } catch (err) {
        console.error('Error edit profil guru:', err);
        res.status(500).json({ message: 'Gagal memperbarui profil' });
    }
};

exports.gantiPassword = async (req, res) => {
    const roleError = ensureGuruBidangStudi(req, res);
    if (roleError) return;

    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Kata sandi lama dan baru wajib diisi' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Kata sandi baru minimal 8 karakter' });
        }

        const [rows] = await db.execute(
            'SELECT password FROM user WHERE id_user = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Kata sandi lama salah' });
        }

        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        await db.execute(
            'UPDATE user SET password = ? WHERE id_user = ?',
            [newHashedPassword, userId]
        );

        res.json({ message: 'Kata sandi berhasil diubah' });

    } catch (err) {
        console.error('Error ganti password guru:', err);
        res.status(500).json({ message: 'Gagal mengubah kata sandi' });
    }
};

//  Perbaiki query sesuai diagram database
exports.getKelasYangDiajar = async (req, res) => {
    const roleError = ensureGuruBidangStudi(req, res);
    if (roleError) return;

    const userId = req.user.id;

    try {
        const query = `
        SELECT 
        p.id AS pembelajaran_id,
        p.kelas_id,
        k.nama_kelas,
        k.fase,
        mp.nama_mapel,
        mp.jenis,
        mp.kurikulum,
        p.tahun_ajaran_id
        FROM pembelajaran p
        JOIN kelas k ON p.kelas_id = k.id_kelas
        JOIN mata_pelajaran mp ON p.mata_pelajaran_id = mp.id_mata_pelajaran
        WHERE p.user_id = ?
    `;

        const [rows] = await db.execute(query, [userId]);

        const kelasList = rows.map(row => ({
            pembelajaran_id: row.pembelajaran_id,
            kelas_id: row.kelas_id,
            nama_kelas: row.nama_kelas,
            fase: row.fase,
            nama_mapel: row.nama_mapel,
            jenis: row.jenis,
            kurikulum: row.kurikulum,
            tahun_ajaran_id: row.tahun_ajaran_id
        }));

        // Ambil subject dari data pertama
        const subject = kelasList.length > 0 ? kelasList[0].nama_mapel : '';

        res.json({
            message: 'Kelas yang diajar berhasil diambil',
            subject,
            data: kelasList
        });

    } catch (err) {
        console.error('Error get kelas yang diajar:', err);
        res.status(500).json({ message: 'Gagal mengambil data kelas yang diajar' });
    }
};

exports.uploadFotoProfil = async (req, res) => {
    // ✅ Pastikan hanya guru bidang studi yang bisa akses
    const roleError = ensureGuruBidangStudi(req, res);
    if (roleError) return;

    try {
        const userId = req.user.id; // ✅ AMBIL USER ID DARI TOKEN

        if (!req.file) {
            return res.status(400).json({ message: 'File foto diperlukan' });
        }

        // ✅ Path harus sesuai folder public
        const fotoPath = `uploads/${req.file.filename}`;

        const success = await guruModel.updateFoto(userId, fotoPath);
        if (!success) {
            return res.status(404).json({ message: 'Guru tidak ditemukan di database' });
        }

        res.json({
            success: true,
            message: 'Foto profil berhasil diupload',
            fotoPath // Contoh: "/public/uploads/profil_12345.jpg"
        });

    } catch (err) {
        console.error('Error upload foto profil guru bidang studi:', err);
        res.status(500).json({ message: 'Gagal mengupload foto profil' });
    }
};