const db = require('../config/db');
const bcrypt = require('bcrypt');

// Role Bidang Studi
const ensureGuruBidangStudi = (req, res, next) => {
    if (req.user.role !== 'guru bidang studi') {
        return res.status(403).json({ message: 'Akses ditolak: hanya untuk guru bidang studi' });
    }
    next();
};

// Profil
exports.getProfil = async (req, res) => {
    try {
        const userId = req.user.id;
        const [userRows] = await db.execute(
            `SELECT id_user, nama_lengkap, email_sekolah FROM user WHERE id_user = ?`,
            [userId]
        );
        const [guruRows] = await db.execute(
            `SELECT niy, nuptk, jenis_kelamin, no_telepon, alamat, foto_path FROM guru WHERE user_id = ?`,
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        const user = {
            id: userRows[0].id_user,
            role: 'guru bidang studi',
            nama_lengkap: userRows[0].nama_lengkap,
            email_sekolah: userRows[0].email_sekolah,
            niy: guruRows[0]?.niy || null,
            nuptk: guruRows[0]?.nuptk || null,
            jenis_kelamin: guruRows[0]?.jenis_kelamin || null,
            no_telepon: guruRows[0]?.no_telepon || null,
            alamat: guruRows[0]?.alamat || null,
            profileImage: guruRows[0]?.foto_path || null
        };

        res.json({ user });
    } catch (err) {
        console.error('Error get profil:', err);
        res.status(500).json({ message: 'Gagal mengambil profil' });
    }
};

// Edit profil
exports.editProfil = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ message: 'Request body tidak valid' });
        }

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

        const userId = req.user.id;

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
            `SELECT niy, nuptk, jenis_kelamin, no_telepon, alamat, foto_path FROM guru WHERE user_id = ?`,
            [userId]
        );

        const user = {
            id: userRows[0].id_user,
            role: 'guru bidang studi',
            nama_lengkap: userRows[0].nama_lengkap,
            email_sekolah: userRows[0].email_sekolah,
            niy: guruRows[0].niy,
            nuptk: guruRows[0].nuptk,
            jenis_kelamin: guruRows[0].jenis_kelamin,
            no_telepon: guruRows[0].no_telepon,
            alamat: guruRows[0].alamat,
            profileImage: guruRows[0].foto_path
        };

        res.json({ message: 'Profil berhasil diperbarui', user });
    } catch (err) {
        console.error('Error edit profil:', err);
        res.status(500).json({ message: 'Gagal memperbarui profil' });
    }
};

// Ganti password
exports.gantiPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!oldPassword || !newPassword || newPassword.length < 8) {
            return res.status(400).json({ message: 'Password lama & baru wajib, min. 8 karakter' });
        }

        const [rows] = await db.execute('SELECT password FROM user WHERE id_user = ?', [userId]);
        if (rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });

        const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
        if (!isMatch) return res.status(400).json({ message: 'Kata sandi lama salah' });

        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        await db.execute('UPDATE user SET password = ? WHERE id_user = ?', [newHashedPassword, userId]);

        res.json({ message: 'Kata sandi berhasil diubah' });
    } catch (err) {
        console.error('Error ganti password:', err);
        res.status(500).json({ message: 'Gagal mengubah kata sandi' });
    }
};

// Upload foto
exports.uploadFotoProfil = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'File foto diperlukan' });
        }

        const userId = req.user.id;
        const fotoPath = `uploads/${req.file.filename}`;

        await db.execute('UPDATE guru SET foto_path = ? WHERE user_id = ?', [fotoPath, userId]);

        const [userRows] = await db.execute(
            `SELECT id_user, nama_lengkap, email_sekolah FROM user WHERE id_user = ?`,
            [userId]
        );
        const [guruRows] = await db.execute(
            `SELECT foto_path FROM guru WHERE user_id = ?`,
            [userId]
        );

        const user = {
            id: userRows[0].id_user,
            role: 'guru bidang studi',
            nama_lengkap: userRows[0].nama_lengkap,
            email_sekolah: userRows[0].email_sekolah,
            profileImage: guruRows[0].foto_path
        };

        res.json({ message: 'Foto profil berhasil diupload', user });
    } catch (err) {
        console.error('Error upload foto:', err);
        res.status(500).json({ message: 'Gagal mengupload foto' });
    }
};

