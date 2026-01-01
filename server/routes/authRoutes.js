/**
 * Nama File: authRoutes.js
 * Fungsi: Mendefinisikan rute autentikasi pengguna, khususnya login.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 1 Oktober 2025
 */

const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Endpoint untuk login pengguna
router.post('/login', authController.login);

module.exports = router;