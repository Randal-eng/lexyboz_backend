const express = require('express');
const router = express.Router();
const reactivoController = require('../controllers/reactivoController');
const { verifyToken } = require('../../auth/middleware/authMiddleware');

// =====================================================
// RUTAS DE REACTIVOS
// =====================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     Reactivo:
 *       type: object
 *       required:
 *         - contenido
 *         - sub_tipo_id
 *       properties:
 *         reactivo_id:
 *           type: integer
 *           description: ID único del reactivo
 *           example: 1
 *         contenido:
 *           type: string
 *           description: Contenido del reactivo
 *           example: "palabra"
 *         orden:
 *           type: integer
 *           description: Orden del reactivo
 *           example: 1
 *         sub_tipo_id:
 *           type: integer
 *           description: ID del sub tipo asociado
 *           example: 1
 *         tiempo_limite:
 *           type: integer
 *           description: Tiempo límite en segundos
 *           example: 30
 *         configuracion:
 *           type: object
 *           description: Configuración adicional del reactivo
 *           example: { "dificultad": "medio" }
 *         activo:
 *           type: boolean
 *           description: Estado del reactivo
 *           example: true
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         fecha_actualizacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         sub_tipo_nombre:
 *           type: string
 *           description: Nombre del sub tipo
 *           example: "Pseudopalabras"
 *         tipo_nombre:
 *           type: string
 *           description: Nombre del tipo
 *           example: "Lectura"
 *     ReactivoInput:
 *       type: object
 *       required:
 *         - contenido
 *         - sub_tipo_id
 *       properties:
 *         contenido:
 *           type: string
 *           description: Contenido del reactivo
 *           example: "palabra"
 *         orden:
 *           type: integer
 *           description: Orden del reactivo
 *           example: 1
 *         sub_tipo_id:
 *           type: integer
 *           description: ID del sub tipo
 *           example: 1
 *         tiempo_limite:
 *           type: integer
 *           description: Tiempo límite en segundos
 *           example: 30
 *         configuracion:
 *           type: object
 *           description: Configuración adicional
 *           example: { "dificultad": "medio" }
 *     ReactivoUpdate:
 *       type: object
 *       properties:
 *         contenido:
 *           type: string
 *           description: Nuevo contenido del reactivo
 *         orden:
 *           type: integer
 *           description: Nuevo orden del reactivo
 *         sub_tipo_id:
 *           type: integer
 *           description: Nuevo ID del sub tipo
 *         tiempo_limite:
 *           type: integer
 *           description: Nuevo tiempo límite
 *         configuracion:
 *           type: object
 *           description: Nueva configuración
 *         activo:
 *           type: boolean
 *           description: Nuevo estado del reactivo
 *     ReactivosEjercicio:
 *       type: object
 *       required:
 *         - reactivos
 *       properties:
 *         reactivos:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - reactivo_id
 *             properties:
 *               reactivo_id:
 *                 type: integer
 *                 description: ID del reactivo
 *                 example: 1
 *               orden:
 *                 type: integer
 *                 description: Orden en el ejercicio
 *                 example: 1
 *     ReordenarReactivos:
 *       type: object
 *       required:
 *         - nuevos_ordenes
 *       properties:
 *         nuevos_ordenes:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - reactivo_id
 *               - orden
 *             properties:
 *               reactivo_id:
 *                 type: integer
 *                 example: 1
 *               orden:
 *                 type: integer
 *                 example: 2
 */

