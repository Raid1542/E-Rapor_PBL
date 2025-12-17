const db = require('../config/db');
const bcrypt = require('bcrypt');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const absensiModel = require('../models/absensiModel');
const catatanWaliKelasModel = require('../models/catatanWaliKelasModel');
const ekstrakurikulerModel = require('../models/ekstrakurikulerModel');
const kokurikulerModel = require('../models/kokurikulerModel');
const guruModel = require('../models/guruModel');
const nilaiModel = require('../models/nilaiModel');
const konfigurasiNilaiModel = require('../models/konfigurasiNilaiModel');
const bobotPenilaianModel = require('../models/bobotPenilaianModel');
const komponenPenilaianModel = require('../models/komponenPenilaianModel');

// === KELAS & SISWA ===

exports.getKelasSaya = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) return res.status(400).json({ message: 'User ID tidak ditemukan' });

        const query = `
        SELECT 
            k.nama_kelas,
            COUNT(sk.siswa_id) AS jumlah_siswa,
            ta.tahun_ajaran,
            ta.semester
        FROM user u
        INNER JOIN guru g ON u.id_user = g.user_id
        INNER JOIN guru_kelas gk ON g.user_id = gk.user_id  
        INNER JOIN kelas k ON gk.kelas_id = k.id_kelas
        INNER JOIN tahun_ajaran ta ON gk.tahun_ajaran_id = ta.id_tahun_ajaran
        LEFT JOIN siswa_kelas sk ON k.id_kelas = sk.kelas_id 
            AND sk.tahun_ajaran_id = ta.id_tahun_ajaran
        WHERE u.id_user = ? AND ta.status = 'aktif'
        GROUP BY k.id_kelas, ta.id_tahun_ajaran, ta.semester
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
            tahun_ajaran: row.tahun_ajaran,
            semester: row.semester
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

        await db.execute(`UPDATE user SET nama_lengkap = ?, email_sekolah = ? WHERE id_user = ?`, [nama_lengkap, email_sekolah, userId]);
        await db.execute(`UPDATE guru SET niy = ?, nuptk = ?, jenis_kelamin = ?, no_telepon = ?, alamat = ? WHERE user_id = ?`, [niy, nuptk, jenis_kelamin, no_telepon, alamat, userId]);

        const [userRows] = await db.execute(`SELECT id_user, nama_lengkap, email_sekolah FROM user WHERE id_user = ?`, [userId]);
        const [guruRows] = await db.execute(`SELECT niy, nuptk, jenis_kelamin, no_telepon, alamat, foto_path FROM guru WHERE user_id = ?`, [userId]);

        if (userRows.length === 0 || guruRows.length === 0) {
            return res.status(404).json({ message: 'Profil tidak ditemukan' });
        }

        const user = {
            id: userRows[0].id_user,
            role: 'guru kelas',
            nama_lengkap: userRows[0].nama_lengkap,
            email_sekolah: userRows[0].email_sekolah,
            niy: guruRows[0].niy,
            nuptk: guruRows[0].nuptk,
            jenis_kelamin: guruRows[0].jenis_kelamin,
            no_telepon: guruRows[0].no_telepon,
            alamat: guruRows[0].alamat,
            profileImage: guruRows[0].foto_path || null
        };

        res.json({
            message: 'Profil berhasil diperbarui',
            user
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
        if (!guruKelas) {
            return res.status(404).json({ success: false, message: 'Kelas aktif tidak ditemukan.' });
        }

        const { kelas_id, id_tahun_ajaran, nama_kelas, semester } = guruKelas;
        const data = await catatanWaliKelasModel.getCatatanByKelas(kelas_id, id_tahun_ajaran, semester);

        res.json({
            success: true,
            data,
            kelas: nama_kelas,
            semester
        });

    } catch (err) {
        console.error('Error getCatanWaliKelas:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data catatan' });
    }
};

exports.updateCatatanWaliKelas = async (req, res) => {
    try {
        const { siswa_id } = req.params;
        const { catatan_wali_kelas = '', naik_tingkat } = req.body;

        const userId = req.user.id;
        const guruKelas = await catatanWaliKelasModel.getGuruKelasAktif(userId);
        if (!guruKelas) {
            return res.status(404).json({ success: false, message: 'Kelas aktif tidak ditemukan.' });
        }

        const { kelas_id, id_tahun_ajaran, semester } = guruKelas;

        let naikTingkatValue = null;
        if (semester === 'Genap') {
            if (naik_tingkat !== 'ya' && naik_tingkat !== 'tidak') {
                return res.status(400).json({
                    message: 'Di semester Genap, keputusan naik tingkat wajib diisi (ya/tidak).'
                });
            }
            naikTingkatValue = naik_tingkat;
        }

        await catatanWaliKelasModel.upsertCatatan(
            siswa_id,
            kelas_id,
            id_tahun_ajaran,
            semester,
            catatan_wali_kelas,
            naikTingkatValue
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

        const { kelas_id, id_tahun_ajaran, nama_kelas, tahun_ajaran, semester } = guruKelas;
        const siswaList = await ekstrakurikulerModel.getSiswaInKelas(kelas_id, id_tahun_ajaran);

        const data = [];
        for (const siswa of siswaList) {
            const ekskul = await ekstrakurikulerModel.getEkskulSiswa(siswa.id_siswa, id_tahun_ajaran, semester);
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

        await ekstrakurikulerModel.savePesertaEkskul(siswaId, guruKelas.id_tahun_ajaran, ekskulList);
        res.json({ success: true, message: 'Ekstrakurikuler berhasil diperbarui' });

    } catch (err) {
        console.error('Error updateEkskulSiswa:', err);
        res.status(500).json({ success: false, message: 'Gagal memperbarui ekstrakurikuler' });
    }
};

// === KOKURIKULER ===

// Helper: proses nilai → grade & deskripsi
const processNilaiKokurikuler = async (nilai) => {
    if (nilai == null || nilai === '') {
        return { nilai: null, grade: null, deskripsi: null };
    }
    const numNilai = Number(nilai);
    if (isNaN(numNilai) || numNilai < 0 || numNilai > 100) {
        return { nilai: null, grade: null, deskripsi: null };
    }
    const result = await konfigurasiNilaiModel.getGradeDeskripsiByNilai(numNilai, 'kokurikuler');
    return {
        nilai: numNilai,
        grade: result.grade,
        deskripsi: result.deskripsi
    };
};

exports.getKokurikuler = async (req, res) => {
    try {
        const userId = req.user.id;

        // Ambil data kelas aktif guru
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

        // Ambil daftar siswa di kelas tersebut
        const [siswaRows] = await db.execute(`
            SELECT id_siswa, nama_lengkap AS nama, nis, nisn
            FROM siswa s
            JOIN siswa_kelas sk ON s.id_siswa = sk.siswa_id
            WHERE sk.kelas_id = ? AND sk.tahun_ajaran_id = ?
            ORDER BY nama_lengkap
        `, [kelas_id, id_tahun_ajaran]);

        // Ambil nilai kokurikuler yang sudah ada
        const [kokurikulerRows] = await db.execute(`
        SELECT 
            siswa_id,
            mutabaah_nilai, bpi_nilai, literasi_nilai,
            judul_proyek_nilai, nama_judul_proyek,
            mutabaah_grade, bpi_grade, literasi_grade,
            judul_proyek_grade,
            mutabaah_deskripsi, bpi_deskripsi, literasi_deskripsi,
            judul_proyek_deskripsi
            FROM nilai_kokurikuler
            WHERE kelas_id = ? AND tahun_ajaran_id = ? AND semester = ?
        `, [kelas_id, id_tahun_ajaran, semester]);

        const nilaiMap = {};
        for (const row of kokurikulerRows) {
            nilaiMap[row.siswa_id] = {
                mutabaah_nilai: row.mutabaah_nilai,
                bpi_nilai: row.bpi_nilai,
                literasi_nilai: row.literasi_nilai,
                judul_proyek_nilai: row.judul_proyek_nilai,
                nama_judul_proyek: row.nama_judul_proyek
            };
        }

        // Proses setiap siswa dengan nilai async
        const data = await Promise.all(siswaRows.map(async (siswa) => {
            const nilai = nilaiMap[siswa.id_siswa] || {};

            const [mutabaah, bpi, literasi, judulProyek] = await Promise.all([
                processNilaiKokurikuler(nilai.mutabaah_nilai),
                processNilaiKokurikuler(nilai.bpi_nilai),
                processNilaiKokurikuler(nilai.literasi_nilai),
                processNilaiKokurikuler(nilai.judul_proyek_nilai)
            ]);

            return {
                id: siswa.id_siswa,
                nama: siswa.nama,
                nis: siswa.nis,
                nisn: siswa.nisn,
                kokurikuler: {
                    mutabaah_nilai: mutabaah.nilai,
                    mutabaah_grade: mutabaah.grade,
                    mutabaah_deskripsi: mutabaah.deskripsi,

                    bpi_nilai: bpi.nilai,
                    bpi_grade: bpi.grade,
                    bpi_deskripsi: bpi.deskripsi,

                    literasi_nilai: literasi.nilai,
                    literasi_grade: literasi.grade,
                    literasi_deskripsi: literasi.deskripsi,

                    judul_proyek_nilai: judulProyek.nilai,
                    judul_proyek_grade: judulProyek.grade,
                    judul_proyek_deskripsi: judulProyek.deskripsi,
                    nama_judul_proyek: nilai.nama_judul_proyek
                }
            };
        }));

        res.json({
            success: true,
            data,
            kelas: nama_kelas,
            semester,
            tahun_ajaran_id: id_tahun_ajaran
        });

    } catch (err) {
        console.error('Error getKokurikuler:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data kokurikuler' });
    }
};

exports.updateKokurikuler = async (req, res) => {
    try {
        const { siswaId } = req.params;
        const {
            mutabaah_nilai,
            bpi_nilai,
            literasi_nilai,
            judul_proyek_nilai,
            nama_judul_proyek
        } = req.body;

        // Validasi input: hanya angka 0–100 atau null
        const nilaiList = [mutabaah_nilai, bpi_nilai, literasi_nilai, judul_proyek_nilai];
        for (const nilai of nilaiList) {
            if (nilai !== null && nilai !== undefined) {
                const num = Number(nilai);
                if (isNaN(num) || num < 0 || num > 100) {
                    return res.status(400).json({
                        success: false,
                        message: 'Nilai harus angka antara 0–100, atau null jika belum diisi'
                    });
                }
            }
        }

        // Ambil kelas aktif guru
        const [guruKelasRows] = await db.execute(`
            SELECT gk.kelas_id, ta.id_tahun_ajaran, ta.semester
            FROM guru_kelas gk
            JOIN tahun_ajaran ta ON gk.tahun_ajaran_id = ta.id_tahun_ajaran
            WHERE gk.user_id = ? AND ta.status = 'aktif'
        `, [req.user.id]);

        if (guruKelasRows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Anda tidak memiliki kelas aktif'
            });
        }

        const { kelas_id, id_tahun_ajaran, semester } = guruKelasRows[0];

        // Validasi: apakah siswa ini di kelas guru?
        const [valid] = await db.execute(`
            SELECT 1 FROM siswa_kelas 
            WHERE siswa_id = ? AND kelas_id = ? AND tahun_ajaran_id = ?
        `, [siswaId, kelas_id, id_tahun_ajaran]);

        if (valid.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Siswa tidak terdaftar di kelas Anda'
            });
        }

        // Proses semua nilai → dapatkan grade & deskripsi
        const mutabaah = await processNilaiKokurikuler(mutabaah_nilai);
        const bpi = await processNilaiKokurikuler(bpi_nilai);
        const literasi = await processNilaiKokurikuler(literasi_nilai);
        const judulProyek = await processNilaiKokurikuler(judul_proyek_nilai);

        // Simpan ke database (INSERT ... ON DUPLICATE KEY UPDATE)
        await db.execute(`
            INSERT INTO nilai_kokurikuler 
            (siswa_id, kelas_id, tahun_ajaran_id, semester,
                mutabaah_nilai, mutabaah_grade, mutabaah_deskripsi,
                bpi_nilai, bpi_grade, bpi_deskripsi,
                literasi_nilai, literasi_grade, literasi_deskripsi,
                judul_proyek_nilai, judul_proyek_grade, judul_proyek_deskripsi, nama_judul_proyek)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                mutabaah_nilai = VALUES(mutabaah_nilai),
                mutabaah_grade = VALUES(mutabaah_grade),
                mutabaah_deskripsi = VALUES(mutabaah_deskripsi),
                bpi_nilai = VALUES(bpi_nilai),
                bpi_grade = VALUES(bpi_grade),
                bpi_deskripsi = VALUES(bpi_deskripsi),
                literasi_nilai = VALUES(literasi_nilai),
                literasi_grade = VALUES(literasi_grade),
                literasi_deskripsi = VALUES(literasi_deskripsi),
                judul_proyek_nilai = VALUES(judul_proyek_nilai),
                judul_proyek_grade = VALUES(judul_proyek_grade),
                judul_proyek_deskripsi = VALUES(judul_proyek_deskripsi),
                nama_judul_proyek = VALUES(nama_judul_proyek),
                updated_at = NOW()
        `, [
            siswaId, kelas_id, id_tahun_ajaran, semester,
            mutabaah.nilai, mutabaah.grade, mutabaah.deskripsi,
            bpi.nilai, bpi.grade, bpi.deskripsi,
            literasi.nilai, literasi.grade, literasi.deskripsi,
            judulProyek.nilai, judulProyek.grade, judulProyek.deskripsi, nama_judul_proyek
        ]);

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

        const userId = req.user.id;
        const fotoPath = `/uploads/${req.file.filename}`;

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

// === NILAI ===

exports.getMapelForGuruKelas = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.execute(`
            SELECT 
                mp.id_mata_pelajaran,
                mp.nama_mapel,
                mp.jenis,
                p.user_id AS pengajar_id,
                CASE 
                    WHEN p.user_id = ? THEN TRUE 
                    ELSE FALSE 
                END AS bisa_input
            FROM pembelajaran p
            JOIN mata_pelajaran mp ON p.mata_pelajaran_id = mp.id_mata_pelajaran
            JOIN guru_kelas gk ON p.kelas_id = gk.kelas_id
            WHERE gk.user_id = ?
                AND p.tahun_ajaran_id = (SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
            ORDER BY mp.jenis, mp.nama_mapel
        `, [userId, userId]);

        const wajib = rows.filter(r => r.jenis === 'wajib');
        const pilihan = rows.filter(r => r.jenis === 'pilihan');

        res.json({
            success: true,
            wajib: rows.filter(r => r.jenis === 'wajib').map(r => ({
                mata_pelajaran_id: r.id_mata_pelajaran, // ← petakan ke nama yang diharapkan frontend
                nama_mapel: r.nama_mata_pelajaran || r.nama_mapel,
                jenis: r.jenis,
                bisa_input: Boolean(r.bisa_input)
            })),
            pilihan: rows.filter(r => r.jenis === 'pilihan').map(r => ({
                mata_pelajaran_id: r.id_mata_pelajaran,
                nama_mapel: r.nama_mata_pelajaran || r.nama_mapel,
                jenis: r.jenis,
                bisa_input: Boolean(r.bisa_input)
            }))
        });

    } catch (err) {
        console.error('Error getMapelForGuruKelas:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil daftar mata pelajaran' });
    }
};

exports.getNilaiByMapel = async (req, res) => {
    console.log('🔵 Mulai getNilaiByMapel, mapelId:', req.params.mapelId);

    try {
        const { mapelId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Tidak terautentikasi' });
        }

        // Ambil kelas guru
        const [kelasRow] = await db.execute(`
      SELECT kelas_id, tahun_ajaran_id 
      FROM guru_kelas 
      WHERE user_id = ? AND tahun_ajaran_id = (
        SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
      )
    `, [userId]);

        if (kelasRow.length === 0) {
            console.log('❌ Kelas tidak ditemukan untuk user:', userId);
            return res.status(403).json({ message: 'Anda tidak memiliki kelas aktif' });
        }

        const { kelas_id, tahun_ajaran_id } = kelasRow[0];
        console.log('✅ Kelas ditemukan:', kelas_id, 'Tahun Ajaran:', tahun_ajaran_id);

        // Ambil nama kelas
        const [namaKelasRow] = await db.execute(`
            SELECT nama_kelas FROM kelas WHERE id_kelas = ?
        `, [kelas_id]);

        const kelasNama = namaKelasRow[0]?.nama_kelas || 'Kelas Tidak Diketahui';

        // Ambil siswa di kelas ini
        const [siswaRows] = await db.execute(`
        SELECT id_siswa, nis, nisn, nama_lengkap 
        FROM siswa 
        WHERE id_siswa IN (
        SELECT siswa_id FROM siswa_kelas 
        WHERE kelas_id = ? AND tahun_ajaran_id = ?
        )
        ORDER BY nama_lengkap
    `, [kelas_id, tahun_ajaran_id]);

        console.log('✅ Siswa ditemukan:', siswaRows.length);

        // Ambil nilai detail untuk mapel ini
        const [nilaiRows] = await db.execute(`
        SELECT siswa_id, komponen_id, nilai 
        FROM nilai_detail 
        WHERE mapel_id = ? AND tahun_ajaran_id = ?
    `, [mapelId, tahun_ajaran_id]);

        console.log('✅ Nilai ditemukan:', nilaiRows.length);

        // Ambil komponen
        const [komponenRows] = await db.execute(`
        SELECT id_komponen, nama_komponen 
        FROM komponen_penilaian 
        ORDER BY urutan
    `);

        console.log('✅ Komponen ditemukan:', komponenRows.length);

        // Gabungkan data di JavaScript
        const nilaiMap = {};
        nilaiRows.forEach(n => {
            if (!nilaiMap[n.siswa_id]) nilaiMap[n.siswa_id] = {};
            nilaiMap[n.siswa_id][n.komponen_id] = n.nilai;
        });

        const siswaList = siswaRows.map(s => {
            const nilai = nilaiMap[s.id_siswa] || {};
            const nilaiArray = Object.values(nilai).filter(v => v !== null && v !== undefined);
            const nilaiRapor = nilaiArray.length > 0
                ? nilaiArray.reduce((a, b) => a + b, 0) / nilaiArray.length
                : 0;

            return {
                id: s.id_siswa,
                nama: s.nama_lengkap,
                nis: s.nis,
                nisn: s.nisn,
                nilai_rapor: parseFloat(nilaiRapor.toFixed(2)),
                nilai
            };
        });

        // Hitung ranking
        siswaList.sort((a, b) => b.nilai_rapor - a.nilai_rapor);
        siswaList.forEach((s, i) => s.ranking = i + 1);

        console.log('✅ Selesai getNilaiByMapel, mengembalikan:', siswaList.length, 'siswa');

        res.json({
            success: true,
            siswaList,
            komponen: komponenRows,
            kelas: kelasNama
        });

    } catch (err) {
        console.error(' Error getNilaiByMapel:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data nilai' });
    }
};

// Fungsi simpanNilai (perbaikan)
exports.simpanNilai = async (req, res) => {
    console.log('[simpanNilai] — MASUK FUNGSI');

    const { siswa_id, mapel_id, komponen_id, nilai } = req.body;
    const user_id = req.user.id;

    try {
        console.log('[simpanNilai] Request Body:', req.body);
        console.log('[simpanNilai] User ID:', user_id);

        // Validasi input dasar
        if (!siswa_id || !mapel_id || !komponen_id || nilai === undefined) {
            console.log('[simpanNilai] Validasi gagal: field kosong');
            return res.status(400).json({
                success: false,
                message: 'Semua field wajib diisi'
            });
        }

        if (nilai < 0 || nilai > 100) {
            console.log('[simpanNilai] Nilai tidak valid:', nilai);
            return res.status(400).json({
                success: false,
                message: 'Nilai harus antara 0 dan 100'
            });
        }

        // Ambil kelas_id dan tahun_ajaran_id
        let kelas_id = req.user.kelas_id;
        let tahun_ajaran_id = req.user.tahun_ajaran_id;

        if (!kelas_id || !tahun_ajaran_id) {
            console.log('[simpanNilai] Mencari kelas_id dan tahun_ajaran_id dari pembelajaran...');
            const [pembelajaran] = await db.query(
                'SELECT kelas_id, tahun_ajaran_id FROM pembelajaran WHERE user_id = ? AND mata_pelajaran_id = ?',
                [user_id, mapel_id]
            );

            if (!pembelajaran[0]) {
                console.log('[simpanNilai] Tidak ditemukan pembelajaran untuk user:', user_id, 'dan mapel:', mapel_id);
                return res.status(403).json({
                    success: false,
                    message: 'Anda tidak mengajar mapel ini'
                });
            }

            kelas_id = pembelajaran[0].kelas_id;
            tahun_ajaran_id = pembelajaran[0].tahun_ajaran_id;
            console.log('[simpanNilai] Ditemukan kelas_id:', kelas_id, 'tahun_ajaran_id:', tahun_ajaran_id);
        }

        // Simpan nilai — BUNGKUS SEMUA DALAM TRY-CATCH UNTUK AMAN
        try {
            console.log('[simpanNilai] Memanggil nilaiModel.simpanNilaiDetail...');
            const saved = await nilaiModel.simpanNilaiDetail({
                siswa_id,
                mapel_id,
                komponen_id,
                nilai,
                kelas_id,
                tahun_ajaran_id,
                user_id
            });

            console.log('[simpanNilai] Nilai berhasil disimpan:', saved);
            return res.status(200).json({
                success: true,
                message: 'Nilai berhasil disimpan',
                data: saved
            });

        } catch (modelError) {
            console.error('[simpanNilai] Error di model:', modelError.message || modelError);
            return res.status(500).json({
                success: false,
                message: 'Gagal menyimpan nilai di model: ' + (modelError.message || modelError)
            });
        }

    } catch (controllerError) {
        console.error('[simpanNilai] Error di controller:', controllerError.message || controllerError);
        return res.status(500).json({
            success: false,
            message: 'Gagal menyimpan nilai: ' + (controllerError.message || controllerError)
        });
    }
};

exports.eksporNilaiExcel = async (req, res) => {
    try {
        const { mapelId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Tidak terautentikasi' });
        }

        // 1. Validasi akses: apakah guru ini berhak mengakses mapel ini?
        const [kelasRow] = await db.execute(`
      SELECT kelas_id, tahun_ajaran_id 
      FROM guru_kelas 
      WHERE user_id = ? 
        AND tahun_ajaran_id = (SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
    `, [userId]);

        if (kelasRow.length === 0) {
            return res.status(403).json({ message: 'Anda tidak memiliki kelas aktif' });
        }

        const { kelas_id, tahun_ajaran_id } = kelasRow[0];

        // Cek akses (opsional, tapi aman)
        const hasAccess = await nilaiModel.canUserInputNilai(userId, mapelId, kelas_id, tahun_ajaran_id);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Akses ditolak untuk mata pelajaran ini' });
        }

        // 2. Ambil data mapel (untuk nama file)
        const [mapelRows] = await db.execute(`
      SELECT nama_mata_pelajaran FROM mata_pelajaran WHERE id_mata_pelajaran = ?
    `, [mapelId]);
        if (mapelRows.length === 0) {
            return res.status(404).json({ message: 'Mata pelajaran tidak ditemukan' });
        }
        const namaMapel = mapelRows[0].nama_mata_pelajaran;

        // 3. Ambil data nilai (gunakan fungsi yang sudah ada di nilaiModel)
        const nilaiData = await nilaiModel.getNilaiByKelasMapel(kelas_id, mapelId, tahun_ajaran_id);

        // 4. Ambil daftar komponen
        const [komponenRows] = await db.execute(`
      SELECT id_komponen, nama_komponen 
      FROM komponen_penilaian 
      ORDER BY urutan
    `);

        // 5. Reformat data untuk Excel
        const siswaMap = {};
        nilaiData.forEach(item => {
            if (!siswaMap[item.id_siswa]) {
                siswaMap[item.id_siswa] = {
                    id_siswa: item.id_siswa,
                    nama: item.nama_lengkap,
                    nis: item.nis,
                    nisn: item.nisn,
                    nilai_rapor: item.nilai_rapor || 0
                };
            }
            if (item.komponen_id) {
                siswaMap[item.id_siswa][`nilai_${item.komponen_id}`] = item.nilai;
            }
        });

        // Urutkan berdasarkan nilai_rapor (descending) untuk ranking
        const siswaList = Object.values(siswaMap).sort((a, b) => b.nilai_rapor - a.nilai_rapor);

        // Tambahkan ranking
        siswaList.forEach((siswa, index) => {
            siswa.ranking = index + 1;
        });

        // 6. Bangun header Excel
        const headers = ['No', 'Nama Siswa', 'NIS', 'NISN'];
        const komponenHeaders = komponenRows.map(k => k.nama_komponen);
        const finalHeaders = [...headers, ...komponenHeaders, 'Nilai Rapor', 'Ranking'];

        // 7. Bangun rows data
        const rows = siswaList.map((siswa, index) => {
            const rowData = [
                index + 1,
                siswa.nama,
                siswa.nis,
                siswa.nisn || ''
            ];

            // Tambahkan nilai per komponen
            komponenRows.forEach(komp => {
                const nilai = siswa[`nilai_${komp.id_komponen}`];
                rowData.push(nilai !== undefined && nilai !== null ? nilai : '-');
            });

            // Tambahkan nilai rapor & ranking
            rowData.push(siswa.nilai_rapor.toFixed(2));
            rowData.push(siswa.ranking);

            return rowData;
        });

        // 8. Buat worksheet & workbook
        const worksheet = XLSX.utils.aoa_to_sheet([finalHeaders, ...rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Nilai');

        // 9. Generate buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // 10. Kirim sebagai file download
        const fileName = `Rekap_Nilai_${namaMapel.replace(/[^a-z0-9]/gi, '_')}.xlsx`;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);


    } catch (err) {
        console.error('Error ekspor nilai ke Excel:', err);
        res.status(500).json({ message: 'Gagal mengekspor data ke Excel' });
    }
};

// =============== ATUR PENILAIAN ===============

/**
 * Ambil semua kategori nilai
 */
exports.getKategoriNilai = async (req, res) => {
    try {
        const kategori = req.query.kategori || 'umum';
        const data = await konfigurasiNilaiModel.getAllKategori(kategori);
        res.json({ success: true, data });
    } catch (err) {
        console.error('Error getKategoriNilai:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil kategori nilai' });
    }
};

/**
 * Tambah kategori nilai baru
 */
exports.createKategoriNilai = async (req, res) => {
    try {
        const { min_nilai, max_nilai, kategori = 'umum', grade, deskripsi } = req.body;

        // Validasi
        if (min_nilai == null || max_nilai == null || grade == null || deskripsi == null) {
            return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
        }
        if (min_nilai < 0 || max_nilai > 100 || min_nilai > max_nilai) {
            return res.status(400).json({ success: false, message: 'Range nilai tidak valid' });
        }

        const newKategori = await konfigurasiNilaiModel.createKategori({
            min_nilai: parseFloat(min_nilai),
            max_nilai: parseFloat(max_nilai),
            kategori,
            grade,
            deskripsi
        });

        res.status(201).json({ success: true, message: 'Kategori nilai berhasil ditambahkan', data: newKategori });
    } catch (err) {
        console.error('Error createKategoriNilai:', err);
        res.status(500).json({ success: false, message: 'Gagal menambah kategori nilai' });
    }
};

/**
 * Update kategori nilai
 */
exports.updateKategoriNilai = async (req, res) => {
    try {
        const { id } = req.params;
        const { min_nilai, max_nilai, kategori = 'umum', grade, deskripsi } = req.body;

        if (min_nilai == null || max_nilai == null || grade == null || deskripsi == null) {
            return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
        }
        if (min_nilai < 0 || max_nilai > 100 || min_nilai > max_nilai) {
            return res.status(400).json({ success: false, message: 'Range nilai tidak valid' });
        }

        const updated = await konfigurasiNilaiModel.updateKategori(id, {
            min_nilai: parseFloat(min_nilai),
            max_nilai: parseFloat(max_nilai),
            kategori,
            grade,
            deskripsi
        });

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
        }

        res.json({ success: true, message: 'Kategori nilai berhasil diperbarui' });
    } catch (err) {
        console.error('Error updateKategoriNilai:', err);
        res.status(500).json({ success: false, message: 'Gagal memperbarui kategori nilai' });
    }
};

/**
 * Hapus kategori nilai
 */
exports.deleteKategoriNilai = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await konfigurasiNilaiModel.deleteKategori(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan atau gagal dihapus' });
        }
        res.json({ success: true, message: 'Kategori nilai berhasil dihapus' });
    } catch (err) {
        console.error('Error deleteKategoriNilai:', err);
        res.status(500).json({ success: false, message: 'Gagal menghapus kategori nilai' });
    }
};

/**
 * Ambil bobot penilaian untuk satu mata pelajaran
 */
exports.getBobotByMapel = async (req, res) => {
    try {
        const { mapelId } = req.params;
        const bobot = await bobotPenilaianModel.getBobotByMapel(mapelId);
        res.json({ success: true, data: bobot });
    } catch (err) {
        console.error('Error getBobotByMapel:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil bobot penilaian' });
    }
};

/**
 * Update bobot penilaian untuk satu mata pelajaran
 */
exports.updateBobotByMapel = async (req, res) => {
    try {
        const { mapelId } = req.params;
        const bobotList = req.body;

        if (!Array.isArray(bobotList)) {
            return res.status(400).json({ success: false, message: 'Data bobot harus berupa array' });
        }

        // Validasi setiap item
        for (const item of bobotList) {
            if (!item.komponen_id || item.bobot == null) {
                return res.status(400).json({ success: false, message: 'Setiap bobot harus memiliki komponen_id dan nilai bobot' });
            }
            if (item.bobot < 0 || item.bobot > 100) {
                return res.status(400).json({ success: false, message: 'Bobot harus antara 0–100' });
            }
        }

        // Opsional: validasi total bobot = 100%
        const total = bobotList.reduce((sum, item) => sum + parseFloat(item.bobot), 0);
        if (Math.abs(total - 100) > 0.1) {
            return res.status(400).json({ success: false, message: 'Total bobot harus 100%' });
        }

        await bobotPenilaianModel.updateBobotByMapel(mapelId, bobotList);
        res.json({ success: true, message: 'Bobot penilaian berhasil diperbarui' });

    } catch (err) {
        console.error('Error updateBobotByMapel:', err);
        res.status(500).json({ success: false, message: 'Gagal memperbarui bobot penilaian' });
    }
};

/**
 * Ambil daftar komponen penilaian
 */
exports.getKomponenPenilaian = async (req, res) => {
    try {
        const komponen = await komponenPenilaianModel.getAllKomponen();
        res.json({ success: true, data: komponen });
    } catch (err) {
        console.error('Error getKomponenPenilaian:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil daftar komponen' });
    }
};