// =========== DASHBOARD ===========
exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;

        const [taRows] = await db.execute(
            `SELECT id_tahun_ajaran, tahun_ajaran, semester 
             FROM tahun_ajaran 
             WHERE status = 'aktif' 
             LIMIT 1`
        );

        if (taRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tahun ajaran aktif tidak ditemukan.'
            });
        }

        const { id_tahun_ajaran, tahun_ajaran, semester } = taRows[0];

        const [mapelRows] = await db.execute(`
            SELECT 
                mp.nama_mapel AS nama,
                COUNT(DISTINCT p.kelas_id) AS total_kelas,
                COUNT(sk.siswa_id) AS total_siswa
            FROM pembelajaran p
            INNER JOIN mata_pelajaran mp ON p.mata_pelajaran_id = mp.id_mata_pelajaran
            LEFT JOIN siswa_kelas sk 
                ON p.kelas_id = sk.kelas_id 
                AND sk.tahun_ajaran_id = ?
            WHERE p.user_id = ? 
                AND p.tahun_ajaran_id = ?
                AND mp.jenis = 'pilihan'
            GROUP BY mp.id_mata_pelajaran, mp.nama_mapel
            ORDER BY mp.nama_mapel
        `, [id_tahun_ajaran, userId, id_tahun_ajaran]);

        if (mapelRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Guru belum ditugaskan mengajar mata pelajaran apapun di tahun ajaran ini.'
            });
        }

        const mataPelajaranList = mapelRows.map(row => ({
            nama: row.nama,
            total_kelas: Number(row.total_kelas),
            total_siswa: Number(row.total_siswa)
        }));

        res.json({
            success: true,
            data: {
                tahun_ajaran,
                semester,
                mata_pelajaran_list: mataPelajaranList
            }
        });

    } catch (err) {
        console.error('Error di getDashboardData:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal memuat data dashboard.'
        });
    }
};

// ===== ATUR PENILAIAN =====

// GET /api/guru-bidang-studi/atur-penilaian/mapel
exports.getDaftarMapel = async (req, res) => {
    try {
        const userId = req.user.id; // ID guru bidang studi

        // Ambil ID tahun ajaran aktif
        const [taRows] = await db.execute(`
            SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
        `);
        if (taRows.length === 0) {
            return res.status(400).json({ message: 'Tahun ajaran aktif tidak ditemukan' });
        }
        const taId = taRows[0].id_tahun_ajaran;

        // Ambil semua mapel yang diajar oleh guru ini di tahun ajaran aktif
        const [rows] = await db.execute(`
            SELECT 
                mp.id_mata_pelajaran AS mata_pelajaran_id,
                mp.nama_mapel,
                mp.jenis
            FROM pembelajaran p
            JOIN mata_pelajaran mp ON p.mata_pelajaran_id = mp.id_mata_pelajaran
            WHERE p.user_id = ?
              AND p.tahun_ajaran_id = ?
            ORDER BY mp.jenis, mp.nama_mapel
        `, [userId, taId]);

        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('Error getDaftarMapel:', err);
        res.status(500).json({ message: 'Gagal mengambil daftar mata pelajaran' });
    }
};

// GET /api/guru-bidang-studi/atur-penilaian/komponen
exports.getKomponenPenilaian = async (req, res) => {
    try {
        const [komponen] = await db.execute(`
            SELECT id_komponen, nama_komponen, urutan
            FROM komponen_penilaian
            ORDER BY urutan ASC
        `);
        res.json({ success: true, data: komponen });
    } catch (err) {
        console.error('Error get komponen:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil komponen' });
    }
};

