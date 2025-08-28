/**
 * @swagger
 * /api/reactivos/resultados-lectura-pseudopalabras:
 *   post:
 *     summary: Guarda el resultado de lectura de pseudopalabras (incluye audio y datos)
 *     tags: [ResultadosLecturaPseudopalabras]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               usuario_id:
 *                 type: integer
 *                 example: 123
 *               id_reactivo:
 *                 type: integer
 *                 example: 45
 *               tiempo_respuesta:
 *                 type: integer
 *                 example: 3200
 *               es_correcto:
 *                 type: boolean
 *                 example: true
 *               fecha_realizacion:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-08-27T10:30:00Z"
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de audio grabado por el usuario
 *     responses:
 *       201:
 *         description: Resultado guardado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Resultado guardado exitosamente"
 *               resultado:
 *                 resultado_reactivo_usuario_id: 1
 *                 usuario_id: 123
 *                 id_reactivo: 45
 *                 voz_usuario_url: "https://res.cloudinary.com/lexyboz/audio123.mp3"
 *                 tiempo_respuesta: 3200
 *                 es_correcto: true
 *                 fecha_realizacion: "2025-08-27T10:30:00Z"
 *                 created_at: "2025-08-27T10:30:01Z"
 *                 updated_at: "2025-08-27T10:30:01Z"
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
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
 *       properties:
 *         pseudopalabra:
 *           type: string
 *           example: "BLANTO"
 *         id_sub_tipo:
 *           type: integer
 *           example: 1
 *         tiempo_duracion:
 *           type: integer
 *           example: 3000
 *     
 *     ReactivoRespuesta:
 *       type: object
 *       properties:
 *         reactivo_id:
 *           type: integer
 *           example: 1
 *         pseudopalabra:
 *           type: string
 *           example: "BLANTO"
 *         id_sub_tipo:
 *           type: integer
 *           example: 1
 *         tiempo_duracion:
 *           type: integer
 *           example: 3000
 *         activo:
 *           type: boolean
 *           example: true
 *         fecha_creacion:
 *           type: string
 *           example: "2025-08-13T10:30:00Z"
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
 *     summary: Crear reactivo
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reactivo'
 *     responses:
 *       201:
 *         description: Reactivo creado
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivo creado exitosamente"
 *               reactivo:
 *                 reactivo_id: 1
 *                 pseudopalabra: "BLANTO"
 *                 id_sub_tipo: 1
 *                 tiempo_duracion: 3000
 *                 activo: true
 *                 fecha_creacion: "2025-08-13T10:30:00Z"
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
 *     tags: [Reactivos]
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
 *         name: buscar
 *         schema:
 *           type: string
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sub_tipo_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: tipo_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivos obtenidos exitosamente"
 *               reactivos: [
 *                 {
 *                   "id": 1,
 *                   "nombre": "Casa",
 *                   "imagen_url": "https://cloudinary.com/imagen1.jpg",
 *                   "tipo_id": 1,
 *                   "sub_tipo_id": 1,
 *                   "activo": true
 *                 }
 *               ]
 *               pagination: {
 *                 "totalItems": 50,
 *                 "totalPages": 3,
 *                 "currentPage": 1
 *               }
 */
router.get('/', verifyToken, reactivoController.obtenerReactivos);

/**
 * @swagger
 * /api/reactivos/sub-tipo/{sub_tipo_id}:
 *   get:
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sub_tipo_id
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
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivos por sub tipo obtenidos exitosamente"
 *               data: [
 *                 {
 *                   "id": 1,
 *                   "nombre": "Casa",
 *                   "imagen_url": "https://cloudinary.com/imagen1.jpg",
 *                   "tipo_id": 1,
 *                   "sub_tipo_id": 1,
 *                   "activo": true
 *                 }
 *               ]
 *               pagination: {
 *                 "totalItems": 50,
 *                 "totalPages": 3,
 *                 "currentPage": 1
 *               }
 */
router.get('/sub-tipo/:sub_tipo_id', verifyToken, reactivoController.obtenerReactivosPorSubTipo);

/**
 * @swagger
 * /api/reactivos/tipo/{tipo_id}:
 *   get:
 *     tags: [Reactivos]
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
 *               message: "Reactivos por tipo obtenidos exitosamente"
 *               data: [
 *                 {
 *                   "id": 1,
 *                   "nombre": "Casa",
 *                   "imagen_url": "https://cloudinary.com/imagen1.jpg",
 *                   "tipo_id": 1,
 *                   "sub_tipo_id": 1,
 *                   "activo": true
 *                 }
 *               ]
 *               pagination: {
 *                 "totalItems": 50,
 *                 "totalPages": 3,
 *                 "currentPage": 1
 *               }
 */
router.get('/tipo/:tipo_id', verifyToken, reactivoController.obtenerReactivosPorTipo);

/**
 * @swagger
 * /api/reactivos/compatibilidad/{ejercicio_id}/{tipo_id}:
 *   get:
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ejercicio_id
 *         required: true
 *         schema:
 *           type: integer
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
 *               message: "Compatibilidad verificada"
 *               compatible: true
 *               mensaje: "Compatible con el tipo existente"
 *               tipoExistente: {
 *                 "tipo_id": 1,
 *                 "tipo_nombre": "Sustantivos"
 *               }
 */
