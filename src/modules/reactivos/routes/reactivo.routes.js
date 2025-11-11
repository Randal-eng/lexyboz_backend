const express = require('express');
const router = express.Router();
const { obtenerReportePorKitPaciente, guardarResultadoLecturaPseudopalabras, upload } = require('../controllers/reactivoController');
const reactivoController = require('../controllers/reactivoController');
const { verifyToken } = require('../../auth/middleware/authMiddleware');
const { crearReactivoImagenCorrectaController, guardarResultadoImagenCorrectaController } = require('../controllers/reactivoImagenCorrectaController');
const { crearReactivoImagenCorrectaArchivosController, uploadImagenes } = require('../controllers/reactivoImagenCorrectaArchivosController');

// Endpoint de reporte por kit y paciente
/**
 * @swagger
 * /api/reactivos/reportes/kit/{kit_id}/paciente/{paciente_id}:
 *   get:
 *     summary: Obtiene el reporte de aciertos por ejercicio para un kit y paciente
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kit_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: paciente_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Reporte generado exitosamente"
 *               ejercicios: [
 *                 {
 *                   ejercicio_id: 1,
 *                   aciertos: 3,
 *                   total: 5,
 *                   porcentaje: 60,
 *                   tiempo_promedio: 12.5
 *                 }
 *               ]
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/reportes/kit/:kit_id/paciente/:paciente_id', obtenerReportePorKitPaciente);

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
 *               paciente_id:
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
 *                 paciente_id: 123
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
 * /api/reactivos/palabras-normales:
 *   post:
 *     summary: Crear un nuevo reactivo de palabras normales
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contenido
 *               - sub_tipo_id
 *             properties:
 *               contenido:
 *                 type: string
 *                 description: Palabra normal (real)
 *                 example: "casa"
 *               sub_tipo_id:
 *                 type: integer
 *                 description: ID del subtipo para palabras normales
 *                 example: 2
 *               tiempo_limite:
 *                 type: integer
 *                 description: Tiempo límite en milisegundos
 *                 example: 4000
 *               orden:
 *                 type: integer
 *                 description: Orden del reactivo
 *                 example: 1
 *     responses:
 *       201:
 *         description: Reactivo de palabra normal creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reactivo de palabra normal creado exitosamente"
 *                 reactivo:
 *                   type: object
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/palabras-normales', verifyToken, reactivoController.crearReactivoPalabraNormal);

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
 *     summary: Obtiene los reactivos de un sub-tipo
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sub_tipo_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reactivos obtenidos
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivos obtenidos"
 *               reactivos: [ { "id": 1, "nombre": "Casa" } ]
 *       404:
 *         description: No se encontraron reactivos
 */
router.get('/sub-tipo/:sub_tipo_id', verifyToken, reactivoController.obtenerReactivosPorSubTipo);

/**
 * @swagger
 * /api/reactivos/tipo/{tipo_id}:
 *   get:
 *     summary: Obtiene los reactivos de un tipo
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
 *         description: Reactivos obtenidos
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivos obtenidos"
 *               reactivos: [ { "id": 1, "nombre": "Casa" } ]
 *       404:
 *         description: No se encontraron reactivos
 */
router.get('/tipo/:tipo_id', verifyToken, reactivoController.obtenerReactivosPorTipo);

/**
 * @swagger
 * /api/reactivos/compatibilidad/{ejercicio_id}/{tipo_id}:
 *   get:
 *     summary: Verifica la compatibilidad de un ejercicio con un tipo de reactivo
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
 *         description: Compatibilidad verificada
 *         content:
 *           application/json:
 *             example:
 *               compatible: true
 *       400:
 *         description: Datos inválidos
 */
router.get('/compatibilidad/:ejercicio_id/:tipo_id', verifyToken, reactivoController.verificarCompatibilidadTipo);

/**
 * @swagger
 * /api/reactivos/{id}:
 *   get:
 *     summary: Obtiene un reactivo por su ID
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
 *         description: Reactivo encontrado
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivo encontrado"
 *               reactivo: { "id": 1, "nombre": "Casa" }
 *       404:
 *         description: Reactivo no encontrado
 *   put:
 *     summary: Actualiza un reactivo por su ID
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
 *             nombre: "Nuevo nombre"
 *     responses:
 *       200:
 *         description: Reactivo actualizado
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivo actualizado"
 *               reactivo: { "id": 1, "nombre": "Nuevo nombre" }
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Reactivo no encontrado
 *   delete:
 *     summary: Elimina un reactivo por su ID
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
 *         description: Reactivo eliminado
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivo eliminado"
 *       404:
 *         description: Reactivo no encontrado
 */
