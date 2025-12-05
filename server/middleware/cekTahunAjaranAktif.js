const db = require('../config/db');

const cekTahunAjaranAktif = async (req, res, next) => {
    try {
        const [rows] = await db.execute(
            'SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = "aktif" LIMIT 1'
        );

        if (!rows[0]) {
            return res.status(400).json({
                message: 'Harap atur tahun ajaran terlebih dahulu di menu "Data Tahun Ajaran"'
            });
        }

        req.tahunAjaranAktifId = rows[0].id_tahun_ajaran;
        next();

    } catch (err) {
        console.error('Error cek tahun ajaran aktif:', err);
        res.status(500).json({ message: 'Gagal memeriksa tahun ajaran' });
    }
};

module.exports = cekTahunAjaranAktif;