const express = require('express');
const router = express.Router();
const subTipoController = require('../controllers/subTipoController');
const { verifyToken } = require('../../auth/middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     SubTipo:
 *       type: object
 *       properties:
 *         id_sub_tipo:
 *           type: integer
 *           description: ID único del sub-tipo
 *         tipo:
 *           type: integer
 *           description: ID del tipo padre
 *         sub_tipo_nombre:
 *           type: string
 *           description: Nombre del sub-tipo
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         tipo_nombre:
 *           type: string
 *           description: Nombre del tipo padre
 *       example:
 *         id_sub_tipo: 1
 *         tipo: 1
 *         sub_tipo_nombre: "Lectura de Palabras"
 *         created_at: "2024-01-15T10:35:00.000Z"
 *         updated_at: "2024-01-15T10:35:00.000Z"
 *         tipo_nombre: "Lectura"
 * 
 *     SubTipoInput:
 *       type: object
 *       required:
 *         - tipo
 *         - sub_tipo_nombre
 *       properties:
 *         tipo:
 *           type: integer
 *           description: ID del tipo padre
 *         sub_tipo_nombre:
 *           type: string
 *           maxLength: 100
 *           description: Nombre del sub-tipo
 *       example:
 *         tipo: 1
 *         sub_tipo_nombre: "Lectura Comprensiva"
 */

/**
 * @swagger
 * /api/subtipos/crear:
 *   post:
 *     summary: Crear un nuevo sub-tipo de ejercicio
 *     tags: [Sub-tipos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubTipoInput'
 *           example:
 *             tipo: 1
 *             sub_tipo_nombre: "Lectura Comprensiva"
 *     responses:
 *       201:
 *         description: Sub-tipo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sub-tipo creado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_sub_tipo:
 *                       type: integer
 *                     tipo:
 *                       type: integer
 *                     sub_tipo_nombre:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *             example:
 *               success: true
 *               message: "Sub-tipo creado exitosamente"
 *               data:
 *                 id_sub_tipo: 13
 *                 tipo: 1
 *                 sub_tipo_nombre: "Lectura Comprensiva"
 *                 created_at: "2024-01-15T14:30:00.000Z"
 *                 updated_at: "2024-01-15T14:30:00.000Z"
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Ya existe un sub-tipo con ese nombre para este tipo"
 *       401:
 *         description: No autorizado
 */
router.post('/crear', verifyToken, subTipoController.createSubTipo);

/**
 * @swagger
 * /api/subtipos/listado:
 *   get:
 *     summary: Obtener todos los sub-tipos de ejercicio
 *     tags: [Sub-tipos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de tipo específico
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de sub-tipos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sub-tipos obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubTipo'
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 filtered_by_tipo:
 *                   type: integer
 *                   example: 1
 *             example:
 *               success: true
 *               message: "Sub-tipos obtenidos exitosamente"
 *               count: 3
 *               filtered_by_tipo: 1
 *               data:
 *                 - id_sub_tipo: 1
 *                   tipo: 1
 *                   sub_tipo_nombre: "Lectura de Palabras"
 *                   created_at: "2024-01-15T10:35:00.000Z"
 *                   updated_at: "2024-01-15T10:35:00.000Z"
 *                   tipo_nombre: "Lectura"
 *                 - id_sub_tipo: 2
 *                   tipo: 1
 *                   sub_tipo_nombre: "Lectura de Pseudopalabras"
 *                   created_at: "2024-01-15T10:36:00.000Z"
 *                   updated_at: "2024-01-15T10:36:00.000Z"
 *                   tipo_nombre: "Lectura"
 *       401:
 *         description: No autorizado
 */
router.get('/listado', verifyToken, subTipoController.getAllSubTipos);

/**
 * @swagger
 * /api/subtipos/obtener/{id}:
 *   get:
 *     summary: Obtener un sub-tipo específico por ID
 *     tags: [Sub-tipos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del sub-tipo
 *         example: 1
 *     responses:
 *       200:
 *         description: Sub-tipo obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sub-tipo obtenido exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/SubTipo'
 *             example:
 *               success: true
 *               message: "Sub-tipo obtenido exitosamente"
 *               data:
 *                 id_sub_tipo: 1
 *                 tipo: 1
 *                 sub_tipo_nombre: "Lectura de Palabras"
 *                 created_at: "2024-01-15T10:35:00.000Z"
 *                 updated_at: "2024-01-15T10:35:00.000Z"
 *                 tipo_nombre: "Lectura"
 *       404:
 *         description: Sub-tipo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Sub-tipo no encontrado"
 *       401:
 *         description: No autorizado
 */
router.get('/obtener/:id', verifyToken, subTipoController.getSubTipoById);

/**
 * @swagger
 * /api/subtipos/por-tipo/{tipo_id}:
 *   get:
 *     summary: Obtener sub-tipos de un tipo específico
 *     tags: [Sub-tipos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo
 *         example: 1
 *     responses:
 *       200:
 *         description: Sub-tipos del tipo obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sub-tipos obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubTipo'
 *                 count:
 *                   type: integer
 *                 tipo_id:
 *                   type: integer
 *             example:
 *               success: true
 *               message: "Sub-tipos obtenidos exitosamente"
 *               count: 3
 *               tipo_id: 1
 *               data:
 *                 - id_sub_tipo: 1
 *                   tipo: 1
 *                   sub_tipo_nombre: "Lectura de Palabras"
 *                   created_at: "2024-01-15T10:35:00.000Z"
 *                   updated_at: "2024-01-15T10:35:00.000Z"
 *                   tipo_nombre: "Lectura"
 *       401:
 *         description: No autorizado
 */
router.get('/por-tipo/:tipo_id', verifyToken, subTipoController.getSubTiposByTipo);

/**
 * @swagger
 * /api/subtipos/actualizar/{id}:
 *   put:
 *     summary: Actualizar un sub-tipo existente
 *     tags: [Sub-tipos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del sub-tipo
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: integer
 *               sub_tipo_nombre:
 *                 type: string
 *                 maxLength: 100
 *           example:
 *             sub_tipo_nombre: "Lectura de Palabras Avanzada"
 *     responses:
 *       200:
 *         description: Sub-tipo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sub-tipo actualizado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_sub_tipo:
 *                       type: integer
 *                     tipo:
 *                       type: integer
 *                     sub_tipo_nombre:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *             example:
 *               success: true
 *               message: "Sub-tipo actualizado exitosamente"
 *               data:
 *                 id_sub_tipo: 1
 *                 tipo: 1
 *                 sub_tipo_nombre: "Lectura de Palabras Avanzada"
 *                 created_at: "2024-01-15T10:35:00.000Z"
 *                 updated_at: "2024-01-15T14:45:00.000Z"
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Sub-tipo no encontrado
 *       401:
 *         description: No autorizado
 */
router.put('/actualizar/:id', verifyToken, subTipoController.updateSubTipo);

/**
 * @swagger
 * /api/subtipos/eliminar/{id}:
 *   delete:
 *     summary: Eliminar un sub-tipo
 *     tags: [Sub-tipos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del sub-tipo
 *         example: 1
 *     responses:
 *       200:
 *         description: Sub-tipo eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sub-tipo eliminado exitosamente"
 *             example:
 *               success: true
 *               message: "Sub-tipo eliminado exitosamente"
 *       400:
 *         description: No se puede eliminar (tiene ejercicios asociados)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "No se puede eliminar el sub-tipo porque tiene ejercicios asociados"
 *       404:
 *         description: Sub-tipo no encontrado
 *       401:
 *         description: No autorizado
 */
router.delete('/eliminar/:id', verifyToken, subTipoController.deleteSubTipo);

/**
 * @swagger
 * /api/subtipos/buscar:
 *   get:
 *     summary: Buscar sub-tipos por nombre
 *     tags: [Sub-tipos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *         example: "palabras"
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de tipo específico
 *         example: 1
 *     responses:
 *       200:
 *         description: Búsqueda completada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Búsqueda completada exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubTipo'
 *                 count:
 *                   type: integer
 *                 search_term:
 *                   type: string
 *                 filtered_by_tipo:
 *                   type: integer
 *             example:
 *               success: true
 *               message: "Búsqueda completada exitosamente"
 *               count: 2
 *               search_term: "palabras"
 *               filtered_by_tipo: 1
 *               data:
 *                 - id_sub_tipo: 1
 *                   tipo: 1
 *                   sub_tipo_nombre: "Lectura de Palabras"
 *                   created_at: "2024-01-15T10:35:00.000Z"
 *                   updated_at: "2024-01-15T10:35:00.000Z"
 *                   tipo_nombre: "Lectura"
 *       400:
 *         description: Término de búsqueda requerido
 *       401:
 *         description: No autorizado
 */
router.get('/buscar', verifyToken, subTipoController.searchSubTipos);

/**
 * @swagger
 * /api/subtipos/conteo-por-tipo:
 *   get:
 *     summary: Obtener conteo de sub-tipos por tipo
 *     tags: [Sub-tipos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conteo obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Conteo obtenido exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_tipo:
 *                         type: integer
 *                       tipo_nombre:
 *                         type: string
 *                       cantidad_subtipos:
 *                         type: string
 *             example:
 *               success: true
 *               message: "Conteo obtenido exitosamente"
 *               data:
 *                 - id_tipo: 1
 *                   tipo_nombre: "Lectura"
 *                   cantidad_subtipos: "3"
 *                 - id_tipo: 2
 *                   tipo_nombre: "Escritura"
 *                   cantidad_subtipos: "3"
 *       401:
 *         description: No autorizado
 */
router.get('/conteo-por-tipo', verifyToken, subTipoController.getSubTiposCountByTipo);

/**
 * @swagger
 * /api/subtipos/verificar-existencia:
 *   get:
 *     summary: Verificar si existe un sub-tipo con el mismo nombre en el tipo
 *     tags: [Sub-tipos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sub_tipo_nombre
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del sub-tipo a verificar
 *         example: "Lectura de Palabras"
 *       - in: query
 *         name: tipo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo
 *         example: 1
 *       - in: query
 *         name: exclude_id
 *         schema:
 *           type: integer
 *         description: ID a excluir de la verificación (para updates)
 *         example: 2
 *     responses:
 *       200:
 *         description: Verificación completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Verificación completada"
 *                 data:
 *                   type: object
 *                   properties:
 *                     exists:
 *                       type: boolean
 *                     sub_tipo_nombre:
 *                       type: string
 *                     tipo:
 *                       type: integer
 *             example:
 *               success: true
 *               message: "Verificación completada"
 *               data:
 *                 exists: true
 *                 sub_tipo_nombre: "Lectura de Palabras"
 *                 tipo: 1
 *       400:
 *         description: Parámetros requeridos faltantes
 *       401:
 *         description: No autorizado
 */
router.get('/verificar-existencia', verifyToken, subTipoController.checkSubTipoExists);

/**
 * @swagger
 * /api/subtipos/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de sub-tipos
 *     tags: [Sub-tipos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de sub-tipos obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Estadísticas de sub-tipos obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_subtipos:
 *                       type: integer
 *                     total_tipos_con_subtipos:
 *                       type: integer
 *                     tipos_sin_subtipos:
 *                       type: integer
 *                     promedio_subtipos_por_tipo:
 *                       type: string
 *                     detalle_por_tipo:
 *                       type: array
 *                     subtipos_por_tipo:
 *                       type: object
 *             example:
 *               success: true
 *               message: "Estadísticas de sub-tipos obtenidas exitosamente"
 *               data:
 *                 total_subtipos: 12
 *                 total_tipos_con_subtipos: 4
 *                 tipos_sin_subtipos: 1
 *                 promedio_subtipos_por_tipo: "2.40"
 *                 detalle_por_tipo:
 *                   - id_tipo: 1
 *                     tipo_nombre: "Lectura"
 *                     cantidad_subtipos: "3"
 *                 subtipos_por_tipo:
 *                   "Lectura":
 *                     - id_sub_tipo: 1
 *                       tipo: 1
 *                       sub_tipo_nombre: "Lectura de Palabras"
 *       401:
 *         description: No autorizado
 */
router.get('/estadisticas', verifyToken, subTipoController.getSubTiposStats);

module.exports = router;
