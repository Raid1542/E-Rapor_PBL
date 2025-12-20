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
const konfigurasiNilaiRaporModel = require('../models/konfigurasiNilaiRaporModel');
const konfigurasiNilaiKokurikulerModel = require('../models/konfigurasiNilaiKokurikuler');
const bobotPenilaianModel = require('../models/bobotPenilaianModel');
const komponenPenilaianModel = require('../models/komponenPenilaianModel');

// === HELPER: Validasi Mapel Wajib untuk Guru Kelas ===
const isMapelWajibGuruKelas = async (userId, mapelId) => {
    const [rows] = await db.execute(`
        SELECT mp.id_mata_pelajaran
        FROM mata_pelajaran mp
        JOIN pembelajaran p ON mp.id_mata_pelajaran = p.mata_pelajaran_id
        JOIN guru_kelas gk ON p.kelas_id = gk.kelas_id
        WHERE mp.id_mata_pelajaran = ?
          AND gk.user_id = ?
          AND mp.jenis = 'wajib'
          AND gk.tahun_ajaran_id = (SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
    `, [mapelId, userId]);
    return rows.length > 0;
};

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
// Helper: Hitung grade & deskripsi berdasarkan nilai dan ID aspek (number)
const getGradeFromConfig = (configList, nilai, idAspek) => {
    if (nilai === null || nilai === undefined) return { grade: null, deskripsi: null };
    const configForAspek = configList.filter(c => c.id_aspek_kokurikuler === idAspek);
    for (let conf of configForAspek) {
        if (nilai >= conf.rentang_min && nilai <= conf.rentang_max) {
            return {
                grade: conf.grade,
                deskripsi: conf.deskripsi
            };
        }
    }
    return { grade: null, deskripsi: null };
};

// Ambil data kokurikuler siswa (untuk tampilan tabel)
exports.getNilaiKokurikuler = async (req, res) => {
    try {
        const userId = req.user.id;
        const [guruKelasRows] = await db.execute(`
            SELECT 
                gk.kelas_id,
                gk.tahun_ajaran_id,
                k.nama_kelas,
                ta.semester
            FROM guru_kelas gk
            JOIN kelas k ON gk.kelas_id = k.id_kelas
            JOIN tahun_ajaran ta ON gk.tahun_ajaran_id = ta.id_tahun_ajaran
            WHERE gk.user_id = ? AND ta.status = 'aktif'
        `, [userId]);
        if (guruKelasRows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Anda belum ditetapkan sebagai wali kelas pada tahun ajaran aktif.'
            });
        }
        const { kelas_id, tahun_ajaran_id, nama_kelas, semester } = guruKelasRows[0];
        const [rawRows] = await db.execute(`
            SELECT 
                nk.id_siswa,
                nk.nilai_mutabaah,
                nk.nilai_bpi,
                nk.nilai_literasi,
                nk.nilai_proyek,
                jpt.judul AS nama_judul_proyek
            FROM nilai_kokurikuler nk
            LEFT JOIN judul_proyek_per_tahun_ajaran jpt ON nk.id_judul_proyek = jpt.id_judul_proyek
            WHERE nk.id_kelas = ? AND nk.id_tahun_ajaran = ? AND nk.semester = ?
        `, [kelas_id, tahun_ajaran_id, semester]);
        const [gradeConfig] = await db.execute(`
            SELECT 
                id_aspek_kokurikuler,
                rentang_min,
                rentang_max,
                grade,
                deskripsi
            FROM kategori_grade_kokurikuler
            ORDER BY rentang_min DESC
        `);
        const result = rawRows.map(row => {
            // ✅ PERBAIKAN: Gunakan ID aspek sesuai database Anda
            const mutabaah = getGradeFromConfig(gradeConfig, row.nilai_mutabaah, 1); // Mutabaah = 1
            const bpi = getGradeFromConfig(gradeConfig, row.nilai_bpi, 3);          // BPI = 3
            const literasi = getGradeFromConfig(gradeConfig, row.nilai_literasi, 2); // Literasi = 2
            const proyek = getGradeFromConfig(gradeConfig, row.nilai_proyek, 4);     // Proyek = 4
            return {
                siswa_id: row.id_siswa,
                mutabaah_nilai: row.nilai_mutabaah,
                bpi_nilai: row.nilai_bpi,
                literasi_nilai: row.nilai_literasi,
                judul_proyek_nilai: row.nilai_proyek,
                nama_judul_proyek: row.nama_judul_proyek || "",
                mutabaah_grade: mutabaah.grade,
                bpi_grade: bpi.grade,
                literasi_grade: literasi.grade,
                judul_proyek_grade: proyek.grade,
                mutabaah_deskripsi: mutabaah.deskripsi,
                bpi_deskripsi: bpi.deskripsi,
                literasi_deskripsi: literasi.deskripsi,
                judul_proyek_deskripsi: proyek.deskripsi
            };
        });
        const [siswaRows] = await db.execute(`
            SELECT id_siswa, nama_lengkap, nis, nisn
            FROM siswa s
            JOIN siswa_kelas sk ON s.id_siswa = sk.siswa_id
            WHERE sk.kelas_id = ? AND sk.tahun_ajaran_id = ?
            ORDER BY s.nama_lengkap
        `, [kelas_id, tahun_ajaran_id]);
        const siswaMap = new Map();
        siswaRows.forEach(s => {
            siswaMap.set(s.id_siswa, {
                id: s.id_siswa,
                nama: s.nama_lengkap,
                nis: s.nis,
                nisn: s.nisn,
                kokurikuler: {
                    mutabaah_nilai: null,
                    mutabaah_grade: null,
                    mutabaah_deskripsi: null,
                    bpi_nilai: null,
                    bpi_grade: null,
                    bpi_deskripsi: null,
                    literasi_nilai: null,
                    literasi_grade: null,
                    literasi_deskripsi: null,
                    judul_proyek_nilai: null,
                    judul_proyek_grade: null,
                    judul_proyek_deskripsi: null,
                    nama_judul_proyek: null
                }
            });
        });
        result.forEach(item => {
            if (siswaMap.has(item.siswa_id)) {
                siswaMap.get(item.siswa_id).kokurikuler = item;
            }
        });
        const finalData = Array.from(siswaMap.values());
        res.json({
            success: true,
            data: finalData,
            kelas: nama_kelas,
            kelasId: kelas_id,
            tahunAjaranId: tahun_ajaran_id,
            semester: semester
        });
    } catch (error) {
        console.error("Error getNilaiKokurikuler:", error);
        res.status(500).json({
            success: false,
            message: "Gagal mengambil data nilai kokurikuler"
        });
    }
};

