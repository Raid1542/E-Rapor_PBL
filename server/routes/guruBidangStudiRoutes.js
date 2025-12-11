const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const guruBidangStudiController = require('../controllers/guruBidangStudiController');

// Kelas yang diajrkan
router.get('/kelas-yang-diajar', authenticate, guruBidangStudiController.getKelasYangDiajar);

// Profil
router.put('/profil', authenticate, guruBidangStudiController.editProfil);

// Gnati password
router.put('/ganti-password', authenticate, guruBidangStudiController.gantiPassword);

module.exports = router;