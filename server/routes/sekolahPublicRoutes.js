const express = require('express');
const authenticate = require('../middleware/authenticate');
const db = require('../config/db');

const router = express.Router();

// Gunakan root path '/' karena base path sudah '/api/sekolah'
router.get('/', authenticate, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT nama_sekolah, logo_path FROM sekolah WHERE id = 1');
        if (rows.length > 0) {
            res.json({ data: rows[0] });
        } else {
            res.status(404).json({ message: 'Data sekolah tidak ditemukan' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal mengambil data sekolah' });
    }
});

module.exports = router;