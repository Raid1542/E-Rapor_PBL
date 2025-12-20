const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const controller = require('../controllers/guruBidangStudiController');

// Setup upload
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
            return cb(new Error('Format file tidak didukung'));
        }
        cb(null, `profil_${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file .png, .jpg, .jpeg, .webp yang diizinkan'), false);
        }
    }
});

// Middleware: hanya guru bidang studi
const guruBidangStudiOnly = authorize(['guru bidang studi']);

// Profil
router.get('/profil', authenticate, guruBidangStudiOnly, controller.getProfil);
router.put('/profil', authenticate, guruBidangStudiOnly, controller.editProfil);
router.put('/ganti-password', authenticate, guruBidangStudiOnly, controller.gantiPassword);
router.put('/upload_foto', authenticate, guruBidangStudiOnly, upload.single('foto'), controller.uploadFotoProfil);

// Dashboard
router.get('/dashboard', authenticate, guruBidangStudiOnly, controller.getDashboardData);

// ===== ATUR PENILAIAN =====

// Ambil daftar mata pelajaran yang diajarkan oleh guru bidang studi (aktif, tahun ajaran sekarang)
router.get('/atur-penilaian/mapel', authenticate, guruBidangStudiOnly, controller.getDaftarMapel);

// Ambil daftar kelas yang diajar oleh guru bidang studi (untuk dropdown kelas)
router.get('/atur-penilaian/kelas', authenticate, guruBidangStudiOnly, controller.getDaftarKelas);

// Ambil komponen penilaian (UH, PTS, PAS) — bisa global atau dari setting sekolah
router.get('/atur-penilaian/komponen', authenticate, guruBidangStudiOnly, controller.getKomponenPenilaian);

// Ambil bobot penilaian per mapel
router.get('/atur-penilaian/bobot/:mapelId', authenticate, guruBidangStudiOnly, controller.getBobotPenilaian);

// Simpan/ubah bobot penilaian per mapel
router.put('/atur-penilaian/bobot/:mapelId', authenticate, guruBidangStudiOnly, controller.updateBobotPenilaian);

// Ambil kategori akademik (hanya akademik!)
router.get('/atur-penilaian/kategori', authenticate, guruBidangStudiOnly, controller.getKategoriAkademik);

// Tambah/edit/hapus kategori akademik
router.post('/atur-penilaian/kategori', authenticate, guruBidangStudiOnly, controller.createKategoriAkademik);
router.put('/atur-penilaian/kategori/:id', authenticate, guruBidangStudiOnly, controller.updateKategoriAkademik);
router.delete('/atur-penilaian/kategori/:id', authenticate, guruBidangStudiOnly, controller.deleteKategoriAkademik);

// ===== INPUT NILAI =====

// Endpoint untuk mendapatkan daftar siswa dan nilai berdasarkan mapel dan kelas
router.get('/nilai/:mapelId/:kelasId', authenticate, guruBidangStudiOnly, controller.getNilaiByMapelAndKelas);

// Endpoint untuk menyimpan nilai
router.post('/nilai', authenticate, guruBidangStudiOnly, controller.simpanNilai);

// Endpoint untuk edit nilai
router.put('/nilai-komponen/:mapelId/:siswaId', authenticate, guruBidangStudiOnly, controller.simpanNilaiKomponenBanyak);

module.exports = router;