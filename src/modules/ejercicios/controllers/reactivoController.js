const ReactivoLecturaPseudopalabra = require('../models/ReactivoLecturaPseudopalabra');

/**
 * @swagger
 * components:
 *   schemas:
 *     Reactivo:
 *       type: object
 *       required:
 *         - id_sub_tipo
 *         - pseudopalabra
 *         - tiempo_duracion
 *       properties:
 *         id_reactivo:
 *           type: integer
 *           description: ID único del reactivo
 *           example: 1
 *         id_sub_tipo:
 *           type: integer
 *           description: ID del sub-tipo al que pertenece
 *           example: 2
 *         pseudopalabra:
 *           type: string
 *           description: La pseudopalabra del ejercicio
 *           example: "blista"
 *         tiempo_duracion:
 *           type: integer
 *           description: Duración del ejercicio en milisegundos
 *           example: 3000
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     ReactivoInput:
 *       type: object
 *       required:
 *         - id_sub_tipo
 *         - pseudopalabra
 *         - tiempo_duracion
 *       properties:
 *         id_sub_tipo:
 *           type: integer
 *           description: ID del sub-tipo
 *           example: 2
 *         pseudopalabra:
 *           type: string
 *           description: La pseudopalabra
 *           example: "blista"
 *         tiempo_duracion:
 *           type: integer
 *           description: Duración en milisegundos
 *           example: 3000
 *     ReactivoCompleto:
 *       allOf:
 *         - $ref: '#/components/schemas/Reactivo'
 *         - type: object
 *           properties:
 *             sub_tipo_nombre:
 *               type: string
 *               description: Nombre del sub-tipo
 *               example: "Pseudopalabras Simples"
 *             tipo_nombre:
 *               type: string
 *               description: Nombre del tipo
 *               example: "Lectura de Pseudopalabras"
 *     EstadisticasReactivos:
 *       type: object
 *       properties:
 *         total_reactivos:
 *           type: integer
 *           example: 30
 *         reactivos_por_subtipo:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               sub_tipo_nombre:
 *                 type: string
 *               cantidad:
 *                 type: integer
 *         duracion_promedio:
 *           type: number
 *           example: 2500.5
 *         duracion_minima:
 *           type: integer
 *           example: 1000
 *         duracion_maxima:
 *           type: integer
 *           example: 5000
 */