// GET /api/guru-bidang-studi/atur-penilaian/bobot/:mapelId
exports.getBobotPenilaian = async (req, res) => {
    try {
        const { mapelId } = req.params;
        const userId = req.user.id;

        // Validasi tahun ajaran aktif
        const [taRows] = await db.execute(`
            SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
        `);
        if (taRows.length === 0) {
            return res.status(500).json({ success: false, message: 'Tidak ada tahun ajaran aktif' });
        }
        const taId = taRows[0].id_tahun_ajaran;

        // Validasi: apakah guru ini mengajar mapel ini?
        const [valid] = await db.execute(`
            SELECT 1 
            FROM pembelajaran 
            WHERE user_id = ? 
              AND mata_pelajaran_id = ? 
              AND tahun_ajaran_id = ?
        `, [userId, mapelId, taId]);

        if (valid.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Anda tidak mengajar mata pelajaran ini'
            });
        }

        // Ambil bobot dari konfigurasi_mapel_komponen
        const [bobot] = await db.execute(`
            SELECT komponen_id, bobot
            FROM konfigurasi_mapel_komponen
            WHERE mapel_id = ? AND is_active = 1
        `, [mapelId]);

        const bobotMap = {};
        bobot.forEach(b => {
            bobotMap[b.komponen_id] = parseFloat(b.bobot) || 0;
        });

        // Ambil semua komponen
        const [komponenList] = await db.execute(`
            SELECT id_komponen, nama_komponen, urutan
            FROM komponen_penilaian
            ORDER BY urutan ASC
        `);

        const result = komponenList.map(k => ({
            komponen_id: k.id_komponen,
            bobot: bobotMap[k.id_komponen] || 0
        }));

        res.json({ success: true, data: result });
    } catch (err) {
        console.error('Error get bobot:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil bobot' });
    }
};

// PUT /api/guru-bidang-studi/atur-penilaian/bobot/:mapelId
exports.updateBobotPenilaian = async (req, res) => {
    try {
        const { mapelId } = req.params;
        const bobotList = req.body;
        const userId = req.user.id;

        const total = bobotList.reduce((sum, b) => sum + (parseFloat(b.bobot) || 0), 0);
        if (Math.abs(total - 100) > 0.1) {
            return res.status(400).json({ success: false, message: 'Total bobot harus 100%' });
        }

        // Validasi akses
        const [taRows] = await db.execute(`
            SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
        `);
        if (taRows.length === 0) {
            return res.status(500).json({ success: false, message: 'Tidak ada tahun ajaran aktif' });
        }
        const taId = taRows[0].id_tahun_ajaran;

        const [valid] = await db.execute(`
            SELECT 1 
            FROM pembelajaran 
            WHERE user_id = ? AND mata_pelajaran_id = ? AND tahun_ajaran_id = ?
        `, [userId, mapelId, taId]);

        if (valid.length === 0) {
            return res.status(403).json({ success: false, message: 'Akses ditolak' });
        }

        await db.execute(`
            DELETE FROM konfigurasi_mapel_komponen 
            WHERE mapel_id = ?
        `, [mapelId]);

        for (const b of bobotList) {
            await db.execute(`
                INSERT INTO konfigurasi_mapel_komponen (mapel_id, komponen_id, bobot, is_active, created_at, updated_at)
                VALUES (?, ?, ?, 1, NOW(), NOW())
            `, [mapelId, b.komponen_id, parseFloat(b.bobot) || 0]);
        }

        res.json({ success: true, message: 'Bobot penilaian berhasil disimpan' });
    } catch (err) {
        console.error('Error update bobot:', err);
        res.status(500).json({ success: false, message: 'Gagal menyimpan bobot' });
    }
};

