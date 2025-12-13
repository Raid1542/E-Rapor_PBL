const db = require('../config/db');

const catatanKokurikulerModel = {
    // Ambil data kokurikuler siswa di kelas tertentu (untuk tampil di form)
    getBySiswaAndTahunAjaran(siswaId, tahunAjaranId, jenisPenilaian) {
        const sql = `
        SELECT * FROM catatan_kokurikuler
        WHERE siswa_id = ? AND tahun_ajaran_id = ? AND jenis_penilaian = ?
    `;
        return db.query(sql, [siswaId, tahunAjaranId, jenisPenilaian]);
    },

    // Simpan atau update data (bisa pakai INSERT ... ON DUPLICATE KEY UPDATE)
    save(data) {
        const { siswa_id, tahun_ajaran_id, kelas_id, aspek, nilai_angka, grade, deskripsi, jenis_penilaian } = data;
        const sql = `
        INSERT INTO catatan_kokurikuler 
        (siswa_id, tahun_ajaran_id, kelas_id, aspek, nilai_angka, grade, deskripsi, jenis_penilaian)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        nilai_angka = VALUES(nilai_angka),
        grade = VALUES(grade),
        deskripsi = VALUES(deskripsi),
        updated_at = CURRENT_TIMESTAMP
    `;
        return db.query(sql, [siswa_id, tahun_ajaran_id, kelas_id, aspek, nilai_angka, grade, deskripsi, jenis_penilaian]);
    },

    // Ambil semua aspek kokurikuler untuk satu siswa (misal untuk tampil di rapor PAS)
    getAllForSiswa(siswaId, tahunAjaranId, jenisPenilaian) {
        const sql = `
        SELECT aspek, deskripsi, nilai_angka, grade
        FROM catatan_kokurikuler
        WHERE siswa_id = ? AND tahun_ajaran_id = ? AND jenis_penilaian = ?
        ORDER BY FIELD(aspek,
        'Mutabaaah Yaumiyah',
        'Mentoring Bina Pribadi Islam',
        'Literasi',
        'Sekolahku Indah Tanpa Sampah'
        )
    `;
        return db.query(sql, [siswaId, tahunAjaranId, jenisPenilaian]);
    }
};

const ASPEK_KOKUL_VALID = [
    'Mutabaaah Yaumiyah',
    'Mentoring Bina Pribadi Islam',
    'Literasi',
    'Sekolahku Indah Tanpa Sampah'
];

/**
 * GET /kokurikuler/:siswaId?jenis_penilaian=pts
 * Ambil data kokurikuler untuk satu siswa berdasarkan jenis penilaian (pts/pas)
 */
exports.getKokurikuler = async (req, res) => {
    try {
        const { siswaId } = req.params;
        const { jenis_penilaian } = req.query;

        if (!siswaId) {
            return res.status(400).json({ message: 'ID siswa wajib diisi' });
        }

        if (!jenis_penilaian || !['pts', 'pas'].includes(jenis_penilaian)) {
            return res.status(400).json({ message: 'jenis_penilaian harus "pts" atau "pas"' });
        }

        // Ambil kelas dan tahun ajaran aktif guru
        const userId = req.user.id;
        const [guruKelasRows] = await db.execute(`
        SELECT gk.kelas_id, ta.id_tahun_ajaran
        FROM guru_kelas gk
        JOIN tahun_ajaran ta ON gk.tahun_ajaran_id = ta.id_tahun_ajaran
        WHERE gk.user_id = ? AND ta.status = 'aktif'
    `, [userId]);

        if (guruKelasRows.length === 0) {
            return res.status(403).json({ message: 'Anda tidak memiliki kelas aktif' });
        }

        const { kelas_id, id_tahun_ajaran } = guruKelasRows[0];

        // Validasi siswa ada di kelas guru
        const [siswaValid] = await db.execute(
            'SELECT 1 FROM siswa_kelas WHERE siswa_id = ? AND kelas_id = ? AND tahun_ajaran_id = ?',
            [siswaId, kelas_id, id_tahun_ajaran]
        );

        if (siswaValid.length === 0) {
            return res.status(403).json({ message: 'Siswa tidak terdaftar di kelas Anda' });
        }

        // Ambil data kokurikuler
        const [rows] = await catatanKokurikulerModel.getAllForSiswa(siswaId, id_tahun_ajaran, jenis_penilaian);

        // Format respons: pastikan ke-4 aspek selalu ada (untuk PAS), atau hanya Mutabaaah (untuk PTS)
        let hasil = [];
        if (jenis_penilaian === 'pas') {
            // PAS: semua 4 aspek
            for (const aspek of ASPEK_KOKUL_VALID) {
                const item = rows.find(r => r.aspek === aspek);
                hasil.push({
                    aspek,
                    deskripsi: item?.deskripsi || '',
                    nilai_angka: null,
                    grade: null
                });
            }
        } else {
            // PTS: hanya Mutabaaah Yaumiyah
            const mutabaaah = rows.find(r => r.aspek === 'Mutabaaah Yaumiyah');
            hasil = [{
                aspek: 'Mutabaaah Yaumiyah',
                deskripsi: mutabaaah?.deskripsi || '',
                nilai_angka: mutabaaah?.nilai_angka || null,
                grade: mutabaaah?.grade || null
            }];
        }

        res.json({
            success: true,
            data: hasil,
            siswa_id: siswaId,
            jenis_penilaian,
            tahun_ajaran_id: id_tahun_ajaran,
            kelas_id
        });

    } catch (err) {
        console.error('Error getKokurikuler:', err);
        res.status(500).json({ message: 'Gagal mengambil data kokurikuler' });
    }
};

