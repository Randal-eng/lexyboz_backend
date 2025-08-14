const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../auth/middleware/authMiddleware');
const SubTipoController = require('../controllers/subTipoController');

/**
 * @swagger
 * components:
 *   schemas:
 *     SubTipo:
 *       type: object
 *       properties:
 *         id_sub_tipo:
 *           type: integer
 *           example: 1
 *         sub_tipo_nombre:
 *           type: string
 *           example: "Lectura de Palabras"
 *         tipo_id:
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
 * /api/subtipos/listado:
 *   get:
 *     tags: [SubTipos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Sub-tipos obtenidos exitosamente"
 *               count: 3
 *               data: [
 *                 {
 *                   "id_sub_tipo": 1,
 *                   "sub_tipo_nombre": "Lectura de Palabras",
 *                   "tipo_id": 1,
 *                   "tipo_nombre": "Lectura",
 *                   "created_at": "2025-08-13T10:30:00Z",
 *                   "updated_at": "2025-08-13T10:30:00Z"
 *                 },
 *                 {
 *                   "id_sub_tipo": 2,
 *                   "sub_tipo_nombre": "Lectura de Frases",
 *                   "tipo_id": 1,
 *                   "tipo_nombre": "Lectura",
 *                   "created_at": "2025-08-13T10:35:00Z",
 *                   "updated_at": "2025-08-13T10:35:00Z"
 *                 }
 *               ]
 */
router.get('/listado', verifyToken, SubTipoController.listado);

/**
 * @swagger
 * /api/subtipos/obtener/{id}:
 *   get:
 *     tags: [SubTipos]
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
 *               message: "Sub-tipo obtenido exitosamente"
 *               data: {
 *                 "id_sub_tipo": 1,
 *                 "sub_tipo_nombre": "Lectura de Palabras",
 *                 "tipo_id": 1,
 *                 "tipo_nombre": "Lectura",
 *                 "created_at": "2025-08-13T10:30:00Z",
 *                 "updated_at": "2025-08-13T10:30:00Z"
 *               }
 */
router.get('/obtener/:id', verifyToken, SubTipoController.obtenerPorId);

/**
 * @swagger
 * /api/subtipos/por-tipo/{tipo_id}:
 *   get:
 *     tags: [SubTipos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Sub-tipos del tipo obtenidos exitosamente"
 *               count: 2
 *               data: [
 *                 {
 *                   "id_sub_tipo": 1,
 *                   "sub_tipo_nombre": "Lectura de Palabras",
 *                   "tipo_id": 1,
 *                   "tipo_nombre": "Lectura",
 *                   "created_at": "2025-08-13T10:30:00Z",
 *                   "updated_at": "2025-08-13T10:30:00Z"
 *                 }
 *               ]
 */
router.get('/por-tipo/:tipo_id', verifyToken, SubTipoController.obtenerPorTipo);

/**
 * @swagger
 * /api/subtipos/crear:
 *   post:
 *     tags: [SubTipos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             tipo_id: 1
 *             sub_tipo_nombre: "Lectura de Párrafos"
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Sub-tipo creado exitosamente"
 *               data: {
 *                 "id_sub_tipo": 10,
 *                 "tipo": 1,
 *                 "sub_tipo_nombre": "Lectura de Párrafos",
 *                 "created_at": "2025-08-13T14:30:00Z",
 *                 "updated_at": "2025-08-13T14:30:00Z"
 *               }
 */
router.post('/crear', verifyToken, SubTipoController.crear);

/**
 * @swagger
 * /api/subtipos/actualizar/{id}:
 *   put:
 *     tags: [SubTipos]
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
 *             sub_tipo_nombre: "Lectura Avanzada de Palabras"
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Sub-tipo actualizado exitosamente"
 *               data: {
 *                 "id_sub_tipo": 1,
 *                 "tipo": 1,
 *                 "sub_tipo_nombre": "Lectura Avanzada de Palabras",
 *                 "created_at": "2025-08-13T10:30:00Z",
 *                 "updated_at": "2025-08-13T15:45:00Z"
 *               }
 */
router.put('/actualizar/:id', verifyToken, SubTipoController.actualizar);

/**
 * @swagger
 * /api/subtipos/eliminar/{id}:
 *   delete:
 *     tags: [SubTipos]
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
 *               message: "Sub-tipo eliminado exitosamente"
 *               data: {
 *                 "id_sub_tipo": 1,
 *                 "sub_tipo_nombre": "Lectura de Palabras"
 *               }
 */
router.delete('/eliminar/:id', verifyToken, SubTipoController.eliminar);

/**
 * @swagger
 * /api/subtipos/buscar:
 *   get:
 *     tags: [SubTipos]
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
 *                   "id_sub_tipo": 1,
 *                   "sub_tipo_nombre": "Lectura de Palabras",
 *                   "tipo_id": 1,
 *                   "tipo_nombre": "Lectura",
 *                   "created_at": "2025-08-13T10:30:00Z",
 *                   "updated_at": "2025-08-13T10:30:00Z"
 *                 }
 *               ]
 */
router.get('/buscar', verifyToken, SubTipoController.buscar);

/**
 * @swagger
 * /api/subtipos/conteo-por-tipo:
 *   get:
 *     tags: [SubTipos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Conteo por tipo obtenido exitosamente"
 *               count: 3
 *               data: [
 *                 {
 *                   "id_tipo": 1,
 *                   "tipo_nombre": "Lectura",
 *                   "total_subtipos": 5
 *                 },
 *                 {
 *                   "id_tipo": 2,
 *                   "tipo_nombre": "Escritura",
 *                   "total_subtipos": 3
 *                 }
 *               ]
 */
router.get('/conteo-por-tipo', verifyToken, SubTipoController.conteoPorTipo);

/**
 * @swagger
 * /api/subtipos/verificar-existencia:
 *   get:
 *     tags: [SubTipos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: tipo_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: excluir_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Verificación completada"
 *               data: {
 *                 "existe": false,
 *                 "nombre": "Nuevo Sub-tipo",
 *                 "tipo_id": 1
 *               }
 */
router.get('/verificar-existencia', verifyToken, SubTipoController.verificarExistencia);

/**
 * @swagger
 * /api/subtipos/estadisticas:
 *   get:
 *     tags: [SubTipos]
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
 *                 "total_subtipos": 15,
 *                 "tipos_con_subtipos": 5,
 *                 "promedio_subtipos_por_tipo": 3,
 *                 "max_subtipos_por_tipo": 8,
 *                 "min_subtipos_por_tipo": 1
 *               }
 */
router.get('/estadisticas', verifyToken, SubTipoController.estadisticas);

module.exports = router;
