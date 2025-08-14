const express = require('express');
const router = express.Router();
const kitController = require('../controllers/kitController');
const { verifyToken } = require('../../auth/middleware/authMiddleware');

// =====================================================
// RUTAS DE KITS
// Todas las rutas requieren autenticación
// =====================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     Kit:
 *       type: object
 *       required:
 *         - name
 *         - creado_por
 *       properties:
 *         kit_id:
 *           type: integer
 *           description: ID único del kit
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           description: Nombre del kit
 *         descripcion:
 *           type: string
 *           maxLength: 1000
 *           description: Descripción del kit
 *         creado_por:
 *           type: integer
 *           description: ID del usuario creador
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         activo:
 *           type: boolean
 *           description: Estado del kit
 *         creador_nombre:
 *           type: string
 *           description: Nombre del creador
 *         total_ejercicios:
 *           type: integer
 *           description: Número de ejercicios en el kit
 *     
 *     KitDetalle:
 *       allOf:
 *         - $ref: '#/components/schemas/Kit'
 *         - type: object
 *           properties:
 *             ejercicios:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ejercicio_id:
 *                     type: integer
 *                   titulo:
 *                     type: string
 *                   descripcion:
 *                     type: string
 *                   orden_en_kit:
 *                     type: integer
 *                   creador_ejercicio_nombre:
 *                     type: string
 */

/**
 * @swagger
 * /api/kits:
 *   post:
 *     summary: Crear un nuevo kit
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *               descripcion:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Kit creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 kit:
 *                   $ref: '#/components/schemas/Kit'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', verifyToken, kitController.crearKit);

/**
 * @swagger
 * /api/kits/con-ejercicios:
 *   post:
 *     summary: Crear un nuevo kit con ejercicios
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 description: Nombre del kit
 *                 example: "Kit de Lectura Básica"
 *               descripcion:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Descripción del kit
 *                 example: "Kit para evaluar habilidades básicas de lectura"
 *               creado_por:
 *                 type: integer
 *                 description: ID del usuario creador (opcional si está autenticado)
 *                 example: 1
 *               ejercicios:
 *                 type: array
 *                 description: Lista de ejercicios a agregar al kit
 *                 items:
 *                   type: object
 *                   properties:
 *                     ejercicio_id:
 *                       type: integer
 *                       description: ID del ejercicio
 *                       example: 1
 *                     orden:
 *                       type: integer
 *                       description: Orden del ejercicio en el kit
 *                       example: 1
 *     responses:
 *       201:
 *         description: Kit creado exitosamente con ejercicios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 kit:
 *                   $ref: '#/components/schemas/Kit'
 *                 ejercicios_agregados:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total_ejercicios:
 *                   type: integer
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/con-ejercicios', verifyToken, kitController.crearKitConEjercicios);

/**
 * @swagger
 * /api/kits:
 *   get:
 *     summary: Obtener todos los kits con paginación y filtros
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Elementos por página
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: creado_por
 *         schema:
 *           type: integer
 *         description: Filtrar por creador
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Buscar en nombre y descripción
 *     responses:
 *       200:
 *         description: Kits obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Kit'
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
router.get('/', verifyToken, kitController.obtenerKits);

/**
 * @swagger
 * /api/kits/{id}:
 *   get:
 *     summary: Obtener un kit por ID con sus ejercicios
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del kit
 *     responses:
 *       200:
 *         description: Kit obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 kit:
 *                   $ref: '#/components/schemas/KitDetalle'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Kit no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', verifyToken, kitController.obtenerKitPorId);

/**
 * @swagger
 * /api/kits/{id}:
 *   put:
 *     summary: Actualizar un kit
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del kit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *               descripcion:
 *                 type: string
 *                 maxLength: 1000
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Kit actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 kit:
 *                   $ref: '#/components/schemas/Kit'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Kit no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', verifyToken, kitController.actualizarKit);

/**
 * @swagger
 * /api/kits/{id}:
 *   delete:
 *     summary: Eliminar un kit (soft delete)
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del kit
 *     responses:
 *       200:
 *         description: Kit eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 kit:
 *                   $ref: '#/components/schemas/Kit'
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Kit no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', verifyToken, kitController.eliminarKit);

/**
 * @swagger
 * /api/kits/{id}/ejercicios:
 *   post:
 *     summary: Agregar ejercicio a un kit
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del kit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ejercicio_id
 *             properties:
 *               ejercicio_id:
 *                 type: integer
 *                 description: ID del ejercicio a agregar
 *               orden_en_kit:
 *                 type: integer
 *                 description: Posición en el kit (opcional)
 *     responses:
 *       201:
 *         description: Ejercicio agregado exitosamente
 *       400:
 *         description: Datos inválidos o ejercicio ya existe en el kit
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Kit o ejercicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:id/ejercicios', verifyToken, kitController.agregarEjercicioAKit);

/**
 * @swagger
 * /api/kits/{id}/ejercicios/{ejercicio_id}:
 *   delete:
 *     summary: Remover ejercicio de un kit
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del kit
 *       - in: path
 *         name: ejercicio_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ejercicio a remover
 *     responses:
 *       200:
 *         description: Ejercicio removido exitosamente
 *       400:
 *         description: IDs inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Kit o ejercicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id/ejercicios/:ejercicio_id', verifyToken, kitController.removerEjercicioDeKit);

/**
 * @swagger
 * /api/kits/{id}/reordenar:
 *   put:
 *     summary: Reordenar ejercicios en un kit
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del kit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nuevos_ordenes
 *             properties:
 *               nuevos_ordenes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ejercicio_id:
 *                       type: integer
 *                     orden_en_kit:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Ejercicios reordenados exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Kit no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id/reordenar', verifyToken, kitController.reordenarEjerciciosEnKit);

/**
 * @swagger
 * /api/kits/{id}/ejercicios:
 *   post:
 *     summary: Agregar múltiples ejercicios a un kit
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del kit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ejercicios
 *             properties:
 *               ejercicios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ejercicio_id:
 *                       type: integer
 *                       description: ID del ejercicio
 *                     orden:
 *                       type: integer
 *                       description: Orden del ejercicio en el kit
 *     responses:
 *       201:
 *         description: Ejercicios agregados al kit exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Kit no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:id/ejercicios', verifyToken, kitController.agregarEjerciciosAKit);

/**
 * @swagger
 * /api/kits/{id}/ejercicios:
 *   get:
 *     summary: Obtener ejercicios de un kit
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del kit
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
 *         description: Límite de resultados por página
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Ejercicios del kit obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Kit no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/ejercicios', verifyToken, kitController.obtenerEjerciciosDeKit);

/**
 * @swagger
 * /api/kits/{id}/ejercicios:
 *   delete:
 *     summary: Remover múltiples ejercicios de un kit
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del kit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ejercicios_ids
 *             properties:
 *               ejercicios_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array de IDs de ejercicios a remover
 *     responses:
 *       200:
 *         description: Ejercicios removidos del kit exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Kit no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id/ejercicios', verifyToken, kitController.removerEjerciciosDeKit);

module.exports = router;