/**
 * @swagger
 * /api/reactivos:
 *   post:
 *     summary: Crear un nuevo reactivo
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReactivoInput'
 *     responses:
 *       201:
 *         description: Reactivo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reactivo creado exitosamente"
 *                 reactivo:
 *                   $ref: '#/components/schemas/Reactivo'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', verifyToken, reactivoController.crearReactivo);

/**
 * @swagger
 * /api/reactivos:
 *   get:
 *     summary: Obtener lista de reactivos con paginación y filtros
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Reactivos por página
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: sub_tipo_id
 *         schema:
 *           type: integer
 *         description: Filtrar por sub tipo
 *       - in: query
 *         name: tipo_id
 *         schema:
 *           type: integer
 *         description: Filtrar por tipo
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Buscar en contenido
 *     responses:
 *       200:
 *         description: Lista de reactivos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reactivos obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reactivo'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current_page:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *                     total_items:
 *                       type: integer
 *                     items_per_page:
 *                       type: integer
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', verifyToken, reactivoController.obtenerReactivos);

/**
 * @swagger
 * /api/reactivos/sub-tipo/{sub_tipo_id}:
 *   get:
 *     summary: Obtener reactivos por sub tipo específico
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sub_tipo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del sub tipo
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Reactivos por página
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Reactivos por sub tipo obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reactivos por sub tipo obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reactivo'
 *                 pagination:
 *                   type: object
 *       400:
 *         description: ID de sub tipo inválido
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/sub-tipo/:sub_tipo_id', verifyToken, reactivoController.obtenerReactivosPorSubTipo);

/**
 * @swagger
 * /api/reactivos/tipo/{tipo_id}:
 *   get:
 *     summary: Obtener reactivos por tipo específico
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Reactivos por página
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Reactivos por tipo obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reactivos por tipo obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reactivo'
 *                 pagination:
 *                   type: object
 *       400:
 *         description: ID de tipo inválido
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/tipo/:tipo_id', verifyToken, reactivoController.obtenerReactivosPorTipo);

/**
 * @swagger
 * /api/reactivos/compatibilidad/{ejercicio_id}/{tipo_id}:
 *   get:
 *     summary: Verificar compatibilidad de tipo para un ejercicio
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ejercicio_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ejercicio
 *       - in: path
 *         name: tipo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo a verificar
 *     responses:
 *       200:
 *         description: Compatibilidad verificada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Compatibilidad verificada"
 *                 compatible:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: "Compatible con el tipo existente"
 *                 tipoExistente:
 *                   type: object
 *                   properties:
 *                     tipo_id:
 *                       type: integer
 *                     tipo_nombre:
 *                       type: string
 *       400:
 *         description: IDs inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/compatibilidad/:ejercicio_id/:tipo_id', verifyToken, reactivoController.verificarCompatibilidadTipo);

/**
 * @swagger
 * /api/reactivos/{id}:
 *   get:
 *     summary: Obtener un reactivo específico por ID
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del reactivo
 *     responses:
 *       200:
 *         description: Reactivo obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reactivo obtenido exitosamente"
 *                 reactivo:
 *                   $ref: '#/components/schemas/Reactivo'
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reactivo no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', verifyToken, reactivoController.obtenerReactivoPorId);

/**
 * @swagger
 * /api/reactivos/{id}:
 *   put:
 *     summary: Actualizar un reactivo existente
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del reactivo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReactivoUpdate'
 *     responses:
 *       200:
 *         description: Reactivo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reactivo actualizado exitosamente"
 *                 reactivo:
 *                   $ref: '#/components/schemas/Reactivo'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reactivo no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', verifyToken, reactivoController.actualizarReactivo);

/**
 * @swagger
 * /api/reactivos/{id}:
 *   delete:
 *     summary: Eliminar un reactivo (soft delete)
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del reactivo
 *     responses:
 *       200:
 *         description: Reactivo eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reactivo eliminado exitosamente"
 *                 reactivo:
 *                   $ref: '#/components/schemas/Reactivo'
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reactivo no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', verifyToken, reactivoController.eliminarReactivo);

/**
 * @swagger
 * /api/reactivos/ejercicio/{ejercicio_id}:
 *   post:
 *     summary: Agregar reactivos a un ejercicio
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ejercicio_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ejercicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReactivosEjercicio'
 *     responses:
 *       201:
 *         description: Reactivos agregados al ejercicio exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reactivos agregados al ejercicio exitosamente"
 *                 ejercicio_id:
 *                   type: integer
 *                 reactivos_agregados:
 *                   type: array
 *                   items:
 *                     type: object
 *                 tipo:
 *                   type: object
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/ejercicio/:ejercicio_id', verifyToken, reactivoController.agregarReactivosAEjercicio);

/**
 * @swagger
 * /api/reactivos/ejercicio/{ejercicio_id}:
 *   get:
 *     summary: Obtener reactivos de un ejercicio
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ejercicio_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ejercicio
 *     responses:
 *       200:
 *         description: Reactivos del ejercicio obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reactivos del ejercicio obtenidos exitosamente"
 *                 ejercicio_id:
 *                   type: integer
 *                 reactivos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reactivo'
 *                 total:
 *                   type: integer
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/ejercicio/:ejercicio_id', verifyToken, reactivoController.obtenerReactivosDeEjercicio);

/**
 * @swagger
 * /api/reactivos/ejercicio/{ejercicio_id}/reordenar:
 *   put:
 *     summary: Reordenar reactivos en un ejercicio
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ejercicio_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ejercicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReordenarReactivos'
 *     responses:
 *       200:
 *         description: Reactivos reordenados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reactivos reordenados exitosamente"
 *                 ejercicio_id:
 *                   type: integer
 *                 reactivos_actualizados:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/ejercicio/:ejercicio_id/reordenar', verifyToken, reactivoController.reordenarReactivosEnEjercicio);

/**
 * @swagger
 * /api/reactivos/ejercicio/{ejercicio_id}/{reactivo_id}:
 *   delete:
 *     summary: Remover un reactivo de un ejercicio
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ejercicio_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ejercicio
 *       - in: path
 *         name: reactivo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del reactivo
 *     responses:
 *       200:
 *         description: Reactivo removido del ejercicio exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reactivo removido del ejercicio exitosamente"
 *                 relacion:
 *                   type: object
 *       400:
 *         description: IDs inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/ejercicio/:ejercicio_id/:reactivo_id', verifyToken, reactivoController.removerReactivoDeEjercicio);

module.exports = router;