// GET /api/guru-bidang-studi/atur-penilaian/kategori
exports.getKategoriAkademik = async (req, res) => {
    try {
        const { mapel_id } = req.query;
        if (!mapel_id) {
            return res.status(400).json({ success: false, message: 'Parameter mapel_id wajib diisi' });
        }

        const mapelIdNum = parseInt(mapel_id, 10);
        if (isNaN(mapelIdNum) || mapelIdNum <= 0) {
            return res.status(400).json({ success: false, message: 'mapel_id tidak valid' });
        }

        const [kategori] = await db.execute(`
            SELECT 
                id_config AS id, 
                min_nilai, 
                max_nilai, 
                deskripsi, 
                urutan
            FROM konfigurasi_nilai_rapor
            WHERE mapel_id = ?
            ORDER BY urutan ASC
        `, [mapelIdNum]);

        res.json({ success: true, data: kategori });
    } catch (err) {
        console.error('Error get kategori akademik:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil kategori akademik' });
    }
};

// POST /api/guru-bidang-studi/atur-penilaian/kategori
exports.createKategoriAkademik = async (req, res) => {
    try {
        const { min_nilai, max_nilai, deskripsi, mapel_id } = req.body;

        if (min_nilai > max_nilai || min_nilai < 0 || max_nilai > 100) {
            return res.status(400).json({ success: false, message: 'Range nilai tidak valid' });
        }

        //  Ambil tahun ajaran aktif
        const [taRows] = await db.execute(`
            SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
        `);
        if (taRows.length === 0) {
            return res.status(400).json({ success: false, message: 'Tahun ajaran aktif belum diatur' });
        }
        const tahun_ajaran_id = taRows[0].id_tahun_ajaran;

        // INSERT dengan tahun_ajaran_id + urutan per mapel & tahun ajaran
        const [result] = await db.execute(`
            INSERT INTO konfigurasi_nilai_rapor (
                mapel_id, 
                tahun_ajaran_id, 
                min_nilai, 
                max_nilai, 
                deskripsi, 
                urutan
            )
            VALUES (?, ?, ?, ?, ?, 
                (SELECT IFNULL(MAX(urutan), 0) + 1 
                 FROM (SELECT urutan 
                       FROM konfigurasi_nilai_rapor 
                       WHERE mapel_id = ? AND tahun_ajaran_id = ?) AS tmp)
            )
        `, [
            mapel_id,
            tahun_ajaran_id,       
            min_nilai,
            max_nilai,
            deskripsi,
            mapel_id,           
            tahun_ajaran_id      
        ]);

        res.json({ 
            success: true, 
            message: 'Kategori berhasil ditambahkan', 
            id: result.insertId 
        });
    } catch (err) {
        console.error('Error create kategori:', err);
        res.status(500).json({ success: false, message: 'Gagal menambah kategori' });
    }
};

// PUT /api/guru-bidang-studi/atur-penilaian/kategori/:id
exports.updateKategoriAkademik = async (req, res) => {
    try {
        const { id } = req.params; // ini adalah id_config
        let { min_nilai, max_nilai, deskripsi, urutan } = req.body;

        min_nilai = Math.floor(parseFloat(min_nilai));
        max_nilai = Math.floor(parseFloat(max_nilai));
        urutan = parseInt(urutan) || 0;

        if (min_nilai < 0 || max_nilai > 100 || min_nilai > max_nilai) {
            return res.status(400).json({ success: false, message: 'Rentang nilai tidak valid' });
        }

        const [result] = await db.execute(`
            UPDATE konfigurasi_nilai_rapor 
            SET 
                min_nilai = ?,
                max_nilai = ?,
                deskripsi = ?,
                urutan = ?
            WHERE id_config = ?
        `, [min_nilai, max_nilai, deskripsi, urutan, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
        }

        res.json({ success: true, message: 'Kategori akademik berhasil diperbarui' });
    } catch (err) {
        console.error('Error updateKategoriAkademik:', err);
        res.status(500).json({ success: false, message: 'Gagal memperbarui kategori' });
    }
};

// DELETE /api/guru-bidang-studi/atur-penilaian/kategori/:id
exports.deleteKategoriAkademik = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.execute(`
            DELETE FROM konfigurasi_nilai_rapor WHERE id_config = ?
        `, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
        }

        res.json({ success: true, message: 'Kategori berhasil dihapus' });
    } catch (err) {
        console.error('Error delete kategori:', err);
        res.status(500).json({ success: false, message: 'Gagal menghapus kategori' });
    }
};

