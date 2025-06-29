const express = require('express');
const router = express.Router();
const imagenesController = require('../controllers/imagenesController');

router.post('/', imagenesController.crearImagen);
router.get('/:reactivo_id', imagenesController.obtenerImagenesPorReactivo);

module.exports = router;
