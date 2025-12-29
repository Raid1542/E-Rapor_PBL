const db = require('../config/db');

const cekPenilaianStatus = async (req, res, next) => {
    try {
        const [taRows] = await db.execute(`
      SELECT id_tahun_ajaran, semester, status_pts, status_pas 
      FROM tahun_ajaran 
      WHERE status = 'aktif' 
      LIMIT 1
    `);

        if (taRows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Tahun ajaran aktif belum diatur oleh admin'
            });
        }

        const { status_pts, status_pas } = taRows[0];

        // -- PERBAIKAN UTAMA: TENTUKAN JENIS PENILAIAN SECARA EKSPLISIT --
        let jenis_penilaian = null;
        if (status_pts === 'aktif' && status_pas === 'aktif') {
            // Kasus langka: jangan izinkan keduanya aktif
            return res.status(400).json({
                success: false,
                message: 'Kesalahan sistem: PTS dan PAS tidak boleh aktif bersamaan.'
            });
        } else if (status_pts === 'aktif') {
            jenis_penilaian = 'PTS';
        } else if (status_pas === 'aktif') {
            jenis_penilaian = 'PAS';
        } else {
            // Tidak ada yang aktif
            const isAnyLocked = status_pts === 'selesai' || status_pas === 'selesai';
            if (isAnyLocked) {
                return res.status(403).json({
                    success: false,
                    message: '🔒 Periode penilaian saat ini telah ditutup. Data tidak dapat diubah.'
                });
            } else {
                return res.status(403).json({
                    success: false,
                    message: '⏳ Belum ada periode penilaian yang dibuka oleh admin.'
                });
            }
        }

        // Simpan data yang dibutuhkan ke `req`
        req.tahunAjaranAktif = taRows[0];
        req.jenis_penilaian = jenis_penilaian; // <-- Tambahkan ini
        next();
    } catch (err) {
        console.error('Error di checkPenilaianStatus:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal memeriksa status penilaian'
        });
    }
};

module.exports = cekPenilaianStatus;