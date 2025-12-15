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

module.exports = router;