// Simpan atau perbarui nilai kokurikuler
exports.updateNilaiKokurikuler = async (req, res) => {
    const { siswaId } = req.params;
    const {
        mutabaah_nilai,
        bpi_nilai,
        literasi_nilai,
        judul_proyek_nilai,
        nama_judul_proyek,
        kelasId,
        tahunAjaranId,
        semester
    } = req.body;

    try {
        // Ambil tahun ajaran aktif
        let tahunAjaranIdFinal = tahunAjaranId;
        if (!tahunAjaranIdFinal) {
            const [tahunAktif] = await db.query(`
                SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' ORDER BY created_at DESC LIMIT 1
            `);
            tahunAjaranIdFinal = tahunAktif?.id_tahun_ajaran || 1;
        }

        // Cari atau buat id_judul_proyek berdasarkan teks
        let id_judul_proyek = null;
        if (nama_judul_proyek && typeof nama_judul_proyek === 'string' && nama_judul_proyek.trim() !== '') {
            const judulBersih = nama_judul_proyek.trim();
            const [existing] = await db.query(`
                SELECT id_judul_proyek FROM judul_proyek_per_tahun_ajaran 
                WHERE id_tahun_ajaran = ? AND judul = ?
            `, [tahunAjaranIdFinal, judulBersih]);

            if (existing.length > 0) {
                id_judul_proyek = existing[0].id_judul_proyek;
            } else {
                const [newRow] = await db.query(`
                    INSERT INTO judul_proyek_per_tahun_ajaran (
                        id_tahun_ajaran, judul, deskripsi, created_at, updated_at
                    ) VALUES (?, ?, ?, NOW(), NOW())
                `, [tahunAjaranIdFinal, judulBersih, 'Deskripsi proyek otomatis']);
                id_judul_proyek = newRow.insertId;
            }
        }

        // Cek apakah sudah ada data
        const [existing] = await db.query(`
            SELECT id_nilai_kokurikuler FROM nilai_kokurikuler 
            WHERE id_siswa = ? AND id_kelas = ? AND id_tahun_ajaran = ? AND semester = ?
        `, [siswaId, kelasId, tahunAjaranIdFinal, semester]);

        if (existing.length === 0) {
            // INSERT baru
            await db.query(`
                INSERT INTO nilai_kokurikuler (
                    id_siswa, id_kelas, id_tahun_ajaran, semester,
                    nilai_bpi, nilai_literasi, nilai_mutabaah, nilai_proyek,
                    id_judul_proyek, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                siswaId,
                kelasId,
                tahunAjaranIdFinal,
                semester,
                bpi_nilai || 0,
                literasi_nilai || 0,
                mutabaah_nilai || 0,
                judul_proyek_nilai || 0,
                id_judul_proyek
            ]);
        } else {
            // UPDATE existing
            await db.query(`
                UPDATE nilai_kokurikuler SET
                    nilai_bpi = ?,
                    nilai_literasi = ?,
                    nilai_mutabaah = ?,
                    nilai_proyek = ?,
                    id_judul_proyek = ?,
                    updated_at = NOW()
                WHERE id_siswa = ? AND id_kelas = ? AND id_tahun_ajaran = ? AND semester = ?
            `, [
                bpi_nilai || 0,
                literasi_nilai || 0,
                mutabaah_nilai || 0,
                judul_proyek_nilai || 0,
                id_judul_proyek,
                siswaId,
                kelasId,
                tahunAjaranIdFinal,
                semester
            ]);
        }

        // Ambil data terbaru
        const [nilaiBaru] = await db.query(`
            SELECT 
                nk.id_siswa,
                nk.nilai_mutabaah,
                nk.nilai_bpi,
                nk.nilai_literasi,
                nk.nilai_proyek,
                jpt.judul AS nama_judul_proyek,
                -- Grade via subquery (opsional, bisa dihapus jika cukup pakai helper)
                (SELECT kgk.grade FROM kategori_grade_kokurikuler kgk 
                 WHERE kgk.id_aspek_kokurikuler = 1 
                   AND nk.nilai_mutabaah BETWEEN kgk.rentang_min AND kgk.rentang_max 
                 LIMIT 1) AS mutabaah_grade,
                (SELECT kgk.deskripsi FROM kategori_grade_kokurikuler kgk 
                 WHERE kgk.id_aspek_kokurikuler = 1 
                   AND nk.nilai_mutabaah BETWEEN kgk.rentang_min AND kgk.rentang_max 
                 LIMIT 1) AS mutabaah_deskripsi,
                (SELECT kgk.grade FROM kategori_grade_kokurikuler kgk 
                 WHERE kgk.id_aspek_kokurikuler = 3 
                   AND nk.nilai_bpi BETWEEN kgk.rentang_min AND kgk.rentang_max 
                 LIMIT 1) AS bpi_grade,
                (SELECT kgk.deskripsi FROM kategori_grade_kokurikuler kgk 
                 WHERE kgk.id_aspek_kokurikuler = 3 
                   AND nk.nilai_bpi BETWEEN kgk.rentang_min AND kgk.rentang_max 
                 LIMIT 1) AS bpi_deskripsi,
                (SELECT kgk.grade FROM kategori_grade_kokurikuler kgk 
                 WHERE kgk.id_aspek_kokurikuler = 2 
                   AND nk.nilai_literasi BETWEEN kgk.rentang_min AND kgk.rentang_max 
                 LIMIT 1) AS literasi_grade,
                (SELECT kgk.deskripsi FROM kategori_grade_kokurikuler kgk 
                 WHERE kgk.id_aspek_kokurikuler = 2 
                   AND nk.nilai_literasi BETWEEN kgk.rentang_min AND kgk.rentang_max 
                 LIMIT 1) AS literasi_deskripsi,
                (SELECT kgk.grade FROM kategori_grade_kokurikuler kgk 
                 WHERE kgk.id_aspek_kokurikuler = 4 
                   AND nk.nilai_proyek BETWEEN kgk.rentang_min AND kgk.rentang_max 
                 LIMIT 1) AS judul_proyek_grade,
                (SELECT kgk.deskripsi FROM kategori_grade_kokurikuler kgk 
                 WHERE kgk.id_aspek_kokurikuler = 4 
                   AND nk.nilai_proyek BETWEEN kgk.rentang_min AND kgk.rentang_max 
                 LIMIT 1) AS judul_proyek_deskripsi
            FROM nilai_kokurikuler nk
            LEFT JOIN judul_proyek_per_tahun_ajaran jpt ON nk.id_judul_proyek = jpt.id_judul_proyek
            WHERE nk.id_siswa = ? AND nk.id_tahun_ajaran = ?
            LIMIT 1
        `, [siswaId, tahunAjaranIdFinal]);

        if (!nilaiBaru[0]) {
            return res.status(404).json({ success: false, message: 'Data nilai tidak ditemukan setelah simpan' });
        }

        const row = nilaiBaru[0];
        const data = {
            mutabaah_nilai: row.nilai_mutabaah,
            mutabaah_grade: row.mutabaah_grade,
            mutabaah_deskripsi: row.mutabaah_deskripsi,
            bpi_nilai: row.nilai_bpi,
            bpi_grade: row.bpi_grade,
            bpi_deskripsi: row.bpi_deskripsi,
            literasi_nilai: row.nilai_literasi,
            literasi_grade: row.literasi_grade,
            literasi_deskripsi: row.literasi_deskripsi,
            judul_proyek_nilai: row.nilai_proyek,
            judul_proyek_grade: row.judul_proyek_grade,
            judul_proyek_deskripsi: row.judul_proyek_deskripsi,
            nama_judul_proyek: row.nama_judul_proyek || null
        };

        res.json({
            success: true,
            message: 'Nilai kokurikuler berhasil disimpan',
            data
        });

    } catch (err) {
        console.error('Error updateNilaiKokurikuler:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal menyimpan nilai kokurikuler'
        });
    }
};

exports.getNilaiKokurikulerBySiswa = async (req, res) => {
    const { siswaId } = req.params;

    try {
        // Ambil tahun ajaran aktif (contoh: ambil dari session atau default)
        // Jika belum ada sistem "tahun ajaran aktif", bisa gunakan tahun ajaran terbaru
        const tahunAjaranAktif = await db.query(`
            SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' ORDER BY created_at DESC LIMIT 1
        `);

        const tahunAjaranId = tahunAjaranAktif[0]?.id_tahun_ajaran || 1; // fallback

        // Query utama: gabungkan nilai, aspek, dan kategori grade
        const nilai = await db.query(`
            SELECT 
                nk.id_nilai_kokurikuler,
                nk.id_siswa,
                nk.id_kelas,
                nk.id_tahun_ajaran,
                nk.semester,
                nk.nilai_bpi,
                nk.nilai_literasi,
                nk.nilai_mutabaah,
                nk.nilai_proyek,
                ak.id_aspek_kokurikuler,
                ak.kode AS kode_aspek,
                ak.nama AS nama_aspek,
                ak.deskripsi AS deskripsi_aspek,
                kgk.rentang_min,
                kgk.rentang_max,
                kgk.grade,
                kgk.deskripsi AS deskripsi_grade,
                kgk.urutan
            FROM nilai_kokurikuler nk
            JOIN aspek_kokurikuler ak ON nk.id_aspek_kokurikuler = ak.id_aspek_kokurikuler
            JOIN kategori_grade_kokurikuler kgk ON ak.id_aspek_kokurikuler = kgk.id_aspek_kokurikuler
                AND nk.nilai_bpi BETWEEN kgk.rentang_min AND kgk.rentang_max
            WHERE nk.id_siswa = ? 
              AND nk.id_tahun_ajaran = ?
            ORDER BY kgk.urutan ASC
        `, [siswaId, tahunAjaranId]);

        res.json({
            success: true,
            data: nilai
        });

    } catch (err) {
        console.error('Error getNilaiKokurikulerBySiswa:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data nilai kokurikuler',
            error: err.message
        });
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
        res.json({
            success: true,
            wajib: rows.filter(r => r.jenis === 'wajib').map(r => ({
                mata_pelajaran_id: r.id_mata_pelajaran,
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

// === ATUR PENILAIAN ===
// Akademik: Kategori 
exports.getKategoriNilaiAkademik = async (req, res) => {
    try {
        const { mapel_id } = req.query;
        const mapelId = mapel_id ? Number(mapel_id) : null;
        const data = await konfigurasiNilaiRaporModel.getAllKategori(mapelId);
        const formattedData = data.map(item => ({
            ...item,
            min_nilai: Math.floor(item.min_nilai),
            max_nilai: Math.floor(item.max_nilai)
        }));
        res.json({ success: true, data: formattedData });
    } catch (err) {
        console.error('Error getKategoriNilaiAkademik:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil konfigurasi nilai akademik' });
    }
};

exports.createKategoriNilaiAkademik = async (req, res) => {
    try {
        const { min_nilai, max_nilai, deskripsi, urutan, mapel_id } = req.body;
        if (min_nilai == null || max_nilai == null || deskripsi == null) {
            return res.status(400).json({ success: false, message: 'Field min_nilai, max_nilai, dan deskripsi wajib diisi' });
        }
        if (min_nilai < 0 || max_nilai > 100 || min_nilai > max_nilai) {
            return res.status(400).json({ success: false, message: 'Rentang nilai tidak valid' });
        }

        const mapelIdNum = parseInt(mapel_id, 10);
if (isNaN(mapelIdNum) || mapelIdNum <= 0) {
    return res.status(400).json({ success: false, message: 'mapel_id tidak valid' });
}

        const newKategori = await konfigurasiNilaiRaporModel.createKategori({
            mapel_id: mapelIdNum,
            min_nilai: parseFloat(min_nilai),
            max_nilai: parseFloat(max_nilai),
            deskripsi,
            urutan: urutan != null ? parseInt(urutan) : 0
        });
        res.status(201).json({ success: true, message: 'Konfigurasi nilai akademik berhasil ditambahkan', data: newKategori });
    } catch (err) {
        console.error('Error createKategoriNilaiAkademik:', err);
        res.status(500).json({ success: false, message: 'Gagal menambah konfigurasi nilai akademik' });
    }
};

exports.updateKategoriNilaiAkademik = async (req, res) => {
    try {
        const { id } = req.params;
        const { min_nilai, max_nilai, deskripsi, urutan } = req.body;

        //  Validasi wajib: pastikan mapel_id ada
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });

        // Ambil user ID dari token (asumsi Anda punya middleware authenticate)
        const userId = req.user.id; // Pastikan ini sudah di-set oleh middleware

        // Ambil data kategori lama untuk mendapatkan mapel_id-nya
        const [oldKategori] = await db.execute(`
            SELECT mapel_id FROM konfigurasi_nilai_rapor WHERE id_config = ?
        `, [id]);

        if (oldKategori.length === 0) {
            return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
        }

        const oldMapelId = oldKategori[0].mapel_id;

        // 
        const mapelId = req.body.mapel_id || oldMapelId; 

        // Validasi lainnya tetap sama
        if (min_nilai == null || max_nilai == null || deskripsi == null) {
            return res.status(400).json({ success: false, message: 'Field min_nilai, max_nilai, dan deskripsi wajib diisi' });
        }
        if (min_nilai < 0 || max_nilai > 100 || min_nilai > max_nilai) {
            return res.status(400).json({ success: false, message: 'Rentang nilai tidak valid' });
        }

        const updated = await konfigurasiNilaiRaporModel.updateKategori(id, {
            mapel_id: parseInt(mapelId),
            min_nilai: parseFloat(min_nilai),
            max_nilai: parseFloat(max_nilai),
            deskripsi,
            urutan: urutan != null ? parseInt(urutan) : 0
        });

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Konfigurasi akademik tidak ditemukan' });
        }

        res.json({ success: true, message: 'Konfigurasi nilai akademik berhasil diperbarui' });
    } catch (err) {
        console.error('Error updateKategoriNilaiAkademik:', err);
        res.status(500).json({ success: false, message: 'Gagal memperbarui konfigurasi nilai akademik' });
    }
};

exports.deleteKategoriNilaiAkademik = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await konfigurasiNilaiRaporModel.deleteKategori(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Konfigurasi tidak ditemukan' });
        }
        res.json({ success: true, message: 'Konfigurasi nilai akademik berhasil dihapus' });
    } catch (err) {
        console.error('Error deleteKategoriNilaiAkademik:', err);
        res.status(500).json({ success: false, message: 'Gagal menghapus konfigurasi nilai akademik' });
    }
};

// Kokurikuler: Kategori (dengan grade)
exports.getKategoriNilaiKokurikuler = async (req, res) => {
    try {
        const data = await konfigurasiNilaiKokurikulerModel.getAllKategori();
        const formattedData = data.map(item => ({
            ...item,
            min_nilai: Math.floor(item.min_nilai),
            max_nilai: Math.floor(item.max_nilai)
        }));
        res.json({ success: true, data: formattedData });
    } catch (err) {
        console.error('Error getKategoriNilaiKokurikuler:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil konfigurasi nilai kokurikuler' });
    }
};

exports.createKategoriNilaiKokurikuler = async (req, res) => {
    try {
        const { min_nilai, max_nilai, grade, deskripsi, urutan, id_aspek_kokurikuler } = req.body;

        // Validasi tambahan: pastikan id_aspek_kokurikuler ada
        if (min_nilai == null || max_nilai == null || grade == null || deskripsi == null || id_aspek_kokurikuler == null) {
            return res.status(400).json({ success: false, message: 'Semua field wajib diisi, termasuk aspek kokurikuler' });
        }

        if (min_nilai < 0 || max_nilai > 100 || min_nilai > max_nilai) {
            return res.status(400).json({ success: false, message: 'Rentang nilai tidak valid' });
        }

        const newKategori = await konfigurasiNilaiKokurikulerModel.createKategori({
            id_aspek_kokurikuler: parseInt(id_aspek_kokurikuler), //  tambahkan ini
            min_nilai: Math.floor(min_nilai),
            max_nilai: Math.floor(max_nilai),
            grade,
            deskripsi,
            urutan: urutan != null ? parseInt(urutan) : 0
        });

        res.status(201).json({ success: true, message: 'Konfigurasi nilai kokurikuler berhasil ditambahkan', data: newKategori });
    } catch (err) {
        console.error('Error createKategoriNilaiKokurikuler:', err);
        res.status(500).json({ success: false, message: 'Gagal menambah konfigurasi nilai kokurikuler' });
    }
};

exports.updateKategoriNilaiKokurikuler = async (req, res) => {
    try {
        const { id } = req.params;
        const { min_nilai, max_nilai, grade, deskripsi, urutan, id_aspek_kokurikuler } = req.body;

        if (min_nilai == null || max_nilai == null || grade == null || deskripsi == null || id_aspek_kokurikuler == null) {
            return res.status(400).json({ success: false, message: 'Semua field wajib diisi, termasuk aspek kokurikuler' });
        }

        if (min_nilai < 0 || max_nilai > 100 || min_nilai > max_nilai) {
            return res.status(400).json({ success: false, message: 'Rentang nilai tidak valid' });
        }

        const updated = await konfigurasiNilaiKokurikulerModel.updateKategori(id, {
            id_aspek_kokurikuler: parseInt(id_aspek_kokurikuler),
            min_nilai: parseFloat(min_nilai),
            max_nilai: parseFloat(max_nilai),
            grade,
            deskripsi,
            urutan: urutan != null ? parseInt(urutan) : 0
        });

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Konfigurasi kokurikuler tidak ditemukan' });
        }

        res.json({ success: true, message: 'Konfigurasi nilai kokurikuler berhasil diperbarui' });
    } catch (err) {
        console.error('Error updateKategoriNilaiKokurikuler:', err);
        res.status(500).json({ success: false, message: 'Gagal memperbarui konfigurasi nilai kokurikuler' });
    }
};

exports.deleteKategoriNilaiKokurikuler = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await konfigurasiNilaiKokurikulerModel.deleteKategori(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Konfigurasi tidak ditemukan' });
        }
        res.json({ success: true, message: 'Konfigurasi nilai kokurikuler berhasil dihapus' });
    } catch (err) {
        console.error('Error deleteKategoriNilaiKokurikuler:', err);
        res.status(500).json({ success: false, message: 'Gagal menghapus konfigurasi nilai kokurikuler' });
    }
};

// Bobot Akademik per Mapel — DENGAN VALIDASI AKSES
exports.getBobotAkademikByMapel = async (req, res) => {
    try {
        const { mapelId } = req.params;
        const userId = req.user.id;
        const isValid = await isMapelWajibGuruKelas(userId, mapelId);
        if (!isValid) {
            return res.status(403).json({ success: false, message: 'Akses ditolak: hanya untuk mata pelajaran wajib yang Anda kelola' });
        }

        // Ambil data bobot dari database
        const bobot = await bobotPenilaianModel.getBobotByMapel(mapelId);

        // Jika belum ada data bobot, buat data default
        if (bobot.length === 0) {
            // Ambil semua komponen
            const komponenList = await komponenPenilaianModel.getAllKomponen();

            // Buat data bobot default (misalnya: UH 1-5 = 10%, PTS = 20%, PAS = 30%)
            const defaultBobot = komponenList.map(k => ({
                komponen_id: k.id_komponen,
                bobot: 0, // Atau atur sesuai kebutuhan
                is_active: true
            }));

            // Simpan data bobot default
            await bobotPenilaianModel.updateBobotByMapel(mapelId, defaultBobot);

            // Ambil data bobot yang baru saja disimpan
            const newBobot = await bobotPenilaianModel.getBobotByMapel(mapelId);
            res.json({ success: true, data: newBobot });
        } else {
            res.json({ success: true, data: bobot });
        }
    } catch (err) {
        console.error('Error getBobotAkademikByMapel:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil bobot penilaian' });
    }
};
exports.updateBobotAkademikByMapel = async (req, res) => {
    try {
        const { mapelId } = req.params;
        const userId = req.user.id;
        const isValid = await isMapelWajibGuruKelas(userId, mapelId);
        if (!isValid) {
            return res.status(403).json({ success: false, message: 'Akses ditolak: hanya untuk mata pelajaran wajib yang Anda kelola' });
        }
        const bobotList = req.body;
        if (!Array.isArray(bobotList)) {
            return res.status(400).json({ success: false, message: 'Data bobot harus berupa array' });
        }
        for (const item of bobotList) {
            if (!item.komponen_id || item.bobot == null) {
                return res.status(400).json({ success: false, message: 'Setiap bobot harus memiliki komponen_id dan nilai bobot' });
            }
            if (item.bobot < 0 || item.bobot > 100) {
                return res.status(400).json({ success: false, message: 'Bobot harus antara 0–100' });
            }
        }
        const total = bobotList.reduce((sum, item) => sum + parseFloat(item.bobot), 0);
        if (Math.abs(total - 100) > 0.1) {
            return res.status(400).json({ success: false, message: 'Total bobot harus 100%' });
        }
        await bobotPenilaianModel.updateBobotByMapel(mapelId, bobotList);
        res.json({ success: true, message: 'Bobot penilaian akademik berhasil diperbarui' });
    } catch (err) {
        console.error('Error updateBobotAkademikByMapel:', err);
        res.status(500).json({ success: false, message: 'Gagal memperbarui bobot penilaian' });
    }
};

// Komponen Penilaian
exports.getKomponenPenilaian = async (req, res) => {
    try {
        const komponen = await komponenPenilaianModel.getAllKomponen();
        res.json({ success: true, data: komponen });
    } catch (err) {
        console.error('Error getKomponenPenilaian:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil daftar komponen' });
    }
};

// === NILAI (Lanjutan) ===
const getDeskripsiFromKategori = (nilai, kategoriList) => {
    if (nilai == null || nilai < 0) return 'Belum ada deskripsi';
    for (const k of kategoriList) {
        if (nilai >= k.min_nilai && nilai <= k.max_nilai) {
            return k.deskripsi;
        }
    }
    return 'Belum ada deskripsi';
};

exports.getNilaiByMapel = async (req, res) => {
    try {
        const { mapelId } = req.params;
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Tidak terautentikasi' });

        // Validasi: apakah guru kelas punya kelas aktif
        const [kelasRow] = await db.execute(`
            SELECT kelas_id, tahun_ajaran_id 
            FROM guru_kelas 
            WHERE user_id = ? AND tahun_ajaran_id = (
                SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
            )
        `, [userId]);
        if (kelasRow.length === 0) {
            return res.status(403).json({ message: 'Anda tidak memiliki kelas aktif' });
        }

        const { kelas_id, tahun_ajaran_id } = kelasRow[0];
        const [namaKelasRow] = await db.execute(`SELECT nama_kelas FROM kelas WHERE id_kelas = ?`, [kelas_id]);
        const kelasNama = namaKelasRow[0]?.nama_kelas || 'Kelas Tidak Diketahui';

        const bisaInput = await isMapelWajibGuruKelas(userId, mapelId);

        // Ambil siswa
        const [siswaRows] = await db.execute(`
            SELECT id_siswa, nis, nisn, nama_lengkap 
            FROM siswa 
            WHERE id_siswa IN (
                SELECT siswa_id FROM siswa_kelas 
                WHERE kelas_id = ? AND tahun_ajaran_id = ?
            )
            ORDER BY nama_lengkap
        `, [kelas_id, tahun_ajaran_id]);

        // Ambil nilai detail
        const [nilaiRows] = await db.execute(`
            SELECT siswa_id, komponen_id, nilai 
            FROM nilai_detail 
            WHERE mapel_id = ? AND tahun_ajaran_id = ?
        `, [mapelId, tahun_ajaran_id]);

        // Ambil komponen penilaian
        const [komponenRows] = await db.execute(`
            SELECT id_komponen, nama_komponen 
            FROM komponen_penilaian 
            ORDER BY urutan
        `);

        // Ambil bobot per mapel
        const [bobotRows] = await db.execute(`
            SELECT komponen_id, bobot 
            FROM konfigurasi_mapel_komponen 
            WHERE mapel_id = ?
        `, [mapelId]);

        // AMBIL KATEGORI NILAI PER MAPEL
        const [kategoriRows] = await db.execute(`
            SELECT min_nilai, max_nilai, deskripsi
            FROM konfigurasi_nilai_rapor
            WHERE mapel_id = ?
            ORDER BY min_nilai DESC
        `, [mapelId]);

        // Helper baru
        const getDeskripsiFromKategori = (nilai, kategoriList) => {
            if (nilai == null || nilai < 0) return 'Belum ada deskripsi';
            for (const k of kategoriList) {
                if (nilai >= k.min_nilai && nilai <= k.max_nilai) {
                    return k.deskripsi;
                }
            }
            return 'Belum ada deskripsi';
        };

        // Buat map nilai dan bobot
        const nilaiMap = {};
        nilaiRows.forEach(n => {
            if (!nilaiMap[n.siswa_id]) nilaiMap[n.siswa_id] = {};
            nilaiMap[n.siswa_id][n.komponen_id] = n.nilai;
        });

        const bobotMap = new Map();
        bobotRows.forEach(b => {
            bobotMap.set(b.komponen_id, parseFloat(b.bobot) || 0);
        });

        // Identifikasi komponen UH, PTS, PAS
        const uhKomponenIds = komponenRows
            .filter(k => k.nama_komponen.toLowerCase().includes('uh'))
            .map(k => k.id_komponen);
        const ptsKomponenIds = komponenRows
            .filter(k => k.nama_komponen.toLowerCase().includes('pts'))
            .map(k => k.id_komponen);
        const pasKomponenIds = komponenRows
            .filter(k => k.nama_komponen.toLowerCase().includes('pas'))
            .map(k => k.id_komponen);

        // Hitung nilai rapor per siswa
        const siswaList = siswaRows.map(s => {
            const nilai = nilaiMap[s.id_siswa] || {};
            const nilaiUH = uhKomponenIds.map(id => nilai[id]).filter(v => v != null);
            const rataUH = nilaiUH.length > 0 ? nilaiUH.reduce((a, b) => a + b, 0) / nilaiUH.length : 0;
            const nilaiPTS = ptsKomponenIds.length > 0 ? (nilai[ptsKomponenIds[0]] || 0) : 0;
            const nilaiPAS = pasKomponenIds.length > 0 ? (nilai[pasKomponenIds[0]] || 0) : 0;

            // Hitung nilai rapor
            const totalBobotUH = uhKomponenIds.reduce((sum, id) => sum + (bobotMap.get(id) || 0), 0);
            const bobotPTS = ptsKomponenIds.length > 0 ? (bobotMap.get(ptsKomponenIds[0]) || 0) : 0;
            const bobotPAS = pasKomponenIds.length > 0 ? (bobotMap.get(pasKomponenIds[0]) || 0) : 0;

            let nilaiRapor = 0;
            if (totalBobotUH > 0) nilaiRapor += (rataUH * totalBobotUH);
            if (bobotPTS > 0) nilaiRapor += (nilaiPTS * bobotPTS);
            if (bobotPAS > 0) nilaiRapor += (nilaiPAS * bobotPAS);
            nilaiRapor = nilaiRapor / 100;

            // HITUNG DESKRIPSI MENGGUNAKAN KATEGORI PER MAPEL
            const nilaiRaporBulat = Math.floor(nilaiRapor);
            const deskripsiRapor = getDeskripsiFromKategori(nilaiRaporBulat, kategoriRows);

            // Siapkan objek nilai detail
            const nilaiDetail = {};
            Object.keys(nilai).forEach(komponenId => {
                nilaiDetail[komponenId] = nilai[komponenId];
            });

            return {
                id: s.id_siswa,
                nama: s.nama_lengkap,
                nis: s.nis,
                nisn: s.nisn,
                nilai_rapor: nilaiRaporBulat,
                deskripsi: deskripsiRapor,
                nilai: nilaiDetail
            };
        });

        // Urutkan berdasarkan nilai rapor
        siswaList.sort((a, b) => b.nilai_rapor - a.nilai_rapor);
        siswaList.forEach((s, i) => {
            s.ranking = i + 1;
        });

        res.json({
            success: true,
            siswaList,
            komponen: komponenRows,
            kelas: kelasNama,
            bisa_input: bisaInput
        });

    } catch (err) {
        console.error('Error getNilaiByMapel:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data nilai' });
    }
};

exports.simpanNilai = async (req, res) => {
    const { siswa_id, mapel_id, komponen_id, nilai } = req.body;
    const user_id = req.user.id;
    try {
        if (!siswa_id || !mapel_id || !komponen_id || nilai === undefined) {
            return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
        }
        if (nilai < 0 || nilai > 100) {
            return res.status(400).json({ success: false, message: 'Nilai harus antara 0 dan 100' });
        }
        const isValid = await isMapelWajibGuruKelas(user_id, mapel_id);
        if (!isValid) {
            return res.status(403).json({ success: false, message: 'Akses ditolak: hanya untuk mata pelajaran wajib yang Anda kelola' });
        }
        let kelas_id = req.user.kelas_id;
        let tahun_ajaran_id = req.user.tahun_ajaran_id;
        if (!kelas_id || !tahun_ajaran_id) {
            const [pembelajaran] = await db.execute(
                'SELECT kelas_id, tahun_ajaran_id FROM pembelajaran WHERE user_id = ? AND mata_pelajaran_id = ?',
                [user_id, mapel_id]
            );
            if (!pembelajaran[0]) {
                return res.status(403).json({ success: false, message: 'Anda tidak mengajar mapel ini' });
            }
            kelas_id = pembelajaran[0].kelas_id;
            tahun_ajaran_id = pembelajaran[0].tahun_ajaran_id;
        }
        const saved = await nilaiModel.simpanNilaiDetail({
            siswa_id,
            mapel_id,
            komponen_id,
            nilai,
            kelas_id,
            tahun_ajaran_id,
            user_id
        });
        return res.status(200).json({
            success: true,
            message: 'Nilai berhasil disimpan',
            data: saved
        });
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
        if (!userId) return res.status(401).json({ message: 'Tidak terautentikasi' });
        const isValid = await isMapelWajibGuruKelas(userId, mapelId);
        if (!isValid) {
            return res.status(403).json({ message: 'Akses ditolak: hanya untuk mata pelajaran wajib yang Anda kelola' });
        }
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
        const [mapelRows] = await db.execute(`
            SELECT nama_mata_pelajaran FROM mata_pelajaran WHERE id_mata_pelajaran = ?
        `, [mapelId]);
        if (mapelRows.length === 0) {
            return res.status(404).json({ message: 'Mata pelajaran tidak ditemukan' });
        }
        const namaMapel = mapelRows[0].nama_mata_pelajaran;
        const nilaiData = await nilaiModel.getNilaiByKelasMapel(kelas_id, mapelId, tahun_ajaran_id);
        const [komponenRows] = await db.execute(`
            SELECT id_komponen, nama_komponen 
            FROM komponen_penilaian 
            ORDER BY urutan
        `);
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
        const siswaList = Object.values(siswaMap).sort((a, b) => b.nilai_rapor - a.nilai_rapor);
        siswaList.forEach((siswa, index) => {
            siswa.ranking = index + 1;
        });
        const headers = ['No', 'Nama Siswa', 'NIS', 'NISN'];
        const komponenHeaders = komponenRows.map(k => k.nama_komponen);
        const finalHeaders = [...headers, ...komponenHeaders, 'Nilai Rapor', 'Ranking'];
        const rows = siswaList.map((siswa, index) => {
            const rowData = [
                index + 1,
                siswa.nama,
                siswa.nis,
                siswa.nisn || ''
            ];
            komponenRows.forEach(komp => {
                const nilai = siswa[`nilai_${komp.id_komponen}`];
                rowData.push(nilai !== undefined && nilai !== null ? nilai : '-');
            });
            rowData.push(siswa.nilai_rapor.toFixed(2));
            rowData.push(siswa.ranking);
            return rowData;
        });
        const worksheet = XLSX.utils.aoa_to_sheet([finalHeaders, ...rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Nilai');
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        const fileName = `Rekap_Nilai_${namaMapel.replace(/[^a-z0-9]/gi, '_')}.xlsx`;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (err) {
        console.error('Error ekspor nilai ke Excel:', err);
        res.status(500).json({ message: 'Gagal mengekspor data ke Excel' });
    }
};

exports.getAspekKokurikuler = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT id_aspek_kokurikuler, nama
            FROM aspek_kokurikuler
            ORDER BY urutan ASC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error getAspekKokurikuler:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil daftar aspek' });
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

exports.updateNilaiKomponen = async (req, res) => {
    try {
        const { mapelId, siswaId } = req.params;
        const { nilai } = req.body;
        const userId = req.user.id;

        // Validasi akses: hanya mapel wajib yang bisa di-input guru kelas
        const isValid = await isMapelWajibGuruKelas(userId, mapelId);
        if (!isValid) {
            return res.status(403).json({ success: false, message: 'Akses ditolak: hanya untuk mata pelajaran wajib yang Anda kelola' });
        }

        const [gkRows] = await db.execute(`
            SELECT 
                gk.tahun_ajaran_id,
                ta.semester
            FROM guru_kelas gk
            JOIN tahun_ajaran ta ON gk.tahun_ajaran_id = ta.id_tahun_ajaran
            WHERE gk.user_id = ? 
              AND ta.status = 'aktif'
            LIMIT 1
        `, [userId]);

        if (gkRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Kelas aktif tidak ditemukan' });
        }

        const { tahun_ajaran_id, semester } = gkRows[0]; 
        // Ambil bobot untuk mapel ini
        const bobotList = await bobotPenilaianModel.getBobotByMapel(mapelId);
        if (bobotList.length === 0) {
            return res.status(400).json({ success: false, message: 'Bobot penilaian belum diatur untuk mata pelajaran ini' });
        }

        const bobotMap = new Map();
        let totalBobot = 0;
        bobotList.forEach(b => {
            const bVal = parseFloat(b.bobot) || 0;
            bobotMap.set(b.komponen_id, bVal);
            totalBobot += bVal;
        });
        if (totalBobot === 0) {
            return res.status(400).json({ success: false, message: 'Total bobot harus 100%' });
        }

        // Ambil daftar komponen
        const komponenList = await komponenPenilaianModel.getAllKomponen();
        const uhKomponenIds = komponenList
            .filter(k => k.nama_komponen.toLowerCase().includes('uh'))
            .map(k => k.id_komponen);
        const ptsKomponenIds = komponenList
            .filter(k => k.nama_komponen.toLowerCase().includes('pts'))
            .map(k => k.id_komponen);
        const pasKomponenIds = komponenList
            .filter(k => k.nama_komponen.toLowerCase().includes('pas'))
            .map(k => k.id_komponen);

        // Simpan nilai detail
        for (const [komponenIdStr, nilaiSiswa] of Object.entries(nilai)) {
            const komponenId = parseInt(komponenIdStr, 10);
            let nilaiBulat = null;
            if (nilaiSiswa != null && !isNaN(nilaiSiswa)) {
                nilaiBulat = Math.floor(parseFloat(nilaiSiswa));
                if (nilaiBulat < 0) nilaiBulat = 0;
                if (nilaiBulat > 100) nilaiBulat = 100;
            }
            await db.execute(`
                INSERT INTO nilai_detail (siswa_id, mapel_id, komponen_id, nilai, tahun_ajaran_id)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    nilai = VALUES(nilai),
                    updated_at = NOW()
            `, [siswaId, mapelId, komponenId, nilaiBulat, tahun_ajaran_id]);
        }

        // Hitung ulang nilai rapor
        const nilaiInput = {};
        for (const [komponenIdStr, nilaiSiswa] of Object.entries(nilai)) {
            const komponenId = parseInt(komponenIdStr, 10);
            if (nilaiSiswa != null && !isNaN(nilaiSiswa)) {
                nilaiInput[komponenId] = Math.floor(parseFloat(nilaiSiswa));
            }
        }

        const nilaiUH = uhKomponenIds.map(id => nilaiInput[id]).filter(v => v != null);
        const rataUH = nilaiUH.length > 0 ? nilaiUH.reduce((a, b) => a + b, 0) / nilaiUH.length : 0;
        const nilaiPTS = ptsKomponenIds.length > 0 ? (nilaiInput[ptsKomponenIds[0]] || 0) : 0;
        const nilaiPAS = pasKomponenIds.length > 0 ? (nilaiInput[pasKomponenIds[0]] || 0) : 0;

        const totalBobotUH = uhKomponenIds.reduce((sum, id) => sum + (bobotMap.get(id) || 0), 0);
        const bobotPTS = ptsKomponenIds.length > 0 ? (bobotMap.get(ptsKomponenIds[0]) || 0) : 0;
        const bobotPAS = pasKomponenIds.length > 0 ? (bobotMap.get(pasKomponenIds[0]) || 0) : 0;

        let nilaiRapor = 0;
        if (totalBobotUH > 0) nilaiRapor += (rataUH * totalBobotUH);
        if (bobotPTS > 0) nilaiRapor += (nilaiPTS * bobotPTS);
        if (bobotPAS > 0) nilaiRapor += (nilaiPAS * bobotPAS);
        nilaiRapor = nilaiRapor / totalBobot;
        const nilaiRaporBulat = Math.floor(nilaiRapor);

        const deskripsi = await konfigurasiNilaiRaporModel.getDeskripsiByNilai(nilaiRaporBulat, mapelId);

       await db.execute(`
    INSERT INTO nilai_rapor (siswa_id, mapel_id, tahun_ajaran_id, semester, nilai_rapor, deskripsi, created_by_user_id, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
        nilai_rapor = VALUES(nilai_rapor),
        deskripsi = VALUES(deskripsi),
        updated_at = NOW()
`, [siswaId, mapelId, tahun_ajaran_id, semester, nilaiRaporBulat, deskripsi, userId]);

        res.json({
            success: true,
            message: 'Nilai komponen berhasil disimpan',
            nilai_rapor: nilaiRaporBulat,
            deskripsi: deskripsi
        });
    } catch (err) {
        console.error('Error updateNilaiKomponen:', err);
        res.status(500).json({ success: false, message: 'Gagal menyimpan nilai komponen' });
    }
};

// =============== INPUT NILAI RAPOR AKHIR (OLEH GURU KELAS) ===============
exports.updateNilaiRapor = async (req, res) => {
    const { mapelId, siswaId } = req.params;
    const { nilai_rapor, deskripsi } = req.body;
    const userId = req.user.id;

    try {
        // Validasi input
        const nilaiRaporInt = parseInt(nilai_rapor);
        if (isNaN(nilaiRaporInt) || nilaiRaporInt < 0 || nilaiRaporInt > 100) {
            return res.status(400).json({
                success: false,
                message: 'Nilai rapor harus berupa angka bulat antara 0–100'
            });
        }

        // Validasi: apakah ini mapel wajib yang dikelola guru kelas?
        const isValid = await isMapelWajibGuruKelas(userId, mapelId);
        if (!isValid) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak: hanya untuk mata pelajaran wajib yang Anda kelola'
            });
        }

        // Ambil kelas dan tahun ajaran aktif
        const [gkRows] = await db.execute(`
            SELECT kelas_id, tahun_ajaran_id 
            FROM guru_kelas 
            WHERE user_id = ? 
              AND tahun_ajaran_id = (SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
        `, [userId]);

        if (gkRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kelas aktif tidak ditemukan'
            });
        }

        const { kelas_id, tahun_ajaran_id } = gkRows[0];
        const semester = 'Genap'; // atau ambil dari tahun_ajaran

        // Simpan/Update ke tabel `nilai_rapor`
        await db.execute(`
            INSERT INTO nilai_rapor (
                siswa_id, mapel_id, kelas_id, tahun_ajaran_id, semester,
                nilai_rapor, deskripsi, created_by_user_id, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
                nilai_rapor = VALUES(nilai_rapor),
                deskripsi = VALUES(deskripsi),
                updated_at = NOW()
        `, [
            siswaId,
            mapelId,
            kelas_id,
            tahun_ajaran_id,
            semester,
            nilaiRaporInt,
            deskripsi || '',
            userId
        ]);

        res.json({
            success: true,
            message: 'Nilai rapor berhasil diperbarui',
            data: {
                siswa_id: siswaId,
                mapel_id: mapelId,
                nilai_rapor: nilaiRaporInt,
                deskripsi: deskripsi || ''
            }
        });

    } catch (err) {
        console.error('Error updateNilaiRapor:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui nilai rapor'
        });
    }
};