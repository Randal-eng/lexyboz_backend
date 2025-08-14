const express = require('express');
const router = express.Router();
const ejercicioController = require('../controllers/ejercicioController');
const { verifyToken } = require('../../auth/middleware/authMiddleware');

// =====================================================
// RUTAS DE EJERCICIOS
// =====================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     Ejercicio:
 *       type: object
 *       required:
 *         - titulo
 *         - creado_por
 *       properties:
 *         ejercicio_id:
 *           type: integer
 *           description: ID único del ejercicio
 *           example: 1
 *         titulo:
 *           type: string
 *           description: Título del ejercicio
 *           example: "Ejercicio de lectura de pseudopalabras"
 *         descripcion:
 *           type: string
 *           description: Descripción detallada del ejercicio
 *           example: "Ejercicio para evaluar la capacidad de lectura de palabras inventadas"
 *         creado_por:
 *           type: integer
 *           description: ID del usuario que creó el ejercicio
 *           example: 1
 *         activo:
 *           type: boolean
 *           description: Estado del ejercicio
 *           example: true
 *         id_reactivo:
 *           type: integer
 *           description: ID del reactivo asociado
 *           example: 1
 *         tipo_ejercicio:
 *           type: integer
 *           description: ID del tipo de ejercicio
 *           example: 1
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del ejercicio
 *         fecha_actualizacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     EjercicioInput:
 *       type: object
 *       required:
 *         - titulo
 *       properties:
 *         titulo:
 *           type: string
 *           description: Título del ejercicio
 *           example: "Ejercicio de lectura de pseudopalabras"
 *         descripcion:
 *           type: string
 *           description: Descripción del ejercicio
 *           example: "Ejercicio para evaluar la capacidad de lectura"
 *         id_reactivo:
 *           type: integer
 *           description: ID del reactivo asociado
 *           example: 1
 *         tipo_ejercicio:
 *           type: integer
 *           description: ID del tipo de ejercicio
 *           example: 1
 *     EjercicioUpdate:
 *       type: object
 *       properties:
 *         titulo:
 *           type: string
 *           description: Nuevo título del ejercicio
 *         descripcion:
 *           type: string
 *           description: Nueva descripción del ejercicio
 *         activo:
 *           type: boolean
 *           description: Nuevo estado del ejercicio
 *         id_reactivo:
 *           type: integer
 *           description: Nuevo ID del reactivo
 *         tipo_ejercicio:
 *           type: integer
 *           description: Nuevo ID del tipo de ejercicio
 *     EjercicioDuplicar:
 *       type: object
 *       required:
 *         - nuevo_titulo
 *       properties:
 *         nuevo_titulo:
 *           type: string
 *           description: Título para el ejercicio duplicado
 *           example: "Copia de Ejercicio de lectura"
 */

