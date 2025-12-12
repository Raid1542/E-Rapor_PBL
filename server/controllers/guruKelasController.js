const db = require('../config/db');
const bcrypt = require('bcrypt');

// Ambil data kelas yang diampu oleh guru yang sedang login
exports.getKelasSaya = async (req, res) => {
    try {
        // Ambil ID user dari token JWT (sudah diverifikasi di middleware)
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID tidak ditemukan' });
        }

        // Query: ambil nama_kelas, jumlah siswa, dan tahun ajaran aktif
        const query = `
        SELECT 
            k.nama_kelas,
            COUNT(sk.siswa_id) AS jumlah_siswa,
            ta.tahun_ajaran
        FROM user u
        INNER JOIN guru g ON u.id_user = g.user_id
        INNER JOIN guru_kelas gk ON g.user_id = gk.user_id  
        INNER JOIN kelas k ON gk.kelas_id = k.id_kelas  -- ✅ Tambahkan JOIN ke tabel kelas
        INNER JOIN tahun_ajaran ta ON gk.tahun_ajaran_id = ta.id_tahun_ajaran
        LEFT JOIN siswa_kelas sk ON k.id_kelas = sk.kelas_id 
            AND sk.tahun_ajaran_id = ta.id_tahun_ajaran
        WHERE 
            u.id_user = ? 
            AND ta.status = 'aktif'
        GROUP BY k.id_kelas, ta.id_tahun_ajaran
    `;

        const [rows] = await db.execute(query, [userId]);

        // Jika tidak ada kelas ditemukan
        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Anda belum ditugaskan sebagai guru kelas pada tahun ajaran ini.'
            });
        }

        const data = rows[0];
        res.json({
            kelas: data.nama_kelas,        // contoh: "1 A"
            jumlah_siswa: data.jumlah_siswa,
            tahun_ajaran: data.tahun_ajaran
        });

    } catch (err) {
        console.error('Error di getKelasSaya:', err);
        res.status(500).json({
            message: 'Gagal mengambil data kelas',
            error: err.message || 'Unknown error'
        });
    }
};

exports.editProfil = async (req, res) => {
    try {
        const userId = req.user.id; // Dari token JWT
        const {
            nama_lengkap,
            email_sekolah,
            niy,
            nuptk,
            jenis_kelamin,
            no_telepon,
            alamat
        } = req.body;

        // Validasi dasar
        if (!nama_lengkap || !email_sekolah) {
            return res.status(400).json({ message: 'Nama dan email wajib diisi' });
        }

        // Update tabel `user`
        await db.execute(
            `UPDATE user 
        SET nama_lengkap = ?, email_sekolah = ? 
        WHERE id_user = ?`,
            [nama_lengkap, email_sekolah, userId]
        );

        // Update tabel `guru`
        await db.execute(
            `UPDATE guru 
        SET niy = ?, nuptk = ?, jenis_kelamin = ?, no_telepon = ?, alamat = ? 
        WHERE user_id = ?`,
            [niy, nuptk, jenis_kelamin, no_telepon, alamat, userId]
        );

        // Ambil data terbaru untuk kirim ke frontend
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

        // ✅ Perbarui localStorage di frontend via respons
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
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Kata sandi lama dan baru wajib diisi' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Kata sandi baru minimal 8 karakter' });
        }

        // Ambil password lama dari database
        const [rows] = await db.execute(
            'SELECT password FROM user WHERE id_user = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        const hashedPassword = rows[0].password;

        // Bandingkan password lama
        const bcrypt = require('bcrypt');
        const isMatch = await bcrypt.compare(oldPassword, hashedPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Kata sandi lama salah' });
        }

        // Hash password baru
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        // Simpan ke database
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


exports.getSiswaByKelas = async (req, res) => {
    // ✅ Pastikan userId number
    const userId = Number(req.user.id);

    // ✅ Debug
    console.log('🔍 userId:', userId, 'tipe:', typeof userId);

    try {
        const [guruKelasRows] = await db.execute(
            `
      SELECT gk.kelas_id, k.nama_kelas
      FROM guru_kelas gk
      JOIN kelas k ON gk.kelas_id = k.id_kelas
      WHERE gk.user_id = ?
        AND gk.tahun_ajaran_id = (
          SELECT id_tahun_ajaran 
          FROM tahun_ajaran 
          WHERE status = 'aktif'
          LIMIT 1
        )
      `,
            [userId]
        );

        if (guruKelasRows.length === 0) {
            console.log('❌ Tidak ada data di guru_kelas untuk user_id:', userId);
            return res.status(404).json({
                success: false,
                message: 'Anda tidak memiliki kelas yang diampu pada tahun ajaran aktif.'
            });
        }

        const { kelas_id, nama_kelas } = guruKelasRows[0];
        console.log('✅ kelas_id ditemukan:', kelas_id);

        const [siswaRows] = await db.execute(
            `
      SELECT 
        s.id_siswa AS id,
        s.nis,
        s.nisn,
        s.nama_lengkap AS nama,
        s.tempat_lahir,
        s.tanggal_lahir,
        s.jenis_kelamin,
        s.alamat,
        s.status,
        k.nama_kelas AS kelas,
        k.fase
      FROM siswa s
      JOIN siswa_kelas sk ON s.id_siswa = sk.siswa_id
      JOIN kelas k ON sk.kelas_id = k.id_kelas
      WHERE sk.kelas_id = ?
        AND sk.tahun_ajaran_id = (
          SELECT id_tahun_ajaran 
          FROM tahun_ajaran 
          WHERE status = 'aktif'
          LIMIT 1
        )
      ORDER BY s.nama_lengkap
      `,
            [kelas_id]
        );

        res.json({
            success: true,
            data: siswaRows.map(row => ({
                ...row,
                statusSiswa: row.status ? row.status : 'aktif'
            }))
        });

    } catch (err) {
        console.error('❌ Error di getSiswaByKelas:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data siswa',
            error: err.message || 'Unknown error'
        });
    }
};