router.get('/compatibilidad/:ejercicio_id/:tipo_id', verifyToken, reactivoController.verificarCompatibilidadTipo);

/**
 * @swagger
 * /api/reactivos/{id}:
 *   get:
 *     tags: [Reactivos]
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
 *               message: "Reactivo obtenido exitosamente"
 *               reactivo: {
 *                 "id": 1,
 *                 "nombre": "Casa",
 *                 "imagen_url": "https://cloudinary.com/imagen1.jpg",
 *                 "tipo_id": 1,
 *                 "sub_tipo_id": 1,
 *                 "activo": true,
 *                 "creado_por": 1,
 *                 "fecha_creacion": "2024-01-01T10:00:00Z"
 *               }
 */
router.get('/:id', verifyToken, reactivoController.obtenerReactivoPorId);

/**
 * @swagger
 * /api/reactivos/{id}:
 *   put:
 *     tags: [Reactivos]
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
 *             nombre: "Casa Actualizada"
 *             imagen_url: "https://cloudinary.com/nueva_imagen.jpg"
 *             tipo_id: 1
 *             sub_tipo_id: 2
 *             activo: true
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivo actualizado exitosamente"
 *               reactivo: {
 *                 "id": 1,
 *                 "nombre": "Casa Actualizada",
 *                 "imagen_url": "https://cloudinary.com/nueva_imagen.jpg",
 *                 "tipo_id": 1,
 *                 "sub_tipo_id": 2,
 *                 "activo": true
 *               }
 */
router.put('/:id', verifyToken, reactivoController.actualizarReactivo);

/**
 * @swagger
 * /api/reactivos/{id}:
 *   delete:
 *     tags: [Reactivos]
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
 *               message: "Reactivo eliminado exitosamente"
 *               reactivo: {
 *                 "id": 1,
 *                 "nombre": "Casa",
 *                 "activo": false
 *               }
 */
router.delete('/:id', verifyToken, reactivoController.eliminarReactivo);

/**
 * @swagger
 * /api/reactivos/ejercicio/{ejercicio_id}:
 *   post:
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ejercicio_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             reactivos: [1, 2, 3, 4, 5]
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivos agregados al ejercicio exitosamente"
 *               ejercicio_id: 1
 *               reactivos_agregados: [
 *                 {
 *                   "reactivo_id": 1,
 *                   "orden": 1,
 *                   "nombre": "Casa"
 *                 },
 *                 {
 *                   "reactivo_id": 2,
 *                   "orden": 2,
 *                   "nombre": "Perro"
 *                 }
 *               ]
 *               tipo: {
 *                 "tipo_id": 1,
 *                 "nombre": "Sustantivos"
 *               }
 */
router.post('/ejercicio/:ejercicio_id', verifyToken, reactivoController.agregarReactivosAEjercicio);

/**
 * @swagger
 * /api/reactivos/ejercicio/{ejercicio_id}:
 *   get:
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ejercicio_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivos del ejercicio obtenidos exitosamente"
 *               ejercicio_id: 1
 *               reactivos: [
 *                 {
 *                   "id": 1,
 *                   "nombre": "Casa",
 *                   "imagen_url": "https://cloudinary.com/imagen1.jpg",
 *                   "orden": 1,
 *                   "activo": true
 *                 },
 *                 {
 *                   "id": 2,
 *                   "nombre": "Perro",
 *                   "imagen_url": "https://cloudinary.com/imagen2.jpg",
 *                   "orden": 2,
 *                   "activo": true
 *                 }
 *               ]
 *               total: 2
 */
router.get('/ejercicio/:ejercicio_id', verifyToken, reactivoController.obtenerReactivosDeEjercicio);

/**
 * @swagger
 * /api/reactivos/ejercicio/{ejercicio_id}/reordenar:
 *   put:
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ejercicio_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             reactivos_orden: [
 *               { "reactivo_id": 2, "nuevo_orden": 1 },
 *               { "reactivo_id": 1, "nuevo_orden": 2 }
 *             ]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivos reordenados exitosamente"
 *               ejercicio_id: 1
 *               reactivos_actualizados: [
 *                 { "reactivo_id": 2, "orden": 1 },
 *                 { "reactivo_id": 1, "orden": 2 }
 *               ]
 */
router.put('/ejercicio/:ejercicio_id/reordenar', verifyToken, reactivoController.reordenarReactivosEnEjercicio);

/**
 * @swagger
 * /api/reactivos/ejercicio/{ejercicio_id}/{reactivo_id}:
 *   delete:
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ejercicio_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: reactivo_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivo removido del ejercicio exitosamente"
 *               relacion: {
 *                 "ejercicio_id": 1,
 *                 "reactivo_id": 5,
 *                 "removido": true
 *               }
 */
router.delete('/ejercicio/:ejercicio_id/:reactivo_id', verifyToken, reactivoController.removerReactivoDeEjercicio);


// Endpoint para guardar resultado de lectura de pseudopalabras (audio y datos)
const { upload, guardarResultadoLecturaPseudopalabras } = require('../controllers/reactivoController');
router.post('/resultados-lectura-pseudopalabras', upload.single('audio'), guardarResultadoLecturaPseudopalabras);

module.exports = router;
