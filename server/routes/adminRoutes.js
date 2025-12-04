const fs = require('fs');
const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const multer = require('multer');
const path = require('path');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Storage untuk logo sekolah
const logoStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!['.png', '.jpg', '.jpeg'].includes(ext)) {
            return cb(new Error('Hanya file .png, .jpg, .jpeg yang diizinkan'));
        }
        cb(null, `logo_sekolah${ext}`);
    }
});

// ✅ Storage untuk import Excel
const excelStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `import_guru_${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const uploadLogo = multer({ storage: logoStorage, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadExcel = multer({
    storage: excelStorage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.xlsx' && ext !== '.xls') {
            return cb(new Error('Hanya file .xlsx atau .xls yang diizinkan'), false);
        }
        cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});

const adminController = require('../controllers/adminController');
const router = express.Router();

// Middleware: hanya admin
router.use(authenticate, authorize('admin'));

const cekTahunAjaranAktif = require('../middleware/cekTahunAjaranAktif');

// --- Data Guru ---
router.post('/guru/import', cekTahunAjaranAktif, uploadExcel.single('file'), adminController.importGuru);
router.get('/guru', cekTahunAjaranAktif, adminController.getGuru);
router.get('/guru/:id', cekTahunAjaranAktif, adminController.getGuruById);
router.post('/guru', cekTahunAjaranAktif, adminController.tambahGuru);
router.put('/guru/:id', cekTahunAjaranAktif, adminController.editGuru);

// --- Data Siswa ---
router.post('/siswa/import', uploadExcel.single('file'), adminController.importSiswa);
router.get('/siswa', adminController.getSiswa);
router.get('/siswa/:id', adminController.getSiswaById);
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
router.post('/sekolah/logo', uploadLogo.single('logo'), adminController.uploadLogo);

// --- Atur Kelas & Guru Kelas ---
router.get('/kelas', adminController.getKelas);
router.get('/kelas/:id', adminController.getKelasById);
router.post('/kelas', adminController.tambahKelas);
router.put('/kelas/:id', adminController.editKelas);
router.delete('/kelas/:id', adminController.hapusKelas);
router.get('/guru-kelas', adminController.getGuruKelasList);
router.post('/kelas/:id/guru', adminController.setWaliKelas);

// --- Tahun Ajaran & Semester ---
router.get('/tahun-ajaran', adminController.getTahunAjaran);
router.post('/tahun-ajaran', adminController.tambahTahunAjaran);
router.put('/tahun-ajaran/:id', adminController.updateTahunAjaran);



module.exports = router;