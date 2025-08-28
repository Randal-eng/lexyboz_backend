/**
 * @swagger
 * components:
 *   schemas:
 *     ReactivoPalabra:
 *       type: object
 *       properties:
 *         id_sub_tipo:
 *           type: integer
 *           example: 3
 *         tiempo_duracion:
 *           type: integer
 *           example: 5000
 *         palabra:
 *           type: string
 *           example: "Ermita"
 *     ReactivoPalabraRespuesta:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         palabra:
 *           type: string
 *           example: "Ermita"
 *         id_sub_tipo:
 *           type: integer
 *           example: 3
 *         tiempo_duracion:
 *           type: integer
 *           example: 5000
 *         activo:
 *           type: boolean
 *           example: true
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *           example: "2025-08-27T10:30:00Z"
 *         fecha_actualizacion:
 *           type: string
 *           format: date-time
 *           example: "2025-08-27T10:30:00Z"
 *     ResultadoLecturaPalabra:
 *       type: object
 *       properties:
 *         usuario_ID:
 *           type: integer
 *           example: 1
 *         id_reactivo:
 *           type: integer
 *           example: 10
 *         voz_usuario_url:
 *           type: string
 *           example: "https://res.cloudinary.com/lexyboz/audio123.mp3"
 *         tiempo_respuesta:
 *           type: integer
 *           example: 3200
 *         es_correcto:
 *           type: boolean
 *           example: true
 *         fecha_realizacion:
 *           type: string
 *           format: date-time
 *           example: "2025-08-27T10:30:00Z"
 *         ia:
 *           type: object
 *           description: Resultado del procesamiento IA
 *           example: { "score": 0.95, "feedback": "Correcto" }
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/reactivoPalabraController');

/**
 * @swagger
 * /reactivos-palabra/crear:
 *   post:
 *     summary: Crear un nuevo reactivo de palabra normal
 *     tags: [ReactivosPalabra]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReactivoPalabra'
 *     responses:
 *       201:
 *         description: Reactivo creado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivo creado exitosamente"
 *               reactivo:
 *                 $ref: '#/components/schemas/ReactivoPalabraRespuesta'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/crear', controller.crearReactivoPalabra);

/**
 * @swagger
 * /reactivos-palabra/listado:
 *   get:
 *     summary: Listar todos los reactivos de palabras normales
 *     tags: [ReactivosPalabra]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *       - in: query
 *         name: id_sub_tipo
 *         schema:
 *           type: integer
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reactivos de palabras normales obtenidos exitosamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivos de palabras normales obtenidos exitosamente"
 *               data: [ { "id": 1, "palabra": "Ermita", "id_sub_tipo": 3 } ]
 *               pagination: { "total_items": 1, "items_per_page": 10, "offset": 0 }
 *       500:
 *         description: Error interno del servidor
 */
router.get('/listado', async (req, res) => {
  try {
    const filtros = {
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0,
      id_sub_tipo: req.query.id_sub_tipo ? parseInt(req.query.id_sub_tipo) : null,
      buscar: req.query.buscar || null
    };
    const modelo = require('./models/ReactivoLecturaPalabras');
    const resultado = await modelo.obtenerReactivosPalabra(filtros);
    res.json({
      message: 'Reactivos de palabras normales obtenidos exitosamente',
      data: resultado.reactivos,
      pagination: {
        total_items: resultado.total,
        items_per_page: filtros.limit,
        offset: filtros.offset
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

/**
 * @swagger
 * /reactivos-palabra/obtener/{id}:
 *   get:
 *     summary: Obtener un reactivo de palabra normal por ID
 *     tags: [ReactivosPalabra]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reactivo obtenido exitosamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivo obtenido exitosamente"
 *               reactivo:
 *                 $ref: '#/components/schemas/ReactivoPalabraRespuesta'
 *       404:
 *         description: Reactivo no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/obtener/:id', async (req, res) => {
  try {
    const modelo = require('./models/ReactivoLecturaPalabras');
    const reactivo = await modelo.obtenerReactivoPalabraPorId(parseInt(req.params.id));
    if (!reactivo) {
      return res.status(404).json({ message: 'Reactivo no encontrado' });
    }
    res.json({ message: 'Reactivo obtenido exitosamente', reactivo });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

/**
 * @swagger
 * /reactivos-palabra/actualizar/{id}:
 *   put:
 *     summary: Actualizar un reactivo de palabra normal
 *     tags: [ReactivosPalabra]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               palabra:
 *                 type: string
 *                 example: "Ermita actualizada"
 *     responses:
 *       200:
 *         description: Reactivo actualizado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivo actualizado exitosamente"
 *               reactivo:
 *                 $ref: '#/components/schemas/ReactivoPalabraRespuesta'
 *       500:
 *         description: Error interno del servidor
 */
router.put('/actualizar/:id', async (req, res) => {
  try {
    const modelo = require('./models/ReactivoLecturaPalabras');
    const actualizado = await modelo.actualizarReactivoPalabra(parseInt(req.params.id), req.body);
    res.json({ message: 'Reactivo actualizado exitosamente', reactivo: actualizado });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

/**
 * @swagger
 * /reactivos-palabra/eliminar/{id}:
 *   delete:
 *     summary: Eliminar un reactivo de palabra normal
 *     tags: [ReactivosPalabra]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reactivo eliminado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivo eliminado exitosamente"
 *               reactivo:
 *                 $ref: '#/components/schemas/ReactivoPalabraRespuesta'
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/eliminar/:id', async (req, res) => {
  try {
    const modelo = require('./models/ReactivoLecturaPalabras');
    const eliminado = await modelo.eliminarReactivoPalabra(parseInt(req.params.id));
    res.json({ message: 'Reactivo eliminado exitosamente', reactivo: eliminado });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

/**
 * @swagger
 * /reactivos-palabra/guardar-resultado:
 *   post:
 *     summary: Guardar resultado de lectura de palabra normal (con audio y procesamiento IA)
 *     tags: [ResultadosLecturaPalabra]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               usuario_ID:
 *                 type: integer
 *                 example: 1
 *               id_reactivo:
 *                 type: integer
 *                 example: 10
 *               file:
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
 *                 $ref: '#/components/schemas/ResultadoLecturaPalabra'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/guardar-resultado', controller.upload.single('file'), controller.guardarResultadoLecturaPalabrasNormales);

module.exports = router;
