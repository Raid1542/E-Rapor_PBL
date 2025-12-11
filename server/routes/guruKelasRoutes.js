const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const guruKelasController = require('../controllers/guruKelasController');

// ambil data kelas yang diampu guru
router.get('/kelas', authenticate, guruKelasController.getKelasSaya);

// Profil
router.put('/profil', authenticate, guruKelasController.editProfil);

// Gnati password
router.put('/ganti-password', authenticate, guruKelasController.gantiPassword);

module.exports = router;