// GET /api/guru-bidang-studi/atur-penilaian/kelas
exports.getDaftarKelas = async (req, res) => {
    try {
        const userId = req.user.id;

        const [taRows] = await db.execute(`
            SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
        `);
        if (taRows.length === 0) {
            return res.status(400).json({ success: false, message: 'Tidak ada tahun ajaran aktif' });
        }
        const taId = taRows[0].id_tahun_ajaran;

        const [kelasRows] = await db.execute(`
            SELECT DISTINCT k.id_kelas, k.nama_kelas
            FROM pembelajaran p
            JOIN kelas k ON p.kelas_id = k.id_kelas
            WHERE p.user_id = ? AND p.tahun_ajaran_id = ?
            ORDER BY k.nama_kelas
        `, [userId, taId]);

        res.json({
            success: true,
            data: kelasRows.map(row => ({
                kelas_id: row.id_kelas,
                nama_kelas: row.nama_kelas
            }))
        });
    } catch (err) {
        console.error('Error getDaftarKelas:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil daftar kelas' });
    }
};

// GET /api/guru-bidang-studi/nilai/:mapelId/:kelasId
exports.getNilaiByMapelAndKelas = async (req, res) => {
    try {
        const { mapelId, kelasId } = req.params;
        const userId = req.user.id;

        if (!mapelId || !kelasId) {
            return res.status(400).json({ success: false, message: 'ID mata pelajaran dan kelas wajib diisi' });
        }

        const [taRows] = await db.execute(`
            SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
        `);
        if (taRows.length === 0) {
            return res.status(500).json({ success: false, message: 'Tahun ajaran aktif tidak ditemukan' });
        }
        const taId = taRows[0].id_tahun_ajaran;

        const [valid] = await db.execute(`
            SELECT 1 FROM pembelajaran 
            WHERE user_id = ? AND mata_pelajaran_id = ? AND kelas_id = ? AND tahun_ajaran_id = ?
        `, [userId, mapelId, kelasId, taId]);

        if (valid.length === 0) {
            return res.status(403).json({ success: false, message: 'Anda tidak mengajar mata pelajaran ini di kelas ini' });
        }

        const [namaKelasRow] = await db.execute(`SELECT nama_kelas FROM kelas WHERE id_kelas = ?`, [kelasId]);
        const kelasNama = namaKelasRow[0]?.nama_kelas || 'Kelas Tidak Diketahui';

        const [siswaRows] = await db.execute(`
            SELECT s.id_siswa AS id, s.nis, s.nisn, s.nama_lengkap AS nama
            FROM siswa s
            JOIN siswa_kelas sk ON s.id_siswa = sk.siswa_id
            WHERE sk.kelas_id = ? AND sk.tahun_ajaran_id = ?
            ORDER BY s.nama_lengkap
        `, [kelasId, taId]);

        const [nilaiRows] = await db.execute(`
            SELECT siswa_id, komponen_id, nilai 
            FROM nilai_detail 
            WHERE mapel_id = ? AND tahun_ajaran_id = ?
        `, [mapelId, taId]);

        const [komponenRows] = await db.execute(`
            SELECT id_komponen, nama_komponen 
            FROM komponen_penilaian 
            ORDER BY urutan
        `);

        const [bobotRows] = await db.execute(`
            SELECT komponen_id, bobot 
            FROM konfigurasi_mapel_komponen 
            WHERE mapel_id = ?
        `, [mapelId]);

        const nilaiMap = {};
        nilaiRows.forEach(n => {
            if (!nilaiMap[n.siswa_id]) nilaiMap[n.siswa_id] = {};
            nilaiMap[n.siswa_id][n.komponen_id] = n.nilai;
        });

        const bobotMap = new Map();
        bobotRows.forEach(b => {
            bobotMap.set(b.komponen_id, parseFloat(b.bobot) || 0);
        });

        const uhKomponenIds = komponenRows
            .filter(k => /^UH\s+\d+$/i.test(k.nama_komponen))
            .map(k => k.id_komponen);
        const ptsKomponen = komponenRows.find(k => /PTS/i.test(k.nama_komponen));
        const pasKomponen = komponenRows.find(k => /PAS/i.test(k.nama_komponen));

        const [configRows] = await db.execute(`
    SELECT min_nilai, max_nilai, deskripsi 
    FROM konfigurasi_nilai_rapor 
    WHERE mapel_id = ?
    ORDER BY min_nilai DESC
`, [mapelId]);

        const siswaList = siswaRows.map(s => {
            const nilai = nilaiMap[s.id] || {};
            const nilaiUH = uhKomponenIds.map(id => nilai[id]).filter(v => v != null);
            const rataUH = nilaiUH.length > 0 ? nilaiUH.reduce((a, b) => a + b, 0) / nilaiUH.length : 0;
            const totalBobotUH = uhKomponenIds.reduce((sum, id) => sum + (bobotMap.get(id) || 0), 0);
            const nilaiPTS = ptsKomponen ? (nilai[ptsKomponen.id_komponen] || 0) : 0;
            const bobotPTS = ptsKomponen ? (bobotMap.get(ptsKomponen.id_komponen) || 0) : 0;
            const nilaiPAS = pasKomponen ? (nilai[pasKomponen.id_komponen] || 0) : 0;
            const bobotPAS = pasKomponen ? (bobotMap.get(pasKomponen.id_komponen) || 0) : 0;

            let nilaiRapor = 0;
            if (totalBobotUH > 0) nilaiRapor += (rataUH * totalBobotUH);
            if (bobotPTS > 0) nilaiRapor += (nilaiPTS * bobotPTS);
            if (bobotPAS > 0) nilaiRapor += (nilaiPAS * bobotPAS);
            nilaiRapor = nilaiRapor / 100;
            const nilaiRaporBulat = Math.floor(nilaiRapor);

            let deskripsi = 'Belum ada deskripsi';
            for (const config of configRows) {
                if (nilaiRaporBulat >= config.min_nilai && nilaiRaporBulat <= config.max_nilai) {
                    deskripsi = config.deskripsi;
                    break;
                }
            }

            const nilaiRecord = {};
            komponenRows.forEach(k => {
                nilaiRecord[k.id_komponen] = nilai[k.id_komponen] ?? null;
            });

            return {
                id: s.id,
                nama: s.nama,
                nis: s.nis,
                nisn: s.nisn,
                nilai_rapor: nilaiRaporBulat,
                deskripsi: deskripsi,
                nilai: nilaiRecord
            };
        });

        res.json({
            success: true,
            siswaList,
            komponen: komponenRows,
            kelas: kelasNama
        });
    } catch (err) {
        console.error('Error getNilaiByMapelAndKelas:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data nilai' });
    }
};

