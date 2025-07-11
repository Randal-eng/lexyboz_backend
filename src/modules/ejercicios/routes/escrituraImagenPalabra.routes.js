const express = require('express');
const router = express.Router();
const controller = require('../controllers/escrituraImagenPalabraController');

router.post('/', controller.crearReactivo);
router.get('/', controller.obtenerReactivos);

module.exports = router;
