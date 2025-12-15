const db = require('../config/db');
const bcrypt = require('bcrypt');
const absensiModel = require('../models/absensiModel');
const catatanWaliKelasModel = require('../models/catatanWaliKelasModel');
const ekstrakurikulerModel = require('../models/ekstrakurikulerModel');
const kokurikulerModel = require('../models/kokurikulerModel');
const guruModel = require('../models/guruModel');

// === KELAS & SISWA ===

exports.getKelasSaya = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) return res.status(400).json({ message: 'User ID tidak ditemukan' });

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
        WHERE u.id_user = ? AND ta.status = 'aktif'
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
        res.status(500).json({ message: 'Gagal mengambil data kelas' });
    }
};

exports.getSiswaByKelas = async (req, res) => {
    try {
        const userId = req.user.id;
        const [guruKelasRows] = await db.execute(`
            SELECT gk.kelas_id, k.nama_kelas
            FROM guru_kelas gk
            JOIN kelas k ON gk.kelas_id = k.id_kelas
            WHERE gk.user_id = ?
                AND gk.tahun_ajaran_id = (SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
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
                s.nis, s.nisn, s.nama_lengkap AS nama,
                s.tempat_lahir, s.tanggal_lahir, s.jenis_kelamin, s.alamat, s.status,
                k.nama_kelas AS kelas, k.fase
            FROM siswa s
            JOIN siswa_kelas sk ON s.id_siswa = sk.siswa_id
            JOIN kelas k ON sk.kelas_id = k.id_kelas
            WHERE sk.kelas_id = ? AND sk.tahun_ajaran_id = (
                SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
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
        res.status(500).json({ success: false, message: 'Gagal mengambil data siswa' });
    }
};

// === PROFIL & PASSWORD ===

exports.editProfil = async (req, res) => {
    try {
        const userId = req.user.id;
        const { nama_lengkap, email_sekolah, niy, nuptk, jenis_kelamin, no_telepon, alamat } = req.body;

        if (!nama_lengkap || !email_sekolah) {
            return res.status(400).json({ message: 'Nama dan email wajib diisi' });
        }

        // Update data
        await db.execute(`UPDATE user SET nama_lengkap = ?, email_sekolah = ? WHERE id_user = ?`, [nama_lengkap, email_sekolah, userId]);
        await db.execute(`UPDATE guru SET niy = ?, nuptk = ?, jenis_kelamin = ?, no_telepon = ?, alamat = ? WHERE user_id = ?`, [niy, nuptk, jenis_kelamin, no_telepon, alamat, userId]);

        // Ambil data terbaru
        const [userRows] = await db.execute(`SELECT id_user, nama_lengkap, email_sekolah FROM user WHERE id_user = ?`, [userId]);
        const [guruRows] = await db.execute(`SELECT niy, nuptk, jenis_kelamin, no_telepon, alamat, foto_path FROM guru WHERE user_id = ?`, [userId]);

        if (userRows.length === 0 || guruRows.length === 0) {
            return res.status(404).json({ message: 'Profil tidak ditemukan' });
        }

        // Gabungkan & normalisasi
        const user = {
            id: userRows[0].id_user,
            role: 'guru kelas', // pastikan role ada
            nama_lengkap: userRows[0].nama_lengkap,
            email_sekolah: userRows[0].email_sekolah,
            niy: guruRows[0].niy,
            nuptk: guruRows[0].nuptk,
            jenis_kelamin: guruRows[0].jenis_kelamin,
            no_telepon: guruRows[0].no_telepon,
            alamat: guruRows[0].alamat,
            profileImage: guruRows[0].foto_path || null // untuk konsistensi frontend
        };

        res.json({
            message: 'Profil berhasil diperbarui',
            user // ✅ kirim sebagai "user"
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

// === ABSENSI ===

exports.getAbsensiTotal = async (req, res) => {
    try {
        const userId = req.user.id;
        const guruKelas = await absensiModel.getGuruKelasAktif(userId);
        if (!guruKelas) return res.status(404).json({ success: false, message: 'Kelas aktif tidak ditemukan.' });

        const { kelas_id, id_tahun_ajaran, nama_kelas } = guruKelas;
        const data = await absensiModel.getAbsensiByKelas(kelas_id, id_tahun_ajaran);
        res.json({ success: true, data, kelas: nama_kelas });

    } catch (err) {
        console.error('Error getAbsensiTotal:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data absensi' });
    }
};

exports.updateAbsensiTotal = async (req, res) => {
    try {
        const { siswa_id } = req.params;
        const { jumlah_sakit, jumlah_izin, jumlah_alpha } = req.body;
        if (!siswa_id) return res.status(400).json({ message: 'ID siswa wajib diisi' });

        const userId = req.user.id;
        const guruKelas = await absensiModel.getGuruKelasAktif(userId);
        if (!guruKelas) return res.status(404).json({ success: false, message: 'Kelas aktif tidak ditemukan.' });

        await absensiModel.upsertAbsensi(siswa_id, guruKelas.kelas_id, guruKelas.id_tahun_ajaran, jumlah_sakit, jumlah_izin, jumlah_alpha);
        res.json({ success: true, message: 'Absensi berhasil diperbarui' });

    } catch (err) {
        console.error('Error updateAbsensiTotal:', err);
        res.status(500).json({ success: false, message: 'Gagal memperbarui absensi' });
    }
};

// === CATATAN WALI KELAS ===

exports.getCatatanWaliKelas = async (req, res) => {
    try {
        const userId = req.user.id;
        const guruKelas = await catatanWaliKelasModel.getGuruKelasAktif(userId);
        if (!guruKelas) return res.status(404).json({ success: false, message: 'Kelas aktif tidak ditemukan.' });

        const { kelas_id, id_tahun_ajaran, nama_kelas, semester } = guruKelas;
        const data = await catatanWaliKelasModel.getCatatanByKelas(kelas_id, id_tahun_ajaran, semester);
        res.json({ success: true, data, kelas: nama_kelas, semester }); // kirim semester ke frontend
    } catch (err) {
        console.error('Error getCatanWaliKelas:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data catatan' });
    }
};

exports.updateCatatanWaliKelas = async (req, res) => {
    try {
        const { siswa_id } = req.params;
        const { catatan_pts = '', catatan_pas = '', naik_tingkat = 'tidak' } = req.body;

        if (!['ya', 'tidak'].includes(naik_tingkat)) {
            return res.status(400).json({ message: 'naik_tingkat harus "ya" atau "tidak"' });
        }

        const userId = req.user.id;
        const guruKelas = await catatanWaliKelasModel.getGuruKelasAktif(userId);
        if (!guruKelas) return res.status(404).json({ success: false, message: 'Kelas aktif tidak ditemukan.' });

        const { kelas_id, id_tahun_ajaran, semester } = guruKelas;

        // ✅ Simpan dengan semester aktif
        await catatanWaliKelasModel.upsertCatatan(
            siswa_id,
            kelas_id,
            id_tahun_ajaran,
            semester, // ← tambahkan ini
            catatan_pts,
            catatan_pas,
            naik_tingkat
        );
        res.json({ success: true, message: 'Catatan wali kelas berhasil diperbarui' });

    } catch (err) {
        console.error('Error updateCatatanWaliKelas:', err);
        res.status(500).json({ success: false, message: 'Gagal memperbarui catatan' });
    }
};

// === EKSTRAKURIKULER ===

exports.getEkskulSiswa = async (req, res) => {
    try {
        const userId = req.user.id;
        const guruKelas = await ekstrakurikulerModel.getGuruKelasAktif(userId);
        if (!guruKelas) return res.status(404).json({ success: false, message: 'Kelas aktif tidak ditemukan.' });

        const { kelas_id, id_tahun_ajaran, nama_kelas, tahun_ajaran } = guruKelas;
        const siswaList = await ekstrakurikulerModel.getSiswaInKelas(kelas_id, id_tahun_ajaran);

        const data = [];
        for (const siswa of siswaList) {
            const ekskul = await ekstrakurikulerModel.getEkskulSiswa(siswa.id_siswa, id_tahun_ajaran, 'Ganjil'); // atau ambil dari ta.semester
            data.push({
                id: siswa.id_siswa,
                nama: siswa.nama,
                nis: siswa.nis,
                nisn: siswa.nisn,
                ekskul: ekskul.map(e => ({ id: e.id_ekskul, nama: e.nama_ekskul, deskripsi: e.deskripsi })),
                jumlah_ekskul: ekskul.length
            });
        }

        const daftar_ekskul = await ekstrakurikulerModel.getDaftarEkskulAktif(id_tahun_ajaran);

        res.json({
            success: true,
            data,
            daftar_ekskul,
            kelas: nama_kelas,
            tahun_ajaran
        });

    } catch (err) {
        console.error('Error getEkskulSiswa:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data ekstrakurikuler' });
    }
};

exports.updateEkskulSiswa = async (req, res) => {
    try {
        const { siswaId } = req.params;
        const { ekskulList } = req.body;

        if (!Array.isArray(ekskulList) || ekskulList.length > 3) {
            return res.status(400).json({ message: 'ekskulList harus berupa array, maksimal 3 item' });
        }

        const userId = req.user.id;
        const guruKelas = await ekstrakurikulerModel.getGuruKelasAktif(userId);
        if (!guruKelas) return res.status(404).json({ success: false, message: 'Kelas aktif tidak ditemukan.' });

        const valid = await ekstrakurikulerModel.isSiswaInKelas(siswaId, guruKelas.kelas_id, guruKelas.id_tahun_ajaran);
        if (!valid) return res.status(403).json({ message: 'Siswa tidak terdaftar di kelas Anda' });

        // Pastikan simpan dengan semester aktif
        const [ta] = await db.execute(`SELECT semester FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1`);
        const semester = ta[0]?.semester || 'Ganjil';

        await ekstrakurikulerModel.savePesertaEkskul(siswaId, guruKelas.id_tahun_ajaran, ekskulList);
        res.json({ success: true, message: 'Ekstrakurikuler berhasil diperbarui' });

    } catch (err) {
        console.error('Error updateEkskulSiswa:', err);
        res.status(500).json({ success: false, message: 'Gagal memperbarui ekstrakurikuler' });
    }
};

// === KOKURIKULER ===

exports.getKokurikuler = async (req, res) => {
    try {
        const userId = req.user.id;
        const { jenis_penilaian } = req.params; // 'pts' atau 'pas'

        if (!['pts', 'pas'].includes(jenis_penilaian)) {
            return res.status(400).json({ message: 'jenis_penilaian harus "pts" atau "pas"' });
        }

        const [guruKelasRows] = await db.execute(`
            SELECT gk.kelas_id, ta.id_tahun_ajaran, ta.semester, k.nama_kelas
            FROM guru_kelas gk
            JOIN tahun_ajaran ta ON gk.tahun_ajaran_id = ta.id_tahun_ajaran
            JOIN kelas k ON gk.kelas_id = k.id_kelas
            WHERE gk.user_id = ? AND ta.status = 'aktif'
        `, [userId]);

        if (guruKelasRows.length === 0) {
            return res.status(403).json({ success: false, message: 'Anda tidak memiliki kelas aktif' });
        }

        const { kelas_id, id_tahun_ajaran, semester, nama_kelas } = guruKelasRows[0];

        const [siswaRows] = await db.execute(`
            SELECT id_siswa, nama_lengkap AS nama, nis, nisn
            FROM siswa s
            JOIN siswa_kelas sk ON s.id_siswa = sk.siswa_id
            WHERE sk.kelas_id = ? AND sk.tahun_ajaran_id = ?
            ORDER BY nama_lengkap
        `, [kelas_id, id_tahun_ajaran]);

        const data = [];
        for (const siswa of siswaRows) {
            const [kokulRows] = await kokurikulerModel.getBySiswaAndTahunAjaran(
                siswa.id_siswa,
                id_tahun_ajaran,
                semester
            );

            const k = kokulRows[0] || {};
            let kokurikulerData = {};

            if (jenis_penilaian === 'pts') {
                kokurikulerData = {
                    mutabaah: k.mutabaah || '',
                    mutabaah_nilai_angka: k.mutabaah_nilai_angka || null,
                    mutabaah_grade: k.mutabaah_grade || null
                };
            } else { // pas
                kokurikulerData = {
                    mutabaah: k.mutabaah || '',
                    bpi: k.bpi || '',
                    literasi: k.literasi || '',
                    judul_proyek: k.judul_proyek || '',
                    deskripsi_proyek: k.deskripsi_proyek || ''
                };
            }

            data.push({
                id: siswa.id_siswa,
                nama: siswa.nama,
                nis: siswa.nis,
                nisn: siswa.nisn,
                kokurikuler: kokurikulerData
            });
        }

        res.json({
            success: true,
            data,
            kelas: nama_kelas,
            semester,
            jenis_penilaian,
            tahun_ajaran_id: id_tahun_ajaran
        });

    } catch (err) {
        console.error('Error getKokurikuler:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data kokurikuler' });
    }
};

exports.updateKokurikuler = async (req, res) => {
    try {
        const { siswaId, jenis_penilaian } = req.params;
        const body = req.body;

        if (!['pts', 'pas'].includes(jenis_penilaian)) {
            return res.status(400).json({ message: 'jenis_penilaian harus "pts" atau "pas"' });
        }

        const [taRows] = await db.execute(`SELECT id_tahun_ajaran, semester FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1`);
        if (taRows.length === 0) {
            return res.status(500).json({ message: 'Tahun ajaran aktif belum diatur' });
        }

        const { id_tahun_ajaran, semester } = taRows[0];

        const [guruKelasRows] = await db.execute(`SELECT kelas_id FROM guru_kelas WHERE user_id = ? AND tahun_ajaran_id = ?`, [req.user.id, id_tahun_ajaran]);
        if (guruKelasRows.length === 0) {
            return res.status(403).json({ message: 'Anda tidak memiliki kelas pada tahun ajaran ini' });
        }

        const { kelas_id } = guruKelasRows[0];

        const [valid] = await db.execute(`
            SELECT 1 FROM siswa_kelas 
            WHERE siswa_id = ? AND kelas_id = ? AND tahun_ajaran_id = ?
        `, [siswaId, kelas_id, id_tahun_ajaran]);

        if (valid.length === 0) {
            return res.status(403).json({ message: 'Siswa tidak terdaftar di kelas Anda' });
        }

        let saveData = {};
        if (jenis_penilaian === 'pts') {
            // Validasi nilai & grade
            const { mutabaah, mutabaah_nilai_angka, mutabaah_grade } = body;
            if (typeof mutabaah_nilai_angka !== 'number' || mutabaah_nilai_angka < 0 || mutabaah_nilai_angka > 100) {
                return res.status(400).json({ message: 'Nilai angka harus bilangan bulat 0–100' });
            }
            if (!['A', 'B', 'C', 'D'].includes(mutabaah_grade)) {
                return res.status(400).json({ message: 'Grade harus A, B, C, atau D' });
            }

            saveData = {
                mutabaah: (mutabaah || '').trim(),
                mutabaah_nilai_angka,
                mutabaah_grade,
                // Kolom lain tetap kosong untuk PTS
                bpi: '', literasi: '', judul_proyek: '', deskripsi_proyek: ''
            };
        } else { // pas
            const { mutabaah, bpi, literasi, judul_proyek, deskripsi_proyek } = body;
            saveData = {
                mutabaah: (mutabaah || '').trim(),
                bpi: (bpi || '').trim(),
                literasi: (literasi || '').trim(),
                judul_proyek: (judul_proyek || '').trim(),
                deskripsi_proyek: (deskripsi_proyek || '').trim(),
                // Nilai & grade di PAS = null
                mutabaah_nilai_angka: null,
                mutabaah_grade: null
            };
        }

        await kokurikulerModel.save(siswaId, id_tahun_ajaran, semester, saveData);

        res.json({ success: true, message: 'Data kokurikuler berhasil disimpan' });

    } catch (err) {
        console.error('Error updateKokurikuler:', err);
        res.status(500).json({ success: false, message: 'Gagal menyimpan data kokurikuler' });
    }
};

// === UPLOAD FOTO PROFIL ===
exports.uploadFotoProfil = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'File foto diperlukan' });
        }

        const userId = req.user.id; // Dari JWT middleware
        const fotoPath = `/uploads/${req.file.filename}`;

        // Gunakan guruModel.updateFoto (sudah ada di guruModel)
        const success = await guruModel.updateFoto(userId, fotoPath);
        if (!success) {
            return res.status(404).json({ message: 'Guru tidak ditemukan di database' });
        }

        res.json({
            success: true,
            message: 'Foto profil berhasil diupload',
            fotoPath
        });

    } catch (err) {
        console.error('Error upload foto profil guru kelas:', err);
        res.status(500).json({ message: 'Gagal mengupload foto profil' });
    }
};