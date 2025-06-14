const express = require('express');
const router = express.Router();
const doctorPacienteController = require('../controllers/doctorPacienteController');

// Ruta para vincular doctor y paciente
router.post('/vincular', doctorPacienteController.vincularDoctorPaciente);

module.exports = router;
