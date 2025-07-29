const express = require('express');
const router = express.Router();
const doctorPacienteController = require('../controllers/doctorPacienteController');

/**
 * @swagger
 * /api/citas/vincular:
 *   post:
 *     summary: Vincula un doctor con un paciente
 *     tags: [Citas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorId:
 *                 type: string
 *                 description: ID del doctor
 *               pacienteId:
 *                 type: string
 *                 description: ID del paciente
 *     responses:
 *       200:
 *         description: Vinculación exitosa
 *       400:
 *         description: Error en la solicitud
 */
router.post('/vincular', doctorPacienteController.vincularDoctorPaciente);

module.exports = router;
