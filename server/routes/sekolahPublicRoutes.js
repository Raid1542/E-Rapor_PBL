const express = require('express');
const authenticate = require('../middleware/authenticate');
const db = require('../config/db');

const router = express.Router();

// Endpoint PUBIK — untuk halaman login (TANPA authenticate)
router.get('/publik', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT nama_sekolah, logo_path FROM sekolah WHERE id = 1');
        if (rows.length > 0) {
            res.json({
                nama_sekolah: rows[0].nama_sekolah || 'Sekolah',
                logo_path: rows[0].logo_path || null
            });
        } else {
            res.json({
                nama_sekolah: 'Sekolah',
                logo_path: null
            });
        }
    } catch (err) {
        console.error('Error getSekolahPublik:', err);
        res.json({
            nama_sekolah: 'Sekolah',
            logo_path: null
        });
    }
});

// Enpoint TERPROTEKSI
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