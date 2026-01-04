const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const fotoProfilStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
            return cb(new Error('Format file tidak didukung'));
        }
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `profil_${uniqueSuffix}${ext}`);
    }
});

const uploadFoto = multer({
    storage: fotoProfilStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
            return cb(new Error('Hanya file .png, .jpg, .jpeg, .webp yang diizinkan'), false);
        }
        cb(null, true);
    }
});

const guruKelasController = require('../controllers/guruKelasController');

// Middleware: hanya user dengan role 'guru_kelas' yang diizinkan
const guruKelasOnly = authorize(['guru kelas']);


// Ambil data siswa berdasarkan kelas
router.get('/kelas', authenticate, guruKelasOnly, guruKelasController.getKelasSaya);
router.get('/siswa', authenticate, guruKelasOnly, guruKelasController.getSiswaByKelas);

// Profil Guru Kelas
router.put('/profil', authenticate, guruKelasOnly, guruKelasController.editProfil);
router.put('/ganti-password', authenticate, guruKelasOnly, guruKelasController.gantiPassword);

// Absensi
router.get('/absensi', authenticate, guruKelasOnly, guruKelasController.getAbsensiTotal);
router.put('/absensi/:siswa_id', authenticate, guruKelasOnly, guruKelasController.updateAbsensiTotal);

// Catatan Wali Kelas
router.get('/catatan-wali-kelas', authenticate, guruKelasOnly, guruKelasController.getCatatanWaliKelas);
router.put('/catatan-wali-kelas/:siswa_id', authenticate, guruKelasOnly, guruKelasController.updateCatatanWaliKelas);

// Ekstrakurikuler
router.get('/ekskul', authenticate, guruKelasOnly, guruKelasController.getEkskulSiswa);
router.put('/ekskul/:siswaId', authenticate, guruKelasOnly, guruKelasController.updateEkskulSiswa);

// Kokurikuler
router.get('/kokurikuler', authenticate, guruKelasOnly, guruKelasController.getKokurikuler);

// Validasi parameter siswaId
router.put('/kokurikuler/:siswaId', authenticate, guruKelasOnly, (req, res, next) => {
    const siswaId = parseInt(req.params.siswaId);
    if (isNaN(siswaId) || siswaId <= 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'ID siswa tidak valid' 
        });
    }
    next();
}, guruKelasController.updateKokurikuler);

// Foto Profil
router.put('/upload_foto', authenticate, uploadFoto.single('foto'), guruKelasController.uploadFotoProfil);

// Nilai
router.get('/mapel', authenticate, guruKelasOnly, guruKelasController.getMapelForGuruKelas);
router.get('/nilai/:mapelId', authenticate, guruKelasOnly, guruKelasController.getNilaiByMapel);
router.post('/nilai', authenticate, guruKelasOnly, guruKelasController.simpanNilai);

// ====== ATUR PENILAIAN ======

// 1. Atur Kategori Nilai Akademik (HANYA untuk mata pelajaran, TIDAK PAKAI GRADE)
router.get('/atur-penilaian/kategori-akademik', authenticate, guruKelasOnly, guruKelasController.getKategoriNilaiAkademik);
router.post('/atur-penilaian/kategori-akademik', authenticate, guruKelasOnly, guruKelasController.createKategoriNilaiAkademik);
router.put('/atur-penilaian/kategori-akademik/:id', authenticate, guruKelasOnly, (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'ID kategori tidak valid' });
    }
    next();
}, guruKelasController.updateKategoriNilaiAkademik);
router.delete('/atur-penilaian/kategori-akademik/:id', authenticate, guruKelasOnly, (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'ID kategori tidak valid' });
    }
    next();
}, guruKelasController.deleteKategoriNilaiAkademik);

// 2. Atur Bobot Penilaian Akademik per Mata Pelajaran
router.get('/atur-penilaian/bobot-akademik/:mapelId', authenticate, guruKelasOnly, (req, res, next) => {
    const mapelId = parseInt(req.params.mapelId);
    if (isNaN(mapelId) || mapelId <= 0) {
        return res.status(400).json({ success: false, message: 'ID mata pelajaran tidak valid' });
    }
    next();
}, guruKelasController.getBobotAkademikByMapel);

router.put('/atur-penilaian/bobot-akademik/:mapelId', authenticate, guruKelasOnly, (req, res, next) => {
    const mapelId = parseInt(req.params.mapelId);
    if (isNaN(mapelId) || mapelId <= 0) {
        return res.status(400).json({ success: false, message: 'ID mata pelajaran tidak valid' });
    }
    next();
}, guruKelasController.updateBobotAkademikByMapel);

// 3. Atur Kategori Nilai Non-Akademik (Kokurikuler - MENGGUNAKAN GRADE)
router.get('/atur-penilaian/kategori-kokurikuler', authenticate, guruKelasOnly, guruKelasController.getKategoriNilaiKokurikuler);
router.post('/atur-penilaian/kategori-kokurikuler', authenticate, guruKelasOnly, guruKelasController.createKategoriNilaiKokurikuler);
router.put('/atur-penilaian/kategori-kokurikuler/:id', authenticate, guruKelasOnly, (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'ID kategori tidak valid' });
    }
    next();
}, guruKelasController.updateKategoriNilaiKokurikuler);
router.delete('/atur-penilaian/kategori-kokurikuler/:id', authenticate, guruKelasOnly, (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'ID kategori tidak valid' });
    }
    next();
}, guruKelasController.deleteKategoriNilaiKokurikuler);

// 4. Ambil Daftar Komponen Penilaian (UH1, UH2, PTS, PAS, dll)
router.get('/atur-penilaian/komponen', authenticate, guruKelasOnly, guruKelasController.getKomponenPenilaian);
module.exports = router;