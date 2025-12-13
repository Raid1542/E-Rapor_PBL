const db = require('../config/db');

const catatanWaliKelasModel = {
    async getGuruKelasAktif(userId) {
        const [rows] = await db.execute(`
        SELECT gk.kelas_id, ta.id_tahun_ajaran, k.nama_kelas
        FROM guru_kelas gk
        JOIN tahun_ajaran ta ON gk.tahun_ajaran_id = ta.id_tahun_ajaran
        JOIN kelas k ON gk.kelas_id = k.id_kelas
        WHERE gk.user_id = ? AND ta.status = 'aktif'
    `, [userId]);
        return rows[0] || null;
    },

    async getCatatanByKelas(kelasId, tahunAjaranId) {
        const [rows] = await db.execute(`
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
    `, [kelasId, tahunAjaranId]);
        return rows;
    },

    async upsertCatatan(siswaId, kelasId, tahunAjaranId, catatan_pts, catatan_pas, naik_tingkat) {
        await db.execute(`
        INSERT INTO catatan_wali_kelas 
        (siswa_id, kelas_id, tahun_ajaran_id, catatan_pts, catatan_pas, naik_tingkat)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        catatan_pts = VALUES(catatan_pts),
        catatan_pas = VALUES(catatan_pas),
        naik_tingkat = VALUES(naik_tingkat),
        updated_at = NOW()
    `, [siswaId, kelasId, tahunAjaranId, catatan_pts, catatan_pas, naik_tingkat]);
    }
};

module.exports = catatanWaliKelasModel;