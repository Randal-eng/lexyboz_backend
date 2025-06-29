const express = require('express');
const router = express.Router();
const imagenCorrectoController = require('../controllers/imagenCorrectoController');

router.post('/', imagenCorrectoController.crearReactivo);
router.get('/', imagenCorrectoController.obtenerReactivos);

module.exports = router;
