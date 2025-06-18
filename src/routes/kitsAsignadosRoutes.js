const express = require('express');
const router = express.Router();
const kitsAsignadosController = require('../controllers/kitsAsignadosController');

router.post('/', kitsAsignadosController.asignarKit);
router.get('/', kitsAsignadosController.obtenerAsignaciones);
router.put('/:id', kitsAsignadosController.editarEstadoAsignacion);
router.delete('/:id', kitsAsignadosController.eliminarAsignacion);

module.exports = router;
