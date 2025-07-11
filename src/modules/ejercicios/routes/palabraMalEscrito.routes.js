const express = require('express');
const router = express.Router();
const palabraMalEscritoController = require('../controllers/palabraMalEscritoController');

router.post('/', palabraMalEscritoController.crearReactivo);
router.get('/', palabraMalEscritoController.obtenerReactivos);

module.exports = router;
