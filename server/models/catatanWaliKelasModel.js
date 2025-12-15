const db = require('../config/db');

// Ambil catatan berdasarkan kelas & tahun ajaran
exports.getCatatanByKelas = async (kelasId, tahunAjaranId) => {
    const [rows] = await db.execute(`
    SELECT 
        s.id_siswa,
        s.nama_lengkap AS nama,
        s.nis,
        s.nisn,
        s.jenis_kelamin,
        c.catatan_wali_kelas,
        c.naik_tingkat
    FROM siswa s
    JOIN siswa_kelas sk ON s.id_siswa = sk.siswa_id
    LEFT JOIN catatan_wali_kelas c 
        ON s.id_siswa = c.siswa_id 
        AND c.kelas_id = ?
        AND c.tahun_ajaran_id = ?
    WHERE sk.kelas_id = ? 
        AND sk.tahun_ajaran_id = ?
    ORDER BY s.nama_lengkap
    `, [kelasId, tahunAjaranId, kelasId, tahunAjaranId]);

    return rows.map(row => ({
        id: row.id_siswa,
        nama: row.nama,
        nis: row.nis,
        nisn: row.nisn,
        jenis_kelamin: row.jenis_kelamin,
        catatan_wali_kelas: row.catatan_wali_kelas || '',
        naik_tingkat: row.naik_tingkat || 'tidak'
    }));
};

// Simpan/Update catatan
exports.upsertCatatan = async (siswaId, kelasId, tahunAjaranId, semester, catatan_wali_kelas, naik_tingkat) => {
    // Cek apakah sudah ada
    const [existing] = await db.execute(
        `SELECT id FROM catatan_wali_kelas 
        WHERE siswa_id = ? AND kelas_id = ? AND tahun_ajaran_id = ? AND semester = ?`,
        [siswaId, kelasId, tahunAjaranId, semester]
    );

    if (existing.length > 0) {
        // UPDATE
        await db.execute(
            `UPDATE catatan_wali_kelas 
        SET catatan_wali_kelas = ?, naik_tingkat = ?, updated_at = NOW()
        WHERE id = ?`,
            [catatan_wali_kelas, naik_tingkat, existing[0].id]
        );
    } else {
        // INSERT
        await db.execute(
            `INSERT INTO catatan_wali_kelas 
        (siswa_id, kelas_id, tahun_ajaran_id, semester, catatan_wali_kelas, naik_tingkat)
        VALUES (?, ?, ?, ?, ?, ?)`,
            [siswaId, kelasId, tahunAjaranId, semester, catatan_wali_kelas, naik_tingkat]
        );
    }
};

// Helper: Ambil info guru kelas aktif
exports.getGuruKelasAktif = async (userId) => {
    const [rows] = await db.execute(`
    SELECT 
        gk.kelas_id,
        ta.id_tahun_ajaran,
        k.nama_kelas,
        ta.semester
    FROM guru_kelas gk
    JOIN kelas k ON gk.kelas_id = k.id_kelas
    JOIN tahun_ajaran ta ON gk.tahun_ajaran_id = ta.id_tahun_ajaran
    WHERE gk.user_id = ? AND ta.status = 'aktif'
    `, [userId]);
    return rows[0] || null;
};