// POST /api/guru-bidang-studi/nilai
exports.simpanNilai = async (req, res) => {
    try {
        const { siswa_id, mapel_id, komponen_id, nilai } = req.body;
        const user_id = req.user.id;

        if (!siswa_id || !mapel_id || !komponen_id || nilai === undefined) {
            return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
        }
        if (nilai < 0 || nilai > 100) {
            return res.status(400).json({ success: false, message: 'Nilai harus antara 0 dan 100' });
        }

        const [taRows] = await db.execute(`
            SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
        `);
        if (taRows.length === 0) {
            return res.status(500).json({ success: false, message: 'Tahun ajaran aktif tidak ditemukan' });
        }
        const taId = taRows[0].id_tahun_ajaran;

        const [valid] = await db.execute(`
            SELECT 1 FROM pembelajaran 
            WHERE user_id = ? AND mata_pelajaran_id = ? AND kelas_id IN (
                SELECT kelas_id FROM siswa_kelas 
                WHERE siswa_id = ? AND tahun_ajaran_id = ?
            ) AND tahun_ajaran_id = ?
        `, [user_id, mapel_id, siswa_id, taId, taId]);

        if (valid.length === 0) {
            return res.status(403).json({ success: false, message: 'Akses ditolak' });
        }

        await db.execute(`
            INSERT INTO nilai_detail (siswa_id, mapel_id, komponen_id, nilai, tahun_ajaran_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
                nilai = VALUES(nilai),
                updated_at = NOW()
        `, [siswa_id, mapel_id, komponen_id, nilai, taId]);

        res.json({ success: true, message: 'Nilai berhasil disimpan' });
    } catch (err) {
        console.error('Error simpanNilai:', err);
        res.status(500).json({ success: false, message: 'Gagal menyimpan nilai' });
    }
};