router.get('/:id', verifyToken, reactivoController.obtenerReactivoPorId);
router.put('/:id', verifyToken, reactivoController.actualizarReactivo);
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

/**
 * @swagger
 * /api/reactivos/imagen-correcta:
 *   post:
 *     summary: Crea un nuevo reactivo de tipo Imagen Correcta
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_sub_tipo:
 *                 type: integer
 *                 example: 7
 *               tiempo_duracion:
 *                 type: integer
 *                 example: 30
 *               oracion:
 *                 type: string
 *                 example: "El niño jugando con la pelota roja"
 *               imagenes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     imagen_url:
 *                       type: string
 *                       example: "https://ejemplo.com/img1.jpg"
 *                     es_correcta:
 *                       type: boolean
 *                       example: false
 *     responses:
 *       201:
 *         description: Reactivo creado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivo Imagen Correcta creado exitosamente"
 *               id_reactivo: 1
 *       400:
 *         description: Error en los datos enviados
 */
router.post('/imagen-correcta', crearReactivoImagenCorrectaController);

/**
 * @swagger
 * /api/reactivos/imagen-correcta/resultado:
 *   post:
 *     summary: Guarda el resultado de un reactivo Imagen Correcta
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario_id:
 *                 type: integer
 *                 example: 5
 *               id_reactivo:
 *                 type: integer
 *                 example: 12
 *               tiempo_inicio_reactivo:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-09-15T10:00:00Z"
 *               tiempo_terminar_reactivo:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-09-15T10:00:10Z"
 *               imagen_seleccionada_id:
 *                 type: integer
 *                 example: 33
 *     responses:
 *       201:
 *         description: Resultado guardado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Resultado guardado exitosamente"
 *               resultado_id: 1
 *       400:
 *         description: Error en los datos enviados
 */
router.post('/imagen-correcta/resultado', guardarResultadoImagenCorrectaController);

/**
 * @swagger
 * /api/reactivos/imagen-correcta/archivos:
 *   post:
 *     summary: Crea un nuevo reactivo de tipo Imagen Correcta subiendo archivos de imagen
 *     tags: [Reactivos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               id_sub_tipo:
 *                 type: integer
 *                 example: 7
 *               tiempo_duracion:
 *                 type: integer
 *                 example: 30
 *               oracion:
 *                 type: string
 *                 example: "El niño jugando con la pelota roja"
 *               es_correcta_index:
 *                 type: integer
 *                 example: 1
 *                 description: Índice (0-3) de la imagen correcta
 *               imagenes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Sube exactamente 4 archivos de imagen
 *     responses:
 *       201:
 *         description: Reactivo creado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivo Imagen Correcta creado exitosamente (archivos)"
 *               id_reactivo: 1
 *       400:
 *         description: Error en los datos enviados
 */
router.post('/imagen-correcta/archivos', uploadImagenes, crearReactivoImagenCorrectaArchivosController);

// Endpoint para guardar resultado de lectura de pseudopalabras (audio y datos)
router.post('/resultados-lectura-pseudopalabras', upload.any(), guardarResultadoLecturaPseudopalabras);

// Endpoint para guardar resultado de pseudopalabras SIN audio (solo JSON)
router.post('/resultados-lectura-pseudopalabras-json', reactivoController.guardarResultadoLecturaPseudopalabrasDirecto);

/**
 * @swagger
 * /api/reactivos/resultados-lectura-pseudopalabras:
 *   get:
 *     summary: Obtiene resultados de lectura de pseudopalabras
 *     tags: [ResultadosLecturaPseudopalabras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: paciente_id
 *         schema:
 *           type: integer
 *         description: ID del paciente (opcional)
 *       - in: query
 *         name: id_reactivo
 *         schema:
 *           type: integer
 *         description: ID del reactivo (opcional)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número de resultados por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de resultados a saltar
 *     responses:
 *       200:
 *         description: Resultados obtenidos exitosamente
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Resultados obtenidos exitosamente"
 *               data: [
 *                 {
 *                   resultado_reactivo_usuario_id: 1,
 *                   usuario_id: 123,
 *                   id_reactivo: 45,
 *                   voz_usuario_url: "https://audio.com/file.mp3",
 *                   tiempo_respuesta: 3200,
 *                   es_correcto: true,
 *                   fecha_realizacion: "2025-11-10T10:30:00Z"
 *                 }
 *               ]
 *               total: 1
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/resultados-lectura-pseudopalabras', verifyToken, reactivoController.obtenerResultadosLecturaPseudopalabras);

module.exports = router;
