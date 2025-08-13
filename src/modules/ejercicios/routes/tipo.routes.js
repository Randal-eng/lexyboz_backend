const express = require('express');
const router = express.Router();
const tipoController = require('../controllers/tipoController');
const { verifyToken } = require('../../auth/middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Tipo:
 *       type: object
 *       properties:
 *         id_tipo:
 *           type: integer
 *           description: ID único del tipo
 *         tipo_nombre:
 *           type: string
 *           description: Nombre del tipo de ejercicio
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *       example:
 *         id_tipo: 1
 *         tipo_nombre: "Lectura"
 *         created_at: "2024-01-15T10:30:00.000Z"
 *         updated_at: "2024-01-15T10:30:00.000Z"
 *     
 *     TipoConSubTipos:
 *       type: object
 *       properties:
 *         id_tipo:
 *           type: integer
 *         tipo_nombre:
 *           type: string
 *         tipo_created_at:
 *           type: string
 *           format: date-time
 *         tipo_updated_at:
 *           type: string
 *           format: date-time
 *         sub_tipos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_sub_tipo:
 *                 type: integer
 *               sub_tipo_nombre:
 *                 type: string
 *               created_at:
 *                 type: string
 *                 format: date-time
 *               updated_at:
 *                 type: string
 *                 format: date-time
 *       example:
 *         id_tipo: 1
 *         tipo_nombre: "Lectura"
 *         tipo_created_at: "2024-01-15T10:30:00.000Z"
 *         tipo_updated_at: "2024-01-15T10:30:00.000Z"
 *         sub_tipos:
 *           - id_sub_tipo: 1
 *             sub_tipo_nombre: "Lectura de Palabras"
 *             created_at: "2024-01-15T10:35:00.000Z"
 *             updated_at: "2024-01-15T10:35:00.000Z"
 *           - id_sub_tipo: 2
 *             sub_tipo_nombre: "Lectura de Pseudopalabras"
 *             created_at: "2024-01-15T10:36:00.000Z"
 *             updated_at: "2024-01-15T10:36:00.000Z"
 * 
 *     TipoInput:
 *       type: object
 *       required:
 *         - tipo_nombre
 *       properties:
 *         tipo_nombre:
 *           type: string
 *           maxLength: 100
 *           description: Nombre del tipo de ejercicio
 *       example:
 *         tipo_nombre: "Comprensión Auditiva"
 * 
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *       example:
 *         success: true
 *         message: "Operación exitosa"
 *         data: {}
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error en la operación"
 */

/**
 * @swagger
 * /api/tipos/crear:
 *   post:
 *     summary: Crear un nuevo tipo de ejercicio
 *     tags: [Tipos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TipoInput'
 *           example:
 *             tipo_nombre: "Escritura Creativa"
 *     responses:
 *       201:
 *         description: Tipo creado exitosamente
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
 *                   example: "Tipo creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Tipo'
 *             example:
 *               success: true
 *               message: "Tipo creado exitosamente"
 *               data:
 *                 id_tipo: 6
 *                 tipo_nombre: "Escritura Creativa"
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
 *               message: "Ya existe un tipo con ese nombre"
 *       401:
 *         description: No autorizado
 */
router.post('/crear', verifyToken, tipoController.createTipo);

/**
 * @swagger
 * /api/tipos/listado:
 *   get:
 *     summary: Obtener todos los tipos de ejercicio
 *     tags: [Tipos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: include_subtipos
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Incluir sub-tipos en la respuesta
 *         example: "true"
 *     responses:
 *       200:
 *         description: Lista de tipos obtenida exitosamente
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
 *                   example: "Tipos obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TipoConSubTipos'
 *                 count:
 *                   type: integer
 *                   example: 5
 *             example:
 *               success: true
 *               message: "Tipos obtenidos exitosamente"
 *               count: 2
 *               data:
 *                 - id_tipo: 1
 *                   tipo_nombre: "Lectura"
 *                   tipo_created_at: "2024-01-15T10:30:00.000Z"
 *                   tipo_updated_at: "2024-01-15T10:30:00.000Z"
 *                   sub_tipos:
 *                     - id_sub_tipo: 1
 *                       sub_tipo_nombre: "Lectura de Palabras"
 *                       created_at: "2024-01-15T10:35:00.000Z"
 *                       updated_at: "2024-01-15T10:35:00.000Z"
 *                 - id_tipo: 2
 *                   tipo_nombre: "Escritura"
 *                   tipo_created_at: "2024-01-15T10:31:00.000Z"
 *                   tipo_updated_at: "2024-01-15T10:31:00.000Z"
 *                   sub_tipos: []
 *       401:
 *         description: No autorizado
 */
router.get('/listado', verifyToken, tipoController.getAllTipos);

/**
 * @swagger
 * /api/tipos/obtener/{id}:
 *   get:
 *     summary: Obtener un tipo específico por ID
 *     tags: [Tipos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo
 *         example: 1
 *       - in: query
 *         name: include_subtipos
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Incluir sub-tipos en la respuesta
 *         example: "true"
 *     responses:
 *       200:
 *         description: Tipo obtenido exitosamente
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
 *                   example: "Tipo obtenido exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/TipoConSubTipos'
 *             example:
 *               success: true
 *               message: "Tipo obtenido exitosamente"
 *               data:
 *                 id_tipo: 1
 *                 tipo_nombre: "Lectura"
 *                 created_at: "2024-01-15T10:30:00.000Z"
 *                 updated_at: "2024-01-15T10:30:00.000Z"
 *                 sub_tipos:
 *                   - id_sub_tipo: 1
 *                     sub_tipo_nombre: "Lectura de Palabras"
 *                     created_at: "2024-01-15T10:35:00.000Z"
 *                     updated_at: "2024-01-15T10:35:00.000Z"
 *       404:
 *         description: Tipo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Tipo no encontrado"
 *       401:
 *         description: No autorizado
 */
router.get('/obtener/:id', verifyToken, tipoController.getTipoById);

/**
 * @swagger
 * /api/tipos/actualizar/{id}:
 *   put:
 *     summary: Actualizar un tipo existente
 *     tags: [Tipos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo_nombre:
 *                 type: string
 *                 maxLength: 100
 *           example:
 *             tipo_nombre: "Lectura Avanzada"
 *     responses:
 *       200:
 *         description: Tipo actualizado exitosamente
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
 *                   example: "Tipo actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Tipo'
 *             example:
 *               success: true
 *               message: "Tipo actualizado exitosamente"
 *               data:
 *                 id_tipo: 1
 *                 tipo_nombre: "Lectura Avanzada"
 *                 created_at: "2024-01-15T10:30:00.000Z"
 *                 updated_at: "2024-01-15T14:45:00.000Z"
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Tipo no encontrado
 *       401:
 *         description: No autorizado
 */
router.put('/actualizar/:id', verifyToken, tipoController.updateTipo);

/**
 * @swagger
 * /api/tipos/eliminar/{id}:
 *   delete:
 *     summary: Eliminar un tipo
 *     tags: [Tipos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo
 *         example: 1
 *     responses:
 *       200:
 *         description: Tipo eliminado exitosamente
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
 *                   example: "Tipo eliminado exitosamente"
 *             example:
 *               success: true
 *               message: "Tipo eliminado exitosamente"
 *       400:
 *         description: No se puede eliminar (tiene sub-tipos o ejercicios asociados)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "No se puede eliminar el tipo porque tiene sub-tipos o ejercicios asociados"
 *       404:
 *         description: Tipo no encontrado
 *       401:
 *         description: No autorizado
 */
router.delete('/eliminar/:id', verifyToken, tipoController.deleteTipo);

/**
 * @swagger
 * /api/tipos/buscar:
 *   get:
 *     summary: Buscar tipos por nombre
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
 *         example: "lectura"
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
 *                     $ref: '#/components/schemas/Tipo'
 *                 count:
 *                   type: integer
 *                 search_term:
 *                   type: string
 *             example:
 *               success: true
 *               message: "Búsqueda completada exitosamente"
 *               count: 1
 *               search_term: "lectura"
 *               data:
 *                 - id_tipo: 1
 *                   tipo_nombre: "Lectura"
 *                   created_at: "2024-01-15T10:30:00.000Z"
 *                   updated_at: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Término de búsqueda requerido
 *       401:
 *         description: No autorizado
 */
router.get('/buscar', verifyToken, tipoController.searchTipos);

/**
 * @swagger
 * /api/tipos/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de tipos
 *     tags: [Tipos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
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
 *                   example: "Estadísticas obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_tipos:
 *                       type: integer
 *                     total_subtipos:
 *                       type: integer
 *                     tipos_sin_subtipos:
 *                       type: integer
 *                     promedio_subtipos_por_tipo:
 *                       type: string
 *                     detalle_por_tipo:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_tipo:
 *                             type: integer
 *                           tipo_nombre:
 *                             type: string
 *                           cantidad_subtipos:
 *                             type: integer
 *             example:
 *               success: true
 *               message: "Estadísticas obtenidas exitosamente"
 *               data:
 *                 total_tipos: 5
 *                 total_subtipos: 12
 *                 tipos_sin_subtipos: 1
 *                 promedio_subtipos_por_tipo: "2.40"
 *                 detalle_por_tipo:
 *                   - id_tipo: 1
 *                     tipo_nombre: "Lectura"
 *                     cantidad_subtipos: 3
 *                   - id_tipo: 2
 *                     tipo_nombre: "Escritura"
 *                     cantidad_subtipos: 3
 *       401:
 *         description: No autorizado
 */
router.get('/estadisticas', verifyToken, tipoController.getTiposStats);

module.exports = router;
