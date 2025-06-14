const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');

router.post('/crear-cita', citaController.crearCita);
router.get('/obtener-citas', citaController.obtenerCitas);
router.get('/obtener-cita-id/:id', citaController.obtenerCitaPorId);
router.put('/editar-cita/:id', citaController.editarCita);
router.delete('/eliminar-cita/:id', citaController.eliminarCita);

module.exports = router;
