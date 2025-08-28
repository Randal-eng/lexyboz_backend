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
/**
 * @swagger
 * /reactivos-palabra/agregar-a-ejercicio/{ejercicio_id}:
 *   post:
 *     summary: Asignar reactivos de palabras normales a un ejercicio, cada uno con su subtipo
 *     tags: [ReactivosPalabra]
 *     parameters:
 *       - in: path
 *         name: ejercicio_id
 *         required: true
 *         schema:
 *           type: integer
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
 *                   required:
 *                     - id_reactivo
 *                     - orden
 *                     - sub_tipo_id
 *                   properties:
 *                     id_reactivo:
 *                       type: integer
 *                       example: 1
 *                     orden:
 *                       type: integer
 *                       example: 1
 *                     sub_tipo_id:
 *                       type: integer
 *                       example: 3
 *     responses:
 *       201:
 *         description: Reactivos asignados exitosamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Reactivos asignados al ejercicio exitosamente"
 *               ejercicio_id: 1
 *               reactivos_agregados: [ { "id_reactivo": 1, "orden": 1, "sub_tipo_id": 3 } ]
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Ejercicio o reactivo no encontrado
 *       500:
 *         description: Error interno del servidor
 */
const modelo = require('./models/ReactivoLecturaPalabras');
router.post('/agregar-a-ejercicio/:ejercicio_id', async (req, res) => {
  try {
    const { ejercicio_id } = req.params;
    const { reactivos } = req.body;
    if (!Array.isArray(reactivos) || reactivos.length === 0) {
      return res.status(400).json({ message: 'reactivos es requerido y debe ser un array.' });
    }
    // Validar que cada reactivo pertenezca al sub_tipo_id indicado
    for (const r of reactivos) {
      if (!r.id_reactivo || !r.orden || !r.sub_tipo_id) {
        return res.status(400).json({ message: 'Cada reactivo debe tener id_reactivo, orden y sub_tipo_id.' });
      }
      const valido = await modelo.validarReactivosSubTipo([r.id_reactivo], r.sub_tipo_id);
      if (!valido) {
        return res.status(400).json({ message: `El reactivo ${r.id_reactivo} no pertenece al sub_tipo ${r.sub_tipo_id}` });
      }
    }
    const resultado = await modelo.agregarReactivosAEjercicioConSubTipoMultiple(parseInt(ejercicio_id), reactivos);
    res.status(201).json({
      message: 'Reactivos asignados al ejercicio exitosamente',
      ejercicio_id: parseInt(ejercicio_id),
      reactivos_agregados: resultado.reactivos_agregados
    });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});
// ...existing code...
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
