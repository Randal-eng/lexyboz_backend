const express = require('express');
const router = express.Router();
const ejercicioController = require('../controllers/ejercicioController');

router.post('/', ejercicioController.crearEjercicio);
router.get('/', ejercicioController.obtenerEjercicios);
router.get('/:id', ejercicioController.obtenerEjercicioPorId);
router.put('/:id', ejercicioController.editarEjercicio);
router.delete('/:id', ejercicioController.eliminarEjercicio);

module.exports = router;
