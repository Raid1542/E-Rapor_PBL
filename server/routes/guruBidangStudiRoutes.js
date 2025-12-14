const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const multer = require('multer'); // ✅ Tambahkan ini
const path = require('path');      // ✅ Tambahkan ini
const fs = require('fs');          // ✅ Tambahkan ini
// ✅ Setup folder upload
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Setup storage untuk foto profil
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

// ✅ Setup multer
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

const guruBidangStudiController = require('../controllers/guruBidangStudiController');

// Kelas yang diajrkan
router.get('/kelas-yang-diajar', authenticate, guruBidangStudiController.getKelasYangDiajar);

// Profil
router.put('/profil', authenticate, guruBidangStudiController.editProfil);

// Ganti password
router.put('/ganti-password', authenticate, guruBidangStudiController.gantiPassword);

router.put('/upload_foto',authenticate, uploadFoto.single('foto'), guruBidangStudiController.uploadFotoProfil
);

module.exports = router;