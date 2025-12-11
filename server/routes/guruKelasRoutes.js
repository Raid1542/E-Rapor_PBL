const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const guruKelasController = require('../controllers/guruKelasController');

// ambil data kelas yang diampu guru
router.get('/kelas', authenticate, authorize(['guru kelas']), guruKelasController.getKelasSaya);

module.exports = router;