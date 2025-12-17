const db = require('../config/db');

// Ambil catatan berdasarkan kelas & tahun ajaran
exports.getCatatanByKelas = async (kelasId, tahunAjaranId, semester) => {
    const [rows] = await db.execute(`
    SELECT 
        s.id_siswa,
        s.nama_lengkap AS nama,
        s.nis,
        s.nisn,
        s.jenis_kelamin,
        COALESCE(c.catatan_wali_kelas, '') AS catatan_wali_kelas,
        COALESCE(c.naik_tingkat, 
        CASE WHEN ? = 'Genap' THEN 'tidak' ELSE NULL END
        ) AS naik_tingkat
    FROM siswa s
    INNER JOIN siswa_kelas sk 
        ON s.id_siswa = sk.siswa_id
        AND sk.kelas_id = ?
        AND sk.tahun_ajaran_id = ?
    LEFT JOIN catatan_wali_kelas c 
        ON s.id_siswa = c.siswa_id
        AND c.kelas_id = ?
        AND c.tahun_ajaran_id = ?
        AND c.semester = ?
    ORDER BY s.nama_lengkap
    `, [semester, kelasId, tahunAjaranId, kelasId, tahunAjaranId, semester]);

    return rows;
};

// Simpan/Update catatan
exports.upsertCatatan = async (siswaId, kelasId, tahunAjaranId, semester, catatan_wali_kelas, naik_tingkat) => {
    await db.execute(`
        INSERT INTO catatan_wali_kelas 
        (siswa_id, kelas_id, tahun_ajaran_id, semester, catatan_wali_kelas, naik_tingkat)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            catatan_wali_kelas = VALUES(catatan_wali_kelas),
            naik_tingkat = VALUES(naik_tingkat),
            updated_at = NOW()
    `, [siswaId, kelasId, tahunAjaranId, semester, catatan_wali_kelas, naik_tingkat]);
};

// Helper: Ambil info guru kelas aktif
exports.getGuruKelasAktif = async (userId) => {
    const [rows] = await db.execute(`
    SELECT 
        gk.kelas_id,
        k.nama_kelas,
        ta.id_tahun_ajaran,
        ta.tahun_ajaran,
        ta.semester
    FROM guru_kelas gk
    JOIN kelas k ON gk.kelas_id = k.id_kelas
    JOIN tahun_ajaran ta ON gk.tahun_ajaran_id = ta.id_tahun_ajaran
    WHERE gk.user_id = ? AND ta.status = 'aktif'
    LIMIT 1
    `, [userId]);

    return rows[0] || null;
};