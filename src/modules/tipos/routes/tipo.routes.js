const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../auth/middleware/authMiddleware');
const TipoController = require('../controllers/tipoController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Tipo:
 *       type: object
 *       properties:
 *         id_tipo:
 *           type: integer
 *           example: 1
 *         tipo_nombre:
 *           type: string
 *           example: "Lectura"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-08-13T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2025-08-13T10:30:00Z"
 */

/**
 * @swagger
 * /api/tipos/listado:
 *   get:
 *     tags: [Tipos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: include_subtipos
 *         schema:
 *           type: boolean
 *         description: Incluir sub-tipos en la respuesta
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Tipos obtenidos exitosamente"
 *               count: 2
 *               data: [
 *                 {
 *                   "id_tipo": 1,
 *                   "tipo_nombre": "Lectura",
 *                   "created_at": "2025-08-13T10:30:00Z",
 *                   "updated_at": "2025-08-13T10:30:00Z"
 *                 },
 *                 {
 *                   "id_tipo": 2,
 *                   "tipo_nombre": "Escritura",
 *                   "created_at": "2025-08-13T10:35:00Z",
 *                   "updated_at": "2025-08-13T10:35:00Z"
 *                 }
 *               ]
 */
router.get('/listado', verifyToken, TipoController.listado);

/**
 * @swagger
 * /api/tipos/obtener/{id}:
 *   get:
 *     tags: [Tipos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: include_subtipos
 *         schema:
 *           type: boolean
 *         description: Incluir sub-tipos en la respuesta
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Tipo obtenido exitosamente"
 *               data: {
 *                 "id_tipo": 1,
 *                 "tipo_nombre": "Lectura",
 *                 "created_at": "2025-08-13T10:30:00Z",
 *                 "updated_at": "2025-08-13T10:30:00Z"
 *               }
 */
router.get('/obtener/:id', verifyToken, TipoController.obtenerPorId);

/**
 * @swagger
 * /api/tipos/crear:
 *   post:
 *     tags: [Tipos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             tipo_nombre: "Escritura Creativa"
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Tipo creado exitosamente"
 *               data: {
 *                 "id_tipo": 6,
 *                 "tipo_nombre": "Escritura Creativa",
 *                 "created_at": "2025-08-13T14:30:00Z",
 *                 "updated_at": "2025-08-13T14:30:00Z"
 *               }
 */
router.post('/crear', verifyToken, TipoController.crear);

/**
 * @swagger
 * /api/tipos/actualizar/{id}:
 *   put:
 *     tags: [Tipos]
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
 *             tipo_nombre: "Lectura Avanzada"
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Tipo actualizado exitosamente"
 *               data: {
 *                 "id_tipo": 1,
 *                 "tipo_nombre": "Lectura Avanzada",
 *                 "created_at": "2025-08-13T10:30:00Z",
 *                 "updated_at": "2025-08-13T15:45:00Z"
 *               }
 */
router.put('/actualizar/:id', verifyToken, TipoController.actualizar);

/**
 * @swagger
 * /api/tipos/eliminar/{id}:
 *   delete:
 *     tags: [Tipos]
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
 *               success: true
 *               message: "Tipo eliminado exitosamente"
 *               data: {
 *                 "id_tipo": 1,
 *                 "tipo_nombre": "Lectura"
 *               }
 */
router.delete('/eliminar/:id', verifyToken, TipoController.eliminar);

/**
 * @swagger
 * /api/tipos/buscar:
 *   get:
 *     tags: [Tipos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Búsqueda completada exitosamente"
 *               count: 1
 *               data: [
 *                 {
 *                   "id_tipo": 1,
 *                   "tipo_nombre": "Lectura",
 *                   "created_at": "2025-08-13T10:30:00Z",
 *                   "updated_at": "2025-08-13T10:30:00Z"
 *                 }
 *               ]
 */
router.get('/buscar', verifyToken, TipoController.buscar);

/**
 * @swagger
 * /api/tipos/estadisticas:
 *   get:
 *     tags: [Tipos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Estadísticas obtenidas exitosamente"
 *               data: {
 *                 "total_tipos": 5,
 *                 "total_subtipos": 15,
 *                 "promedio_subtipos_por_tipo": 3
 *               }
 */
router.get('/estadisticas', verifyToken, TipoController.estadisticas);

module.exports = router;
