const express = require('express');
const router = express.Router();
const ejerciciosKitsController = require('../controllers/ejerciciosKitsController');

router.post('/agregar', ejerciciosKitsController.agregarEjercicioAKit);
router.delete('/eliminar', ejerciciosKitsController.eliminarEjercicioDeKit);
router.get('/kit/:kit_id', ejerciciosKitsController.obtenerEjerciciosPorKit);

module.exports = router;
