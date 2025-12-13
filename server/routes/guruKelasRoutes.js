const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

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
router.put('/kokurikuler/:siswaId', authenticate, guruKelasOnly, guruKelasController.updateKokurikuler);

module.exports = router;