/**
 * PUT /kokurikuler/:siswaId
 * Simpan/memperbarui data kokurikuler
 */
exports.updateKokurikuler = async (req, res) => {
    try {
        const { siswaId } = req.params;
        const { tahun_ajaran_id, kelas_id, jenis_penilaian, aspek_data } = req.body;

        if (!siswaId || !tahun_ajaran_id || !kelas_id || !jenis_penilaian || !Array.isArray(aspek_data)) {
            return res.status(400).json({ message: 'Payload tidak lengkap' });
        }

        if (!['pts', 'pas'].includes(jenis_penilaian)) {
            return res.status(400).json({ message: 'jenis_penilaian harus "pts" atau "pas"' });
        }

        // Validasi aspek_data
        for (const item of aspek_data) {
            if (!ASPEK_KOKUL_VALID.includes(item.aspek)) {
                return res.status(400).json({ message: `Aspek tidak valid: ${item.aspek}` });
            }

            if (jenis_penilaian === 'pts') {
                // Hanya Mutabaaah Yaumiyah boleh diisi di PTS
                if (item.aspek !== 'Mutabaaah Yaumiyah') {
                    return res.status(400).json({ message: 'PTS hanya boleh menilai Mutabaaah Yaumiyah' });
                }
                // Validasi nilai & grade
                if (typeof item.nilai_angka !== 'number' || item.nilai_angka < 0 || item.nilai_angka > 100) {
                    return res.status(400).json({ message: 'Nilai angka harus bilangan bulat 0–100 untuk PTS' });
                }
                if (!['A', 'B', 'C', 'D'].includes(item.grade)) {
                    return res.status(400).json({ message: 'Grade harus A, B, C, atau D untuk PTS' });
                }
            } else {
                // PAS: tidak boleh ada nilai_angka atau grade
                if (item.nilai_angka != null || item.grade != null) {
                    return res.status(400).json({ message: 'PAS tidak boleh memiliki nilai_angka atau grade' });
                }
            }

            if (!item.deskripsi || typeof item.deskripsi !== 'string' || item.deskripsi.trim() === '') {
                return res.status(400).json({ message: 'Deskripsi wajib diisi untuk semua aspek' });
            }
        }

        // Simpan ke model
        for (const item of aspek_data) {
            await catatanKokurikulerModel.save({
                siswa_id: siswaId,
                tahun_ajaran_id,
                kelas_id,
                aspek: item.aspek,
                nilai_angka: jenis_penilaian === 'pas' ? null : item.nilai_angka,
                grade: jenis_penilaian === 'pas' ? null : item.grade,
                deskripsi: item.deskripsi.trim(),
                jenis_penilaian
            });
        }

        res.json({ success: true, message: 'Data kokurikuler berhasil disimpan' });

    } catch (err) {
        console.error('Error updateKokurikuler:', err);
        res.status(500).json({ message: 'Gagal menyimpan data kokurikuler' });
    }
};

module.exports = catatanKokurikulerModel;