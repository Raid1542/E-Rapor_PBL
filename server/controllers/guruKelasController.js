const db = require('../config/db');
const bcrypt = require('bcrypt');

// Ambil data kelas yang diampu oleh guru yang sedang login
exports.getKelasSaya = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: 'User ID tidak ditemukan' });
        }

        const query = `
      SELECT 
        k.nama_kelas,
        COUNT(sk.siswa_id) AS jumlah_siswa,
        ta.tahun_ajaran
      FROM user u
      INNER JOIN guru g ON u.id_user = g.user_id
      INNER JOIN guru_kelas gk ON g.user_id = gk.user_id  
      INNER JOIN kelas k ON gk.kelas_id = k.id_kelas
      INNER JOIN tahun_ajaran ta ON gk.tahun_ajaran_id = ta.id_tahun_ajaran
      LEFT JOIN siswa_kelas sk ON k.id_kelas = sk.kelas_id 
        AND sk.tahun_ajaran_id = ta.id_tahun_ajaran
      WHERE 
        u.id_user = ? 
        AND ta.status = 'aktif'
      GROUP BY k.id_kelas, ta.id_tahun_ajaran
    `;

        const [rows] = await db.execute(query, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Anda belum ditugaskan sebagai guru kelas pada tahun ajaran ini.'
            });
        }

        res.json(rows.map(row => ({
            kelas: row.nama_kelas,
            jumlah_siswa: row.jumlah_siswa,
            tahun_ajaran: row.tahun_ajaran
        })));

    } catch (err) {
        console.error('Error di getKelasSaya:', err);
        res.status(500).json({
            message: 'Gagal mengambil data kelas',
            error: err.message || 'Unknown error'
        });
    }
};

