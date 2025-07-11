const express = require('express');
const router = express.Router();
const paresController = require('../controllers/paresController');

router.post('/', paresController.crearPar);
router.get('/', paresController.obtenerPares);

module.exports = router;
