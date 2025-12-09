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
const adminOnly = [authenticate, authorize('admin')];
const adminOnlyWithTahunAjaran = [...adminOnly, require('../middleware/cekTahunAjaranAktif')];

// --- Data Guru ---
router.post('/guru/import', adminOnly, uploadExcel.single('file'), adminController.importGuru);
router.get('/guru', adminOnly, adminController.getGuru);
router.get('/guru/:id', adminOnly, adminController.getGuruById);
router.post('/guru', adminOnly, adminController.tambahGuru);
router.put('/guru/:id', adminOnly, adminController.editGuru);

// --- Data Siswa ---
router.post('/siswa/import', adminOnlyWithTahunAjaran, uploadExcel.single('file'), adminController.importSiswa);
router.get('/siswa', adminOnly, adminController.getSiswa);
router.get('/siswa/:id', adminOnly, adminController.getSiswaById);
router.post('/siswa', adminOnlyWithTahunAjaran, adminController.tambahSiswa);
router.put('/siswa/:id', adminOnlyWithTahunAjaran, adminController.editSiswa);
// --- Data Admin ---
router.get('/admin', adminOnly, adminController.getAdmin);
router.get('/admin/:id', adminOnly, adminController.getAdminById);
router.post('/admin', adminOnly, adminController.tambahAdmin);
router.put('/admin/:id', adminOnly, adminController.editAdmin);
router.delete('/admin/:id', adminOnly, adminController.hapusAdmin);

// --- Data Sekolah ---
router.get('/sekolah', adminOnly, adminController.getSekolah);
router.put('/sekolah', adminOnly, adminController.editSekolah);
router.post('/sekolah/logo', adminOnly, uploadLogo.single('logo'), adminController.uploadLogo);

// --- Atur Kelas & Guru Kelas ---
router.get('/kelas', adminOnly, adminController.getKelas);
router.get('/kelas/:id', adminOnly, adminController.getKelasById);
router.post('/kelas', adminOnlyWithTahunAjaran, adminController.tambahKelas);
router.put('/kelas/:id', adminOnlyWithTahunAjaran, adminController.editKelas);
router.delete('/kelas/:id', adminOnlyWithTahunAjaran, adminController.hapusKelas);
router.get('/dropdown', adminOnlyWithTahunAjaran, adminController.getKelasForDropdown);

// -- Guru Kelas --
router.get('/guru-kelas', adminOnly, adminController.getGuruKelasList);
router.get('/kelas/:id/wali-kelas', adminOnly, adminController.getWaliKelas);
router.post('/kelas/:id/guru', adminOnlyWithTahunAjaran, adminController.setWaliKelas);

// --- Tahun Ajaran & Semester ---
router.get('/tahun-ajaran', adminOnly, adminController.getTahunAjaran);
router.post('/tahun-ajaran', adminOnly, adminController.tambahTahunAjaran);
router.put('/tahun-ajaran/:id', adminOnly, adminController.updateTahunAjaran);

// --- Mata Pelajaran ---
router.get('/mata-pelajaran', adminOnly, adminController.getMataPelajaran);
router.get('/mata-pelajaran/:id', adminOnly, adminController.getMataPelajaranById);
router.post('/mata-pelajaran', adminOnly, adminController.tambahMataPelajaran);
router.put('/mata-pelajaran/:id', adminOnly, adminController.editMataPelajaran);
router.delete('/mata-pelajaran/:id', adminOnly, adminController.hapusMataPelajaran);

// --- PEMBELAJARAN ---
router.get('/pembelajaran', adminOnlyWithTahunAjaran, adminController.getPembelajaran);
router.get('/pembelajaran/dropdown', adminOnlyWithTahunAjaran, adminController.getDropdownPembelajaran);
router.post('/pembelajaran', adminOnlyWithTahunAjaran, adminController.tambahPembelajaran);
router.put('/pembelajaran/:id', adminOnlyWithTahunAjaran, adminController.editPembelajaran);
router.delete('/pembelajaran/:id', adminOnlyWithTahunAjaran, adminController.hapusPembelajaran);

// --- EKSTRAKURIKULER ---
// CRUD Ekstrakurikuler
router.get('/ekstrakurikuler', adminOnly, adminController.getEkskul);
router.post('/ekstrakurikuler', adminOnlyWithTahunAjaran, adminController.tambahEkskul);
router.put('/ekstrakurikuler/:id', adminOnlyWithTahunAjaran, adminController.editEkskul);
router.delete('/ekstrakurikuler/:id', adminOnlyWithTahunAjaran, adminController.hapusEkskul);

// CRUD Peserta Ekstrakurikuler (Anggota)
/*router.post('/ekstrakurikuler/:id/anggota', adminOnlyWithTahunAjaran, adminController.addPesertaEkskul);
router.put('/ekstrakurikuler/anggota/:id', adminOnly, adminController.updateDeskripsiPeserta);
router.delete('/ekstrakurikuler/anggota/:id', adminOnly, adminController.removePesertaEkskul);*/

// Ambil data tambahan
router.get('/ekstrakurikuler/:id/anggota', adminOnly, adminController.getPesertaByEkskul); // Daftar anggota suatu ekskul
router.get('/siswa/:id/ekstrakurikuler', adminOnly, adminController.getEkskulBySiswa); // Daftar ekskul suatu siswa

module.exports = router;