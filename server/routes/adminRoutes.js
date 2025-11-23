const express = require('express');
const authenticate = require('../middleware/authenticate'); 
const authorize = require('../middleware/authorize');
const adminController = require('../controllers/adminController'); 

const router = express.Router();

// Hanya Admin yang boleh akses semua route di bawah ini
router.use(authenticate, authorize('Admin'));

// --- Data Guru ---
router.post('/guru', adminController.tambahGuru);
router.put('/guru/:id', adminController.editGuru);

// --- Data Siswa ---
router.post('/siswa', adminController.tambahSiswa);
router.put('/siswa/:id', adminController.editSiswa);

// --- Data Admin ---
router.post('/admin', adminController.tambahAdmin);
router.put('/admin/:id', adminController.editAdmin);

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