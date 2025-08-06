const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const { verifyToken } = require('../../auth/middleware/authMiddleware');

/**
 * @swagger
 * /api/citas/crear-cita:
 *   post:
 *     summary: Crea una nueva cita
 *     tags: [Citas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pacienteId:
 *                 type: string
 *                 description: ID del paciente
 *               doctorId:
 *                 type: string
 *                 description: ID del doctor
 *               fecha:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de la cita
 *     responses:
 *       201:
 *         description: Cita creada exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/crear-cita', verifyToken, citaController.crearCita);
/**
 * @swagger
 * /api/citas/obtener-citas:
 *   get:
 *     summary: Obtiene todas las citas
 *     tags: [Citas]
 *     responses:
 *       200:
 *         description: Lista de citas
 *       400:
 *         description: Error en la solicitud
 */
router.get('/obtener-citas', verifyToken, citaController.obtenerCitas);
/**
 * @swagger
 * /api/citas/obtener-cita-id/{id}:
 *   get:
 *     summary: Obtiene una cita por ID
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la cita
 *     responses:
 *       200:
 *         description: Cita encontrada
 *       404:
 *         description: Cita no encontrada
 */
router.get('/obtener-cita-id/:id', verifyToken, citaController.obtenerCitaPorId);
/**
 * @swagger
 * /api/citas/editar-cita/{id}:
 *   put:
 *     summary: Edita una cita existente
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la cita
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date-time
 *                 description: Nueva fecha y hora de la cita
 *     responses:
 *       200:
 *         description: Cita editada exitosamente
 *       400:
 *         description: Error en la solicitud
 *       404:
 *         description: Cita no encontrada
 */
router.put('/editar-cita/:id', verifyToken, citaController.editarCita);
/**
 * @swagger
 * /api/citas/eliminar-cita/{id}:
 *   delete:
 *     summary: Elimina una cita
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la cita
 *     responses:
 *       200:
 *         description: Cita eliminada exitosamente
 *       404:
 *         description: Cita no encontrada
 */
router.delete('/eliminar-cita/:id', verifyToken, citaController.eliminarCita);

module.exports = router;
