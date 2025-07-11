const express = require('express');
const router = express.Router();
const controller = require('../controllers/escrituraReordenamientoController');

router.post('/', controller.crearReactivo);
router.get('/', controller.obtenerReactivos);

module.exports = router;
