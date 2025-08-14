const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../auth/middleware/authMiddleware');
const KitAsignadoController = require('../controllers/kitAsignadoController');

/**
 * @swagger
 * components:
 *   schemas:
 *     KitAsignado:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         kit_id:
 *           type: integer
 *           example: 1
 *         paciente_id:
 *           type: integer
 *           example: 1
 *         fecha_asignacion:
 *           type: string
 *           format: date-time
 *           example: "2025-08-13T10:30:00Z"
 *         estado:
 *           type: string
 *           example: "pendiente"
 */

/**
 * @swagger
 * /api/kits-asignados:
 *   post:
 *     tags: [Kits Asignados]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             kitId: 1
 *             pacienteId: 2
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             example:
 *               message: "Kit asignado exitosamente"
 *               asignacion: {
 *                 "id": 1,
 *                 "kit_id": 1,
 *                 "paciente_id": 2,
 *                 "fecha_asignacion": "2025-08-13T10:30:00Z",
 *                 "estado": "pendiente"
 *               }
 */
router.post('/', verifyToken, KitAsignadoController.asignarKit);

/**
 * @swagger
 * /api/kits-asignados:
 *   get:
 *     tags: [Kits Asignados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               message: "Asignaciones obtenidas exitosamente"
 *               data: [
 *                 {
 *                   "id": 1,
 *                   "kit_id": 1,
 *                   "paciente_id": 2,
 *                   "fecha_asignacion": "2025-08-13T10:30:00Z",
 *                   "estado": "pendiente",
 *                   "kit_nombre": "Kit de Lectura Básica",
 *                   "kit_descripcion": "Kit para evaluar habilidades básicas",
 *                   "paciente_nombre": "Juan",
 *                   "paciente_email": "juan.perez@email.com"
 *                 }
 *               ]
 *               pagination: {
 *                 "currentPage": 1,
 *                 "totalPages": 3,
 *                 "totalItems": 50,
 *                 "itemsPerPage": 20
 *               }
 */
router.get('/', verifyToken, KitAsignadoController.obtenerTodasLasAsignaciones);

/**
 * @swagger
 * /api/kits-asignados/{id}:
 *   get:
 *     tags: [Kits Asignados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               message: "Asignación obtenida exitosamente"
 *               asignacion: {
 *                 "id": 1,
 *                 "kit_id": 1,
 *                 "paciente_id": 2,
 *                 "fecha_asignacion": "2025-08-13T10:30:00Z",
 *                 "estado": "pendiente",
 *                 "kit_nombre": "Kit de Lectura Básica",
 *                 "kit_descripcion": "Kit para evaluar habilidades básicas",
 *                 "kit_imagen": "https://cloudinary.com/imagen.jpg",
 *                 "paciente_nombre": "Juan",
 *                 "paciente_email": "juan.perez@email.com"
 *               }
 */
router.get('/:id', verifyToken, KitAsignadoController.obtenerAsignacionPorId);

/**
 * @swagger
 * /api/kits-asignados/paciente/{pacienteId}:
 *   get:
 *     tags: [Kits Asignados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pacienteId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               message: "Asignaciones del paciente obtenidas exitosamente"
 *               data: [
 *                 {
 *                   "id": 1,
 *                   "kit_id": 1,
 *                   "paciente_id": 2,
 *                   "fecha_asignacion": "2025-08-13T10:30:00Z",
 *                   "estado": "pendiente",
 *                   "kit_nombre": "Kit de Lectura Básica",
 *                   "kit_descripcion": "Kit para evaluar habilidades básicas",
 *                   "kit_imagen": "https://cloudinary.com/imagen.jpg"
 *                 }
 *               ]
 *               pagination: {
 *                 "currentPage": 1,
 *                 "totalPages": 2,
 *                 "totalItems": 25,
 *                 "itemsPerPage": 20
 *               }
 */
router.get('/paciente/:pacienteId', verifyToken, KitAsignadoController.obtenerAsignacionesPorPaciente);

/**
 * @swagger
 * /api/kits-asignados/{id}/estado:
 *   put:
 *     tags: [Kits Asignados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             estado: "en_progreso"
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               message: "Estado de asignación actualizado exitosamente"
 *               asignacion: {
 *                 "id": 1,
 *                 "kit_id": 1,
 *                 "paciente_id": 2,
 *                 "fecha_asignacion": "2025-08-13T10:30:00Z",
 *                 "estado": "en_progreso"
 *               }
 */
router.put('/:id/estado', verifyToken, KitAsignadoController.actualizarEstado);

/**
 * @swagger
 * /api/kits-asignados/{id}:
 *   delete:
 *     tags: [Kits Asignados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               message: "Asignación eliminada exitosamente"
 *               asignacion: {
 *                 "id": 1,
 *                 "kit_id": 1,
 *                 "paciente_id": 2,
 *                 "estado": "cancelado"
 *               }
 */
router.delete('/:id', verifyToken, KitAsignadoController.eliminarAsignacion);

module.exports = router;
