const db = require('../config/db');

const absensiModel = {
    // Ambil data guru kelas aktif
    async getGuruKelasAktif(userId) {
        const [rows] = await db.execute(`
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
        return rows[0] || null;
    },

    // Ambil semua absensi siswa di kelas
    async getAbsensiByKelas(kelasId, tahunAjaranId) {
        const [rows] = await db.execute(`
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
    `, [kelasId, tahunAjaranId]);
        return rows;
    },

    // Simpan atau update absensi
    async upsertAbsensi(siswaId, kelasId, tahunAjaranId, sakit, izin, alpha) {
        const [existing] = await db.execute(`
        SELECT id_absensi FROM absensi
        WHERE siswa_id = ? AND kelas_id = ? AND tahun_ajaran_id = ?
    `, [siswaId, kelasId, tahunAjaranId]);

        if (existing.length > 0) {
            await db.execute(`
        UPDATE absensi
        SET sakit = ?, izin = ?, alpha = ?, updated_at = NOW()
        WHERE id_absensi = ?
        `, [sakit, izin, alpha, existing[0].id_absensi]);
        } else {
            await db.execute(`
        INSERT INTO absensi (siswa_id, kelas_id, tahun_ajaran_id, sakit, izin, alpha)
        VALUES (?, ?, ?, ?, ?, ?)
        `, [siswaId, kelasId, tahunAjaranId, sakit, izin, alpha]);
        }
    }
};

module.exports = absensiModel;