class ReactivoController {
    /**
     * @swagger
     * /api/reactivos/crear:
     *   post:
     *     summary: Crear un nuevo reactivo
     *     description: Crea un nuevo reactivo de lectura de pseudopalabras
     *     tags: [Reactivos]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ReactivoInput'
     *           examples:
     *             ejemplo1:
     *               summary: Reactivo básico
     *               value:
     *                 id_sub_tipo: 2
     *                 pseudopalabra: "blista"
     *                 tiempo_duracion: 3000
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
     *         description: Error de validación
     *       401:
     *         description: No autorizado
     *       500:
     *         description: Error interno del servidor
     */
    static async crearReactivo(req, res) {
        try {
            const reactivo = await ReactivoLecturaPseudopalabra.createReactivo(req.body);
            res.status(201).json({
                message: 'Reactivo creado exitosamente',
                reactivo
            });
        } catch (error) {
            console.error('Error al crear reactivo:', error);
            if (error.message.includes('validación')) {
                return res.status(400).json({ error: error.message });
            }
            if (error.message.includes('no existe')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/reactivos/listado:
     *   get:
     *     summary: Obtener listado de reactivos
     *     description: Obtiene todos los reactivos con filtros opcionales
     *     tags: [Reactivos]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: id_sub_tipo
     *         schema:
     *           type: integer
     *         description: Filtrar por ID de sub-tipo
     *       - in: query
     *         name: tipo
     *         schema:
     *           type: integer
     *         description: Filtrar por ID de tipo
     *       - in: query
     *         name: duracion_min
     *         schema:
     *           type: integer
     *         description: Duración mínima en ms
     *       - in: query
     *         name: duracion_max
     *         schema:
     *           type: integer
     *         description: Duración máxima en ms
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
     *                 reactivos:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/ReactivoCompleto'
     *                 total:
     *                   type: integer
     *                   example: 15
     *       401:
     *         description: No autorizado
     *       500:
     *         description: Error interno del servidor
     */
    static async obtenerReactivos(req, res) {
        try {
            const filters = {
                id_sub_tipo: req.query.id_sub_tipo ? parseInt(req.query.id_sub_tipo) : undefined,
                tipo: req.query.tipo ? parseInt(req.query.tipo) : undefined,
                duracion_min: req.query.duracion_min ? parseInt(req.query.duracion_min) : undefined,
                duracion_max: req.query.duracion_max ? parseInt(req.query.duracion_max) : undefined
            };

            const reactivos = await ReactivoLecturaPseudopalabra.getAllReactivos(filters);
            res.json({
                message: 'Reactivos obtenidos exitosamente',
                reactivos,
                total: reactivos.length
            });
        } catch (error) {
            console.error('Error al obtener reactivos:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/reactivos/obtener/{id}:
     *   get:
     *     summary: Obtener reactivo por ID
     *     description: Obtiene un reactivo específico por su ID
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
     *                   $ref: '#/components/schemas/ReactivoCompleto'
     *       404:
     *         description: Reactivo no encontrado
     *       401:
     *         description: No autorizado
     *       500:
     *         description: Error interno del servidor
     */
    static async obtenerReactivoPorId(req, res) {
        try {
            const { id } = req.params;
            const reactivo = await ReactivoLecturaPseudopalabra.getReactivoById(id);
            res.json({
                message: 'Reactivo obtenido exitosamente',
                reactivo
            });
        } catch (error) {
            console.error('Error al obtener reactivo:', error);
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/reactivos/actualizar/{id}:
     *   put:
     *     summary: Actualizar reactivo
     *     description: Actualiza un reactivo existente
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
     *             type: object
     *             properties:
     *               pseudopalabra:
     *                 type: string
     *                 example: "blista"
     *               tiempo_duracion:
     *                 type: integer
     *                 example: 3500
     *           examples:
     *             ejemplo1:
     *               summary: Actualizar pseudopalabra
     *               value:
     *                 pseudopalabra: "crista"
     *                 tiempo_duracion: 3500
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
     *         description: Error de validación
     *       404:
     *         description: Reactivo no encontrado
     *       401:
     *         description: No autorizado
     *       500:
     *         description: Error interno del servidor
     */
    static async actualizarReactivo(req, res) {
        try {
            const { id } = req.params;
            const reactivo = await ReactivoLecturaPseudopalabra.updateReactivo(id, req.body);
            res.json({
                message: 'Reactivo actualizado exitosamente',
                reactivo
            });
        } catch (error) {
            console.error('Error al actualizar reactivo:', error);
            if (error.message.includes('validación')) {
                return res.status(400).json({ error: error.message });
            }
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/reactivos/eliminar/{id}:
     *   delete:
     *     summary: Eliminar reactivo
     *     description: Elimina un reactivo por su ID
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
     *       404:
     *         description: Reactivo no encontrado
     *       401:
     *         description: No autorizado
     *       500:
     *         description: Error interno del servidor
     */
    static async eliminarReactivo(req, res) {
        try {
            const { id } = req.params;
            await ReactivoLecturaPseudopalabra.deleteReactivo(id);
            res.json({
                message: 'Reactivo eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar reactivo:', error);
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/reactivos/buscar:
     *   get:
     *     summary: Buscar reactivos
     *     description: Busca reactivos por pseudopalabra
     *     tags: [Reactivos]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: termino
     *         required: true
     *         schema:
     *           type: string
     *         description: Término de búsqueda
     *         example: "blis"
     *     responses:
     *       200:
     *         description: Búsqueda realizada exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Búsqueda realizada exitosamente"
     *                 reactivos:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/ReactivoCompleto'
     *                 total:
     *                   type: integer
     *                   example: 3
     *       400:
     *         description: Término de búsqueda requerido
     *       401:
     *         description: No autorizado
     *       500:
     *         description: Error interno del servidor
     */
    static async buscarReactivos(req, res) {
        try {
            const { termino } = req.query;
            if (!termino) {
                return res.status(400).json({ error: 'El término de búsqueda es requerido' });
            }

            const reactivos = await ReactivoLecturaPseudopalabra.searchReactivos(termino);
            res.json({
                message: 'Búsqueda realizada exitosamente',
                reactivos,
                total: reactivos.length
            });
        } catch (error) {
            console.error('Error al buscar reactivos:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/reactivos/aleatorios:
     *   get:
     *     summary: Obtener reactivos aleatorios
     *     description: Obtiene una cantidad específica de reactivos aleatorios
     *     tags: [Reactivos]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: cantidad
     *         schema:
     *           type: integer
     *           default: 5
     *         description: Cantidad de reactivos aleatorios
     *       - in: query
     *         name: id_sub_tipo
     *         schema:
     *           type: integer
     *         description: Filtrar por sub-tipo específico
     *     responses:
     *       200:
     *         description: Reactivos aleatorios obtenidos exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Reactivos aleatorios obtenidos exitosamente"
     *                 reactivos:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/ReactivoCompleto'
     *                 cantidad_solicitada:
     *                   type: integer
     *                   example: 5
     *                 cantidad_obtenida:
     *                   type: integer
     *                   example: 5
     *       401:
     *         description: No autorizado
     *       500:
     *         description: Error interno del servidor
     */
    static async obtenerReactivosAleatorios(req, res) {
        try {
            const cantidad = parseInt(req.query.cantidad) || 5;
            const id_sub_tipo = req.query.id_sub_tipo ? parseInt(req.query.id_sub_tipo) : undefined;

            const reactivos = await ReactivoLecturaPseudopalabra.getReactivosAleatorios(cantidad, id_sub_tipo);
            res.json({
                message: 'Reactivos aleatorios obtenidos exitosamente',
                reactivos,
                cantidad_solicitada: cantidad,
                cantidad_obtenida: reactivos.length
            });
        } catch (error) {
            console.error('Error al obtener reactivos aleatorios:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/reactivos/estadisticas:
     *   get:
     *     summary: Obtener estadísticas de reactivos
     *     description: Obtiene estadísticas generales de los reactivos
     *     tags: [Reactivos]
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
     *                   $ref: '#/components/schemas/EstadisticasReactivos'
     *       401:
     *         description: No autorizado
     *       500:
     *         description: Error interno del servidor
     */
    static async obtenerEstadisticas(req, res) {
        try {
            const estadisticas = await ReactivoLecturaPseudopalabra.getReactivosStats();
            res.json({
                message: 'Estadísticas obtenidas exitosamente',
                estadisticas
            });
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

module.exports = ReactivoController;