// Edit profil guru
exports.editProfil = async (req, res) => {
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

// Ganti password
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

        const [rows] = await db.execute(
            'SELECT password FROM user WHERE id_user = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        const hashedPassword = rows[0].password;
        const isMatch = await bcrypt.compare(oldPassword, hashedPassword);
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

// Ambil data siswa berdasarkan kelas yang diampu
exports.getSiswaByKelas = async (req, res) => {
    const userId = Number(req.user.id);
    try {
        const [guruKelasRows] = await db.execute(`
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
    `, [userId]);

        if (guruKelasRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Anda tidak memiliki kelas yang diampu pada tahun ajaran aktif.'
            });
        }

        const { kelas_id } = guruKelasRows[0];

        const [siswaRows] = await db.execute(`
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
    `, [kelas_id]);

        res.json({
            success: true,
            data: siswaRows.map(row => ({
                ...row,
                statusSiswa: row.status || 'aktif'
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

// Ambil data absensi total
exports.getAbsensiTotal = async (req, res) => {
    try {
        const userId = req.user.id;
        const [guruKelasRows] = await db.execute(`
      SELECT 
        gk.kelas_id, 
        ta.id_tahun_ajaran, 
        ta.tahun_ajaran,
        k.nama_kelas
      FROM guru_kelas gk
      JOIN tahun_ajaran ta ON gk.tahun_ajaran_id = ta.id_tahun_ajaran
      JOIN kelas k ON gk.kelas_id = k.id_kelas
      WHERE gk.user_id = ? AND ta.status = 'aktif'
    `, [userId]);

        if (guruKelasRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Anda tidak memiliki kelas yang diampu pada tahun ajaran aktif.'
            });
        }

        const { kelas_id, id_tahun_ajaran, nama_kelas } = guruKelasRows[0];

        const [siswaRows] = await db.execute(`
      SELECT 
        s.id_siswa AS id,
        s.nama_lengkap AS nama,
        s.nis,
        s.nisn,
        COALESCE(a.sakit, 0) AS jumlah_sakit,
        COALESCE(a.izin, 0) AS jumlah_izin,
        COALESCE(a.alpha, 0) AS jumlah_alpha,
        CASE WHEN a.id_absensi IS NOT NULL THEN 1 ELSE 0 END AS sudah_diinput
      FROM siswa s
      JOIN siswa_kelas sk ON s.id_siswa = sk.siswa_id
      LEFT JOIN absensi a ON s.id_siswa = a.siswa_id 
        AND sk.kelas_id = a.kelas_id 
        AND sk.tahun_ajaran_id = a.tahun_ajaran_id
      WHERE sk.kelas_id = ? AND sk.tahun_ajaran_id = ?
      ORDER BY s.nama_lengkap
    `, [kelas_id, id_tahun_ajaran]);

        res.json({
            success: true,
            data: siswaRows,
            kelas: nama_kelas
        });

    } catch (err) {
        console.error('Error getAbsensiTotal:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data absensi',
            error: err.message || 'Unknown error'
        });
    }
};

// Update absensi total
exports.updateAbsensiTotal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { siswa_id } = req.params;
        const { jumlah_sakit, jumlah_izin, jumlah_alpha } = req.body;

        if (!siswa_id) {
            return res.status(400).json({ message: 'ID siswa wajib diisi' });
        }

        const [guruKelasRows] = await db.execute(`
      SELECT gk.kelas_id, ta.id_tahun_ajaran
      FROM guru_kelas gk
      JOIN tahun_ajaran ta ON gk.tahun_ajaran_id = ta.id_tahun_ajaran
      WHERE gk.user_id = ? AND ta.status = 'aktif'
    `, [userId]);

        if (guruKelasRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Anda tidak memiliki kelas yang diampu pada tahun ajaran aktif.'
            });
        }

        const { kelas_id, id_tahun_ajaran } = guruKelasRows[0];

        const [existing] = await db.execute(`
      SELECT id_absensi
      FROM absensi
      WHERE siswa_id = ? AND kelas_id = ? AND tahun_ajaran_id = ?
    `, [siswa_id, kelas_id, id_tahun_ajaran]);

        if (existing.length > 0) {
            await db.execute(`
        UPDATE absensi
        SET sakit = ?, izin = ?, alpha = ?, updated_at = NOW()
        WHERE id_absensi = ?
      `, [jumlah_sakit, jumlah_izin, jumlah_alpha, existing[0].id_absensi]);
        } else {
            await db.execute(`
        INSERT INTO absensi (siswa_id, kelas_id, tahun_ajaran_id, sakit, izin, alpha, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [siswa_id, kelas_id, id_tahun_ajaran, jumlah_sakit, jumlah_izin, jumlah_alpha]);
        }

        res.json({
            success: true,
            message: 'Data absensi berhasil diperbarui'
        });

    } catch (err) {
        console.error('Error updateAbsensiTotal:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui data absensi',
            error: err.message || 'Unknown error'
        });
    }
};

// Ambil catatan wali kelas (PTS & PAS)
exports.getCatatanWaliKelas = async (req, res) => {
    try {
        const userId = req.user.id;

        const [guruKelasRows] = await db.execute(`
      SELECT gk.kelas_id, ta.id_tahun_ajaran, k.nama_kelas
      FROM guru_kelas gk
      JOIN tahun_ajaran ta ON gk.tahun_ajaran_id = ta.id_tahun_ajaran
      JOIN kelas k ON gk.kelas_id = k.id_kelas
      WHERE gk.user_id = ? AND ta.status = 'aktif'
    `, [userId]);

        if (guruKelasRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Anda tidak memiliki kelas yang diampu pada tahun ajaran aktif.'
            });
        }

        const { kelas_id, id_tahun_ajaran, nama_kelas } = guruKelasRows[0];

        const [siswaRows] = await db.execute(`
      SELECT 
        s.id_siswa AS id,
        s.nama_lengkap AS nama,
        s.nis,
        s.nisn,
        COALESCE(cw.catatan_pts, '') AS catatan_pts,
        COALESCE(cw.catatan_pas, '') AS catatan_pas,
        COALESCE(cw.naik_tingkat, 'tidak') AS naik_tingkat
      FROM siswa s
      JOIN siswa_kelas sk ON s.id_siswa = sk.siswa_id
      LEFT JOIN catatan_wali_kelas cw 
        ON s.id_siswa = cw.siswa_id
        AND sk.kelas_id = cw.kelas_id
        AND sk.tahun_ajaran_id = cw.tahun_ajaran_id
      WHERE sk.kelas_id = ? AND sk.tahun_ajaran_id = ?
      ORDER BY s.nama_lengkap
    `, [kelas_id, id_tahun_ajaran]);

        res.json({
            success: true,
            data: siswaRows,
            kelas: nama_kelas
        });

    } catch (err) {
        console.error('Error getCatanWaliKelas:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data catatan wali kelas',
            error: err.message || 'Unknown error'
        });
    }
};

// Update catatan wali kelas (PTS & PAS)
exports.updateCatatanWaliKelas = async (req, res) => {
    try {
        const userId = req.user.id;
        const { siswa_id } = req.params;
        const {
            catatan_pts = '',
            catatan_pas = '',
            naik_tingkat = 'tidak'
        } = req.body;

        if (!siswa_id) {
            return res.status(400).json({ message: 'ID siswa wajib diisi' });
        }

        if (!['ya', 'tidak'].includes(naik_tingkat)) {
            return res.status(400).json({ message: 'Nilai naik_tingkat harus "ya" atau "tidak"' });
        }

        const [guruKelasRows] = await db.execute(`
      SELECT gk.kelas_id, ta.id_tahun_ajaran
      FROM guru_kelas gk
      JOIN tahun_ajaran ta ON gk.tahun_ajaran_id = ta.id_tahun_ajaran
      WHERE gk.user_id = ? AND ta.status = 'aktif'
    `, [userId]);

        if (guruKelasRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Anda tidak memiliki kelas yang diampu pada tahun ajaran aktif.'
            });
        }

        const { kelas_id, id_tahun_ajaran } = guruKelasRows[0];

        await db.execute(`
      INSERT INTO catatan_wali_kelas 
        (siswa_id, kelas_id, tahun_ajaran_id, catatan_pts, catatan_pas, naik_tingkat)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        catatan_pts = VALUES(catatan_pts),
        catatan_pas = VALUES(catatan_pas),
        naik_tingkat = VALUES(naik_tingkat),
        updated_at = NOW()
    `, [siswa_id, kelas_id, id_tahun_ajaran, catatan_pts, catatan_pas, naik_tingkat]);

        res.json({
            success: true,
            message: 'Catatan wali kelas berhasil diperbarui'
        });

    } catch (err) {
        console.error('Error updateCatatanWaliKelas:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui catatan wali kelas',
            error: err.message || 'Unknown error'
        });
    }
};

// === FITUR EKSTRAKURIKULER ===

// Helper: Ambil daftar ekstrakurikuler (tanpa status karena tidak ada di tabel)
async function getDaftarEkskul(tahunAjaranId) {
    const [rows] = await db.execute(
        'SELECT id_ekskul, nama_ekskul FROM ekstrakurikuler WHERE tahun_ajaran_id = ?',
        [tahunAjaranId]
    );
    return rows;
}

// GET: Ambil data ekstrakurikuler semua siswa di kelas
exports.getEkskulSiswa = async (req, res) => {
    try {
        const userId = req.user.id;

        const [kelasRows] = await db.execute(`
      SELECT 
        gk.kelas_id, 
        ta.id_tahun_ajaran, 
        ta.tahun_ajaran,
        k.nama_kelas
      FROM guru_kelas gk
      JOIN tahun_ajaran ta ON gk.tahun_ajaran_id = ta.id_tahun_ajaran
      JOIN kelas k ON gk.kelas_id = k.id_kelas
      WHERE gk.user_id = ? AND ta.status = 'aktif'
      LIMIT 1
    `, [userId]);

        if (kelasRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Anda tidak memiliki kelas yang diampu pada tahun ajaran aktif.'
            });
        }

        const { kelas_id, id_tahun_ajaran, nama_kelas, tahun_ajaran } = kelasRows[0];

        const [siswaRows] = await db.execute(`
      SELECT s.id_siswa, s.nama_lengkap AS nama, s.nis, s.nisn
      FROM siswa s
      JOIN siswa_kelas sk ON s.id_siswa = sk.siswa_id
      WHERE sk.kelas_id = ? AND sk.tahun_ajaran_id = ?
      ORDER BY s.nama_lengkap
    `, [kelas_id, id_tahun_ajaran]);

        const siswaWithEkskul = [];
        for (const siswa of siswaRows) {
            const [ekskulRows] = await db.execute(`
        SELECT 
          e.id_ekskul,
          e.nama_ekskul,
          COALESCE(pe.deskripsi, e.keterangan, 'Belum diisi') AS deskripsi
        FROM peserta_ekstrakurikuler pe
        JOIN ekstrakurikuler e ON pe.ekskul_id = e.id_ekskul
        WHERE pe.siswa_id = ? AND pe.tahun_ajaran_id = ?
        ORDER BY e.nama_ekskul
      `, [siswa.id_siswa, id_tahun_ajaran]);

            siswaWithEkskul.push({
                id: siswa.id_siswa,
                nama: siswa.nama,
                nis: siswa.nis,
                nisn: siswa.nisn,
                ekskul: ekskulRows.map(e => ({
                    id: e.id_ekskul,
                    nama: e.nama_ekskul,
                    deskripsi: e.deskripsi
                })),
                jumlah_ekskul: ekskulRows.length
            });
        }

        // Ambil daftar ekstrakurikuler (untuk dropdown di frontend)
        let daftarEkskul = [];
        try {
            const [rows] = await db.execute(
                'SELECT id_ekskul, nama_ekskul FROM ekstrakurikuler WHERE tahun_ajaran_id = ?',
                [id_tahun_ajaran]
            );
            daftarEkskul = rows;
        } catch (err) {
            console.error('Error mengambil daftar ekstrakurikuler:', err);
            // Biarkan daftar kosong agar tidak crash
        }

        // Kirim respons
        res.json({
            success: true,
            data: siswaWithEkskul,
            daftar_ekskul: daftarEkskul,
            kelas: nama_kelas,
            tahun_ajaran: tahun_ajaran
        });

    } catch (err) {
        console.error('Error di getEkskulSiswa:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data ekstrakurikuler',
            error: err.message || 'Unknown error'
        });
    }
};

// PUT: Simpan/update ekstrakurikuler siswa
exports.updateEkskulSiswa = async (req, res) => {
    const { siswaId } = req.params;
    const { ekskulList } = req.body;

    try {
        const userId = req.user.id;

        if (!Array.isArray(ekskulList)) {
            return res.status(400).json({ message: 'ekskulList harus berupa array' });
        }

        if (ekskulList.length > 3) {
            return res.status(400).json({ message: 'Maksimal 3 ekstrakurikuler per siswa' });
        }

        const [kelasRows] = await db.execute(`
      SELECT gk.kelas_id, ta.id_tahun_ajaran
      FROM guru_kelas gk
      JOIN tahun_ajaran ta ON gk.tahun_ajaran_id = ta.id_tahun_ajaran
      WHERE gk.user_id = ? AND ta.status = 'aktif'
      LIMIT 1
    `, [userId]);

        if (kelasRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Anda tidak memiliki kelas yang diampu pada tahun ajaran aktif.'
            });
        }

        const { kelas_id, id_tahun_ajaran } = kelasRows[0];

        const [validSiswa] = await db.execute(`
      SELECT 1 FROM siswa_kelas
      WHERE siswa_id = ? AND kelas_id = ? AND tahun_ajaran_id = ?
    `, [siswaId, kelas_id, id_tahun_ajaran]);

        if (validSiswa.length === 0) {
            return res.status(403).json({ message: 'Siswa tidak terdaftar di kelas Anda' });
        }

        await db.execute(
            'DELETE FROM peserta_ekstrakurikuler WHERE siswa_id = ? AND tahun_ajaran_id = ?',
            [siswaId, id_tahun_ajaran]
        );

        if (ekskulList.length > 0) {
            const insertData = ekskulList.map(item => [
                siswaId,
                item.ekskul_id,
                id_tahun_ajaran,
                item.deskripsi || null
            ]);

            await db.query(
                'INSERT INTO peserta_ekstrakurikuler (siswa_id, ekskul_id, tahun_ajaran_id, deskripsi) VALUES ?',
                [insertData]
            );
        }

        res.json({
            success: true,
            message: 'Data ekstrakurikuler berhasil disimpan'
        });

    } catch (err) {
        console.error('Error di updateEkskulSiswa:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui data ekstrakurikuler',
            error: err.message || 'Unknown error'
        });
    }
};