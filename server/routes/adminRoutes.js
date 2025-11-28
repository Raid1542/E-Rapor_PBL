const fs = require('fs');
const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const multer = require('multer');
const path = require('path');

// ✅ Buat folder jika belum ada
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // gunakan variabel yang sudah dicek
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        // Validasi ekstensi (opsional tapi direkomendasikan)
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return cb(new Error('Hanya file .png, .jpg, .jpeg yang diizinkan'), false);
        }
        cb(null, `logo_sekolah${ext}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // max 2MB
});

const adminController = require('../controllers/adminController');
const router = express.Router();


// Hanya Admin yang boleh akses semua route di bawah ini
router.use(authenticate, authorize('admin'));

// --- Data Guru ---
router.get('/guru', adminController.getGuru);
router.get('/guru/:id', adminController.getGuruById);
router.post('/guru', adminController.tambahGuru);
router.put('/guru/:id', adminController.editGuru);
router.delete('/guru/:id', adminController.hapusGuru);

// --- Data Siswa ---
router.post('/siswa', adminController.tambahSiswa);
router.put('/siswa/:id', adminController.editSiswa);

// --- Data Admin ---
router.get('/admin', adminController.getAdmin);
router.get('/admin/:id', adminController.getAdminById);
router.post('/admin', adminController.tambahAdmin);
router.put('/admin/:id', adminController.editAdmin);
router.delete('/admin/:id', adminController.hapusAdmin);

// --- Data Sekolah ---
router.get('/sekolah', adminController.getSekolah);
router.put('/sekolah', adminController.editSekolah);
router.post('/sekolah/logo', upload.single('logo'), adminController.uploadLogo);

// --- Atur Kelas & Guru Kelas ---
router.post('/kelas', adminController.aturKelas);

// --- Ekstrakurikuler ---
router.post('/ekskul', adminController.kelolaEkskul);

// --- Lihat & Unduh Rapor ---
router.get('/rapor/:siswaId', adminController.lihatRapor);

// --- Tahun Ajaran & Semester ---
router.post('/tahun-ajaran', adminController.aturTahunAjaran);

// --- Kurikulum & Mata Pelajaran ---
router.post('/mata-pelajaran', adminController.aturMataPelajaran);

module.exports = router;