exports.simpanNilaiKomponenBanyak = async (req, res) => {
    const { mapelId, siswaId } = req.params;
    const { nilai } = req.body;

    // Validasi
    const mapelIdNum = parseInt(mapelId, 10);
    const siswaIdNum = parseInt(siswaId, 10);
    if (isNaN(mapelIdNum) || isNaN(siswaIdNum)) {
        return res.status(400).json({ success: false, message: 'ID mata pelajaran atau siswa tidak valid' });
    }

    const userId = req.user.id;

    // Ambil tahun ajaran aktif
    const [taRows] = await db.execute(`
        SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
    `);
    if (taRows.length === 0) {
        return res.status(400).json({ success: false, message: 'Tahun ajaran aktif tidak ditemukan' });
    }
    const tahun_ajaran_id = taRows[0].id_tahun_ajaran;

    // Simpan nilai per komponen ke `nilai_detail`
    for (const [komponenIdStr, nilaiSiswa] of Object.entries(nilai)) {
        const komponenId = parseInt(komponenIdStr, 10);
        let nilaiBulat = null;
        if (nilaiSiswa != null && !isNaN(nilaiSiswa)) {
            nilaiBulat = Math.floor(parseFloat(nilaiSiswa));
            if (nilaiBulat < 0) nilaiBulat = 0;
            if (nilaiBulat > 100) nilaiBulat = 100;
        }

        await db.execute(`
            INSERT INTO nilai_detail (siswa_id, mapel_id, komponen_id, nilai, tahun_ajaran_id, created_by_user_id)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                nilai = VALUES(nilai),
                updated_at = NOW()
        `, [siswaIdNum, mapelIdNum, komponenId, nilaiBulat, tahun_ajaran_id, userId]);
    }

    // ====== PERHITUNGAN NILAI RAPOR & DESKRIPSI BARU ======
    // Ambil semua data yang dibutuhkan
    const [komponenRows] = await db.execute(`
        SELECT id_komponen, nama_komponen 
        FROM komponen_penilaian 
        ORDER BY urutan
    `);

    const [bobotRows] = await db.execute(`
        SELECT komponen_id, bobot 
        FROM konfigurasi_mapel_komponen 
        WHERE mapel_id = ?
    `, [mapelIdNum]);

    const [nilaiRows] = await db.execute(`
        SELECT komponen_id, nilai 
        FROM nilai_detail 
        WHERE siswa_id = ? AND mapel_id = ? AND tahun_ajaran_id = ?
    `, [siswaIdNum, mapelIdNum, tahun_ajaran_id]);

    const nilaiMap = new Map();
    nilaiRows.forEach(row => {
        nilaiMap.set(row.komponen_id, row.nilai);
    });

    const bobotMap = new Map();
    bobotRows.forEach(row => {
        bobotMap.set(row.komponen_id, parseFloat(row.bobot) || 0);
    });

    // Pisahkan UH, PTS, PAS
    const uhKomponenIds = komponenRows
        .filter(k => /^UH\s+\d+$/i.test(k.nama_komponen))
        .map(k => k.id_komponen);
    const ptsKomponen = komponenRows.find(k => /PTS/i.test(k.nama_komponen));
    const pasKomponen = komponenRows.find(k => /PAS/i.test(k.nama_komponen));

    // Hitung nilai
    const nilaiUH = uhKomponenIds.map(id => nilaiMap.get(id)).filter(v => v != null);
    const rataUH = nilaiUH.length > 0 ? nilaiUH.reduce((a, b) => a + b, 0) / nilaiUH.length : 0;
    const totalBobotUH = uhKomponenIds.reduce((sum, id) => sum + (bobotMap.get(id) || 0), 0);
    const nilaiPTS = ptsKomponen ? (nilaiMap.get(ptsKomponen.id_komponen) || 0) : 0;
    const bobotPTS = ptsKomponen ? (bobotMap.get(ptsKomponen.id_komponen) || 0) : 0;
    const nilaiPAS = pasKomponen ? (nilaiMap.get(pasKomponen.id_komponen) || 0) : 0;
    const bobotPAS = pasKomponen ? (bobotMap.get(pasKomponen.id_komponen) || 0) : 0;

    let nilaiRapor = 0;
    if (totalBobotUH > 0) nilaiRapor += (rataUH * totalBobotUH);
    if (bobotPTS > 0) nilaiRapor += (nilaiPTS * bobotPTS);
    if (bobotPAS > 0) nilaiRapor += (nilaiPAS * bobotPAS);
    nilaiRapor = nilaiRapor / 100;
    const nilaiRaporBulat = Math.floor(nilaiRapor);

    // Ambil deskripsi dari kategori
    let deskripsi = 'Belum ada deskripsi';
    const [configRows] = await db.execute(`
        SELECT min_nilai, max_nilai, deskripsi 
        FROM konfigurasi_nilai_rapor 
        WHERE mapel_id = ?
        ORDER BY min_nilai DESC
    `, [mapelIdNum]);

    for (const config of configRows) {
        if (nilaiRaporBulat >= config.min_nilai && nilaiRaporBulat <= config.max_nilai) {
            deskripsi = config.deskripsi;
            break;
        }
    }

    // Simpan ke nilai_rapor
    const [kelasRows] = await db.execute(`
        SELECT kelas_id FROM pembelajaran 
        WHERE mata_pelajaran_id = ? AND user_id = ? AND tahun_ajaran_id = ?
        LIMIT 1
    `, [mapelIdNum, userId, tahun_ajaran_id]);

    if (kelasRows.length === 0) {
        return res.status(500).json({ success: false, message: 'Kelas tidak ditemukan untuk mata pelajaran ini' });
    }
    const kelas_id = kelasRows[0].kelas_id;

    // Ambil semester aktif
    const [semesterRows] = await db.execute(`
        SELECT semester FROM tahun_ajaran WHERE id_tahun_ajaran = ?
    `, [tahun_ajaran_id]);
    const semester = semesterRows[0]?.semester || 'genap';

    // Simpan nilai rapor ke tabel
    await db.execute(`
        INSERT INTO nilai_rapor (
            siswa_id, mapel_id, kelas_id, tahun_ajaran_id, semester,
            nilai_rapor, deskripsi, created_by_user_id, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            nilai_rapor = VALUES(nilai_rapor),
            deskripsi = VALUES(deskripsi),
            updated_at = NOW()
    `, [siswaIdNum, mapelIdNum, kelas_id, tahun_ajaran_id, semester, nilaiRaporBulat, deskripsi, userId]);

    res.json({
        success: true,
        message: 'Nilai komponen berhasil disimpan',
        nilai_rapor: nilaiRaporBulat,
        deskripsi: deskripsi
    });
};