/**
 * @swagger
 * /api/ejercicios:
 *   post:
 *     summary: Crear un nuevo ejercicio
 *     tags: [Ejercicios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EjercicioInput'
 *     responses:
 *       201:
 *         description: Ejercicio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ejercicio creado exitosamente"
 *                 ejercicio:
 *                   $ref: '#/components/schemas/Ejercicio'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', verifyToken, ejercicioController.crearEjercicio);

/**
 * @swagger
 * /api/ejercicios:
 *   get:
 *     summary: Obtener lista de ejercicios con paginación y filtros
 *     tags: [Ejercicios]
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
 *         description: Ejercicios por página
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
 *         name: tipo_ejercicio
 *         schema:
 *           type: integer
 *         description: Filtrar por tipo de ejercicio
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Buscar en título y descripción
 *     responses:
 *       200:
 *         description: Lista de ejercicios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ejercicios obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ejercicio'
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
router.get('/', verifyToken, ejercicioController.obtenerEjercicios);

/**
 * @swagger
 * /api/ejercicios/mis-ejercicios:
 *   get:
 *     summary: Obtener ejercicios creados por el usuario actual
 *     tags: [Ejercicios]
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
 *         description: Ejercicios por página
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Buscar en título y descripción
 *     responses:
 *       200:
 *         description: Mis ejercicios obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mis ejercicios obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ejercicio'
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
router.get('/mis-ejercicios', verifyToken, ejercicioController.obtenerMisEjercicios);

/**
 * @swagger
 * /api/ejercicios/estadisticas:
 *   get:
 *     summary: Obtener estadísticas generales de ejercicios
 *     tags: [Ejercicios]
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
 *                 message:
 *                   type: string
 *                   example: "Estadísticas obtenidas exitosamente"
 *                 estadisticas:
 *                   type: object
 *                   properties:
 *                     total_ejercicios:
 *                       type: integer
 *                     ejercicios_activos:
 *                       type: integer
 *                     ejercicios_inactivos:
 *                       type: integer
 *                     por_tipo:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tipo:
 *                             type: string
 *                           cantidad:
 *                             type: integer
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/estadisticas', verifyToken, ejercicioController.obtenerEstadisticasEjercicios);

/**
 * @swagger
 * /api/ejercicios/tipo/{tipo_id}:
 *   get:
 *     summary: Obtener ejercicios por tipo específico
 *     tags: [Ejercicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo de ejercicio
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
 *         description: Ejercicios por página
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Ejercicios por tipo obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ejercicios por tipo obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ejercicio'
 *                 pagination:
 *                   type: object
 *       400:
 *         description: ID de tipo inválido
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/tipo/:tipo_id', verifyToken, ejercicioController.obtenerEjerciciosPorTipo);

/**
 * @swagger
 * /api/ejercicios/disponibles/{kit_id}:
 *   get:
 *     summary: Obtener ejercicios disponibles para un kit (no incluidos en el kit)
 *     tags: [Ejercicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kit_id
 *         required: true
 *         schema:
 *           type: integer
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
 *         description: Ejercicios por página
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Buscar en título y descripción
 *     responses:
 *       200:
 *         description: Ejercicios disponibles obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ejercicios disponibles obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ejercicio'
 *                 pagination:
 *                   type: object
 *       400:
 *         description: ID de kit inválido
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/disponibles/:kit_id', verifyToken, ejercicioController.obtenerEjerciciosDisponibles);

/**
 * @swagger
 * /api/ejercicios/{id}:
 *   get:
 *     summary: Obtener un ejercicio específico por ID
 *     tags: [Ejercicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ejercicio
 *     responses:
 *       200:
 *         description: Ejercicio obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ejercicio obtenido exitosamente"
 *                 ejercicio:
 *                   $ref: '#/components/schemas/Ejercicio'
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Ejercicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', verifyToken, ejercicioController.obtenerEjercicioPorId);

/**
 * @swagger
 * /api/ejercicios/{id}:
 *   put:
 *     summary: Actualizar un ejercicio existente
 *     tags: [Ejercicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ejercicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EjercicioUpdate'
 *     responses:
 *       200:
 *         description: Ejercicio actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ejercicio actualizado exitosamente"
 *                 ejercicio:
 *                   $ref: '#/components/schemas/Ejercicio'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos para editar
 *       404:
 *         description: Ejercicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', verifyToken, ejercicioController.actualizarEjercicio);

/**
 * @swagger
 * /api/ejercicios/{id}:
 *   delete:
 *     summary: Eliminar un ejercicio (soft delete)
 *     tags: [Ejercicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ejercicio
 *     responses:
 *       200:
 *         description: Ejercicio eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ejercicio eliminado exitosamente"
 *                 ejercicio:
 *                   $ref: '#/components/schemas/Ejercicio'
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos para eliminar
 *       404:
 *         description: Ejercicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', verifyToken, ejercicioController.eliminarEjercicio);

/**
 * @swagger
 * /api/ejercicios/{id}/duplicar:
 *   post:
 *     summary: Duplicar un ejercicio existente
 *     tags: [Ejercicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ejercicio a duplicar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EjercicioDuplicar'
 *     responses:
 *       201:
 *         description: Ejercicio duplicado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ejercicio duplicado exitosamente"
 *                 ejercicio:
 *                   $ref: '#/components/schemas/Ejercicio'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Ejercicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:id/duplicar', verifyToken, ejercicioController.duplicarEjercicio);

// =====================================================
// RUTAS PARA GESTIÓN DE REACTIVOS EN EJERCICIOS
// =====================================================

/**
 * @swagger
 * /api/ejercicios/con-reactivos:
 *   post:
 *     summary: Crear ejercicio con reactivos
 *     description: Crea un nuevo ejercicio y opcionalmente le agrega reactivos en una sola operación
 *     tags: [Ejercicios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Título del ejercicio
 *                 example: "Ejercicio de pseudopalabras"
 *               descripcion:
 *                 type: string
 *                 description: Descripción del ejercicio
 *                 example: "Ejercicio para evaluar lectura de pseudopalabras"
 *               tipo_ejercicio:
 *                 type: string
 *                 description: Tipo de ejercicio
 *                 example: "pseudopalabras"
 *               reactivos:
 *                 type: array
 *                 description: Lista de reactivos a agregar
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_reactivo:
 *                       type: integer
 *                       example: 1
 *                     orden:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       201:
 *         description: Ejercicio creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/con-reactivos', verifyToken, ejercicioController.crearEjercicioConReactivos);

/**
 * @swagger
 * /api/ejercicios/{ejercicioId}/reactivos:
 *   post:
 *     summary: Agregar reactivos a un ejercicio
 *     description: Agrega una lista de reactivos a un ejercicio existente
 *     tags: [Ejercicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ejercicioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ejercicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reactivos
 *             properties:
 *               reactivos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_reactivo:
 *                       type: integer
 *                       example: 1
 *                     orden:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       200:
 *         description: Reactivos agregados exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos para modificar este ejercicio
 *       404:
 *         description: Ejercicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:ejercicioId/reactivos', verifyToken, ejercicioController.agregarReactivosAEjercicio);

/**
 * @swagger
 * /api/ejercicios/{ejercicioId}/reactivos:
 *   get:
 *     summary: Obtener reactivos de un ejercicio
 *     description: Obtiene todos los reactivos asociados a un ejercicio
 *     tags: [Ejercicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ejercicioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ejercicio
 *     responses:
 *       200:
 *         description: Reactivos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ejercicio:
 *                   type: object
 *                 reactivos:
 *                   type: array
 *                 total_reactivos:
 *                   type: integer
 *       404:
 *         description: Ejercicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:ejercicioId/reactivos', verifyToken, ejercicioController.obtenerReactivosDeEjercicio);

/**
 * @swagger
 * /api/ejercicios/{ejercicioId}/reactivos/{reactivoId}:
 *   delete:
 *     summary: Remover reactivo de ejercicio
 *     description: Remueve un reactivo específico de un ejercicio
 *     tags: [Ejercicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ejercicioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ejercicio
 *       - in: path
 *         name: reactivoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del reactivo
 *     responses:
 *       200:
 *         description: Reactivo removido exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos para modificar este ejercicio
 *       404:
 *         description: Ejercicio o reactivo no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:ejercicioId/reactivos/:reactivoId', verifyToken, ejercicioController.removerReactivoDeEjercicio);

/**
 * @swagger
 * /api/ejercicios/{ejercicioId}/reactivos/reordenar:
 *   put:
 *     summary: Reordenar reactivos en ejercicio
 *     description: Cambia el orden de los reactivos en un ejercicio
 *     tags: [Ejercicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ejercicioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ejercicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nuevosOrdenes
 *             properties:
 *               nuevosOrdenes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     reactivo_id:
 *                       type: integer
 *                       example: 1
 *                     orden:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       200:
 *         description: Reactivos reordenados exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos para modificar este ejercicio
 *       404:
 *         description: Ejercicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:ejercicioId/reactivos/reordenar', verifyToken, ejercicioController.reordenarReactivosEnEjercicio);

/**
 * @swagger
 * /api/ejercicios/{ejercicioId}/reactivos/compatibilidad:
 *   get:
 *     summary: Verificar compatibilidad de reactivos
 *     description: Verifica si se pueden agregar reactivos de un tipo específico al ejercicio
 *     tags: [Ejercicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ejercicioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ejercicio
 *       - in: query
 *         name: tipoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo de reactivo
 *     responses:
 *       200:
 *         description: Verificación completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 compatibilidad:
 *                   type: object
 *                   properties:
 *                     compatible:
 *                       type: boolean
 *                     mensaje:
 *                       type: string
 *       400:
 *         description: Parámetro tipoId requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:ejercicioId/reactivos/compatibilidad', verifyToken, ejercicioController.verificarCompatibilidadReactivos);

/**
 * @swagger
 * /api/ejercicios/{id}/kits:
 *   get:
 *     summary: Obtener kits que contienen un ejercicio específico
 *     tags: [Ejercicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del ejercicio
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
 *         description: Kits del ejercicio obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 kits:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       kit_id:
 *                         type: integer
 *                       kit_name:
 *                         type: string
 *                       kit_descripcion:
 *                         type: string
 *                       orden_en_kit:
 *                         type: integer
 *                       activo_en_kit:
 *                         type: boolean
 *                       fecha_agregado:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/kits', verifyToken, ejercicioController.obtenerKitsDeEjercicio);

module.exports = router;
