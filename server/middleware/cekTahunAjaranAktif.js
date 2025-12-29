const db = require('../config/db');

module.exports = async (req, res, next) => {
    const [rows] = await db.execute(
        "SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1"
    );
    if (rows.length === 0) {
        return res.status(400).json({ message: 'Tidak ada tahun ajaran aktif' });
    }
    req.tahunAjaranAktifId = rows[0].id_tahun_ajaran; 
    next();
};