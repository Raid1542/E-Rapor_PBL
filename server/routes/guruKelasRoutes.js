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
router.get('/kokurikuler/:jenis_penilaian', authenticate, guruKelasOnly, guruKelasController.getKokurikuler);
router.put('/kokurikuler/:siswaId/:jenis_penilaian', authenticate, guruKelasOnly, guruKelasController.updateKokurikuler);

// Foto Profil
router.put('/upload_foto', authenticate, uploadFoto.single('foto'), guruKelasController.uploadFotoProfil);

module.exports = router;