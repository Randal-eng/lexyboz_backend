const Ejercicio = require('../models/Ejercicio');
const ReactivoLecturaPseudopalabra = require('../models/ReactivoLecturaPseudopalabra');

/**
 * @swagger
 * components:
 *   schemas:
 *     EjercicioCompleto:
 *       type: object
 *       properties:
 *         ejercicio_id:
 *           type: integer
 *           example: 1
 *         titulo:
 *           type: string
 *           example: "Ejercicio de Pseudopalabras Básico"
 *         descripcion:
 *           type: string
 *           example: "Ejercicio para practicar lectura de pseudopalabras"
 *         tipo_ejercicio:
 *           type: string
 *           example: "Lectura"
 *         tipo_reactivo:
 *           type: integer
 *           example: 1
 *         creado_por:
 *           type: integer
 *           example: 5
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *         fecha_actualizacion:
 *           type: string
 *           format: date-time
 *         tipo_nombre:
 *           type: string
 *           example: "Lectura de Pseudopalabras"
 *         creador_nombre:
 *           type: string
 *           example: "Dr. García"
 *         total_reactivos:
 *           type: integer
 *           example: 5
 *     EjercicioInput:
 *       type: object
 *       required:
 *         - titulo
 *         - tipo_reactivo
 *         - creado_por
 *       properties:
 *         titulo:
 *           type: string
 *           example: "Ejercicio de Pseudopalabras Básico"
 *         descripcion:
 *           type: string
 *           example: "Ejercicio para practicar lectura de pseudopalabras"
 *         tipo_ejercicio:
 *           type: string
 *           example: "Lectura"
 *         tipo_reactivo:
 *           type: integer
 *           example: 1
 *         creado_por:
 *           type: integer
 *           example: 5
 */

class EjercicioController {
    /**
     * @swagger
     * /api/ejercicios/crear:
     *   post:
     *     summary: Crear un nuevo ejercicio
     *     description: Crea un nuevo ejercicio con tipo de reactivo específico
     *     tags: [Ejercicios]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/EjercicioInput'
     *           examples:
     *             ejercicio_lectura:
     *               summary: Ejercicio de Lectura
     *               value:
     *                 titulo: "Ejercicio de Pseudopalabras Básico"
     *                 descripcion: "Ejercicio para practicar lectura de pseudopalabras"
     *                 tipo_ejercicio: "Lectura"
     *                 tipo_reactivo: 1
     *                 creado_por: 5
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
     *                   $ref: '#/components/schemas/EjercicioCompleto'
     */
    static async crearEjercicio(req, res) {
        try {
            const ejercicio = await Ejercicio.createEjercicio(req.body);
            res.status(201).json({
                message: 'Ejercicio creado exitosamente',
                ejercicio
            });
        } catch (error) {
            console.error('Error al crear ejercicio:', error);
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
     * /api/ejercicios/listado:
     *   get:
     *     summary: Obtener listado de ejercicios
     *     description: Obtiene todos los ejercicios con información completa
     *     tags: [Ejercicios]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: tipo_reactivo
     *         schema:
     *           type: integer
     *         description: Filtrar por tipo de reactivo
     *       - in: query
     *         name: creado_por
     *         schema:
     *           type: integer
     *         description: Filtrar por creador
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
     *                 ejercicios:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/EjercicioCompleto'
     *                 total:
     *                   type: integer
     *                   example: 10
     */
    static async obtenerEjercicios(req, res) {
        try {
            const filters = {
                tipo_reactivo: req.query.tipo_reactivo ? parseInt(req.query.tipo_reactivo) : undefined,
                creado_por: req.query.creado_por ? parseInt(req.query.creado_por) : undefined
            };

            const ejercicios = await Ejercicio.getAllEjercicios(filters);
            res.json({
                message: 'Ejercicios obtenidos exitosamente',
                ejercicios,
                total: ejercicios.length
            });
        } catch (error) {
            console.error('Error al obtener ejercicios:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/ejercicios/obtener/{id}:
     *   get:
     *     summary: Obtener ejercicio por ID
     *     description: Obtiene un ejercicio específico con información completa
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
     *                   $ref: '#/components/schemas/EjercicioCompleto'
     *       404:
     *         description: Ejercicio no encontrado
     */
    static async obtenerEjercicioPorId(req, res) {
        try {
            const { id } = req.params;
            const ejercicio = await Ejercicio.getEjercicioById(id);
            res.json({
                message: 'Ejercicio obtenido exitosamente',
                ejercicio
            });
        } catch (error) {
            console.error('Error al obtener ejercicio:', error);
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/ejercicios/actualizar/{id}:
     *   put:
     *     summary: Actualizar ejercicio
     *     description: Actualiza un ejercicio existente
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
     *             type: object
     *             properties:
     *               titulo:
     *                 type: string
     *                 example: "Ejercicio Actualizado"
     *               descripcion:
     *                 type: string
     *                 example: "Nueva descripción"
     *               tipo_ejercicio:
     *                 type: string
     *                 example: "Lectura Avanzada"
     *     responses:
     *       200:
     *         description: Ejercicio actualizado exitosamente
     */
    static async actualizarEjercicio(req, res) {
        try {
            const { id } = req.params;
            const ejercicio = await Ejercicio.updateEjercicio(id, req.body);
            res.json({
                message: 'Ejercicio actualizado exitosamente',
                ejercicio
            });
        } catch (error) {
            console.error('Error al actualizar ejercicio:', error);
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
     * /api/ejercicios/eliminar/{id}:
     *   delete:
     *     summary: Eliminar ejercicio
     *     description: Elimina un ejercicio por su ID
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
     */
    static async eliminarEjercicio(req, res) {
        try {
            const { id } = req.params;
            await Ejercicio.deleteEjercicio(id);
            res.json({
                message: 'Ejercicio eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar ejercicio:', error);
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/ejercicios/buscar:
     *   get:
     *     summary: Buscar ejercicios
     *     description: Busca ejercicios por título o descripción
     *     tags: [Ejercicios]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: termino
     *         required: true
     *         schema:
     *           type: string
     *         description: Término de búsqueda
     *     responses:
     *       200:
     *         description: Búsqueda realizada exitosamente
     */
    static async buscarEjercicios(req, res) {
        try {
            const { termino } = req.query;
            if (!termino) {
                return res.status(400).json({ error: 'El término de búsqueda es requerido' });
            }

            const ejercicios = await Ejercicio.searchEjercicios(termino);
            res.json({
                message: 'Búsqueda realizada exitosamente',
                ejercicios,
                total: ejercicios.length
            });
        } catch (error) {
            console.error('Error al buscar ejercicios:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/ejercicios/tipo/{tipo_reactivo}:
     *   get:
     *     summary: Obtener ejercicios por tipo
     *     description: Obtiene ejercicios de un tipo específico de reactivo
     *     tags: [Ejercicios]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: tipo_reactivo
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del tipo de reactivo
     *     responses:
     *       200:
     *         description: Ejercicios obtenidos exitosamente
     */
    static async obtenerEjerciciosPorTipo(req, res) {
        try {
            const { tipo_reactivo } = req.params;
            const ejercicios = await Ejercicio.getEjerciciosByTipo(tipo_reactivo);
            res.json({
                message: 'Ejercicios obtenidos exitosamente',
                ejercicios,
                total: ejercicios.length
            });
        } catch (error) {
            console.error('Error al obtener ejercicios por tipo:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/ejercicios/estadisticas:
     *   get:
     *     summary: Obtener estadísticas de ejercicios
     *     description: Obtiene estadísticas generales de los ejercicios
     *     tags: [Ejercicios]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Estadísticas obtenidas exitosamente
     */
    static async obtenerEstadisticas(req, res) {
        try {
            const estadisticas = await Ejercicio.getEjerciciosStats();
            res.json({
                message: 'Estadísticas obtenidas exitosamente',
                estadisticas
            });
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/ejercicios/{id}/reactivos:
     *   get:
     *     summary: Obtener reactivos de un ejercicio
     *     description: Obtiene todos los reactivos asignados a un ejercicio
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
     *         description: Reactivos del ejercicio obtenidos exitosamente
     */
    static async obtenerReactivosEjercicio(req, res) {
        try {
            const { id } = req.params;
            const reactivos = await ReactivoLecturaPseudopalabra.getReactivosPorEjercicio(id);
            res.json({
                message: 'Reactivos del ejercicio obtenidos exitosamente',
                reactivos,
                total: reactivos.length
            });
        } catch (error) {
            console.error('Error al obtener reactivos del ejercicio:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/ejercicios/{id}/reactivos/aleatorios:
     *   get:
     *     summary: Obtener reactivos aleatorios de un ejercicio
     *     description: Obtiene una cantidad específica de reactivos aleatorios del ejercicio
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
     *       - in: query
     *         name: cantidad
     *         schema:
     *           type: integer
     *           default: 5
     *         description: Cantidad de reactivos aleatorios
     *     responses:
     *       200:
     *         description: Reactivos aleatorios obtenidos exitosamente
     */
    static async obtenerReactivosAleatorios(req, res) {
        try {
            const { id } = req.params;
            const cantidad = parseInt(req.query.cantidad) || 5;
            
            const reactivos = await ReactivoLecturaPseudopalabra.getReactivosAleatoriosDeEjercicio(id, cantidad);
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
}

module.exports = EjercicioController;
