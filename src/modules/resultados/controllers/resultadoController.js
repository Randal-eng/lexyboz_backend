const ResultadoLecturaPseudopalabra = require('../../resultados/models/ResultadoLecturaPseudopalabra');

/**
 * @swagger
 * components:
 *   schemas:
 *     Resultado:
 *       type: object
 *       required:
 *         - usuario_ID
 *         - id_reactivo
 *         - es_correcto
 *       properties:
 *         resultado_reactivo_usuario_ID:
 *           type: integer
 *           description: ID único del resultado
 *           example: 1
 *         usuario_ID:
 *           type: integer
 *           description: ID del usuario
 *           example: 5
 *         id_reactivo:
 *           type: integer
 *           description: ID del reactivo
 *           example: 12
 *         voz_usuario_URL:
 *           type: string
 *           format: uri
 *           description: URL del audio de respuesta del usuario
 *           example: "https://res.cloudinary.com/audio123.mp3"
 *         tiempo_respuesta:
 *           type: integer
 *           description: Tiempo de respuesta en milisegundos
 *           example: 2500
 *         es_correcto:
 *           type: boolean
 *           description: Si la respuesta fue correcta
 *           example: true
 *         fecha_realizacion:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de realización
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     ResultadoInput:
 *       type: object
 *       required:
 *         - usuario_ID
 *         - id_reactivo
 *         - es_correcto
 *       properties:
 *         usuario_ID:
 *           type: integer
 *           description: ID del usuario
 *           example: 5
 *         id_reactivo:
 *           type: integer
 *           description: ID del reactivo
 *           example: 12
 *         voz_usuario_URL:
 *           type: string
 *           format: uri
 *           description: URL del audio de respuesta
 *           example: "https://res.cloudinary.com/audio123.mp3"
 *         tiempo_respuesta:
 *           type: integer
 *           description: Tiempo de respuesta en ms
 *           example: 2500
 *         es_correcto:
 *           type: boolean
 *           description: Si la respuesta fue correcta
 *           example: true
 *         fecha_realizacion:
 *           type: string
 *           format: date-time
 *           description: Fecha específica (opcional)
 *     ResultadoCompleto:
 *       allOf:
 *         - $ref: '#/components/schemas/Resultado'
 *         - type: object
 *           properties:
 *             pseudopalabra:
 *               type: string
 *               description: La pseudopalabra del reactivo
 *               example: "blista"
 *             tiempo_duracion:
 *               type: integer
 *               description: Duración del reactivo en ms
 *               example: 3000
 *             sub_tipo_nombre:
 *               type: string
 *               description: Nombre del sub-tipo
 *               example: "Pseudopalabras Simples"
 *             tipo_nombre:
 *               type: string
 *               description: Nombre del tipo
 *               example: "Lectura de Pseudopalabras"
 *             usuario_nombre:
 *               type: string
 *               description: Nombre del usuario
 *               example: "Juan Pérez"
 *     EstadisticasUsuario:
 *       type: object
 *       properties:
 *         total_ejercicios:
 *           type: integer
 *           example: 25
 *         respuestas_correctas:
 *           type: integer
 *           example: 18
 *         respuestas_incorrectas:
 *           type: integer
 *           example: 7
 *         porcentaje_acierto:
 *           type: number
 *           example: 72.00
 *         tiempo_promedio_respuesta:
 *           type: number
 *           example: 2350.5
 *         tiempo_minimo:
 *           type: integer
 *           example: 1200
 *         tiempo_maximo:
 *           type: integer
 *           example: 4500
 *         primera_fecha:
 *           type: string
 *           format: date-time
 *         ultima_fecha:
 *           type: string
 *           format: date-time
 *     RankingUsuario:
 *       type: object
 *       properties:
 *         usuario_ID:
 *           type: integer
 *           example: 5
 *         usuario_nombre:
 *           type: string
 *           example: "Juan Pérez"
 *         total_ejercicios:
 *           type: integer
 *           example: 25
 *         respuestas_correctas:
 *           type: integer
 *           example: 18
 *         porcentaje_acierto:
 *           type: number
 *           example: 72.00
 *         tiempo_promedio_respuesta:
 *           type: number
 *           example: 2350.5
 */

class ResultadoController {
    /**
     * @swagger
     * /api/resultados/registrar:
     *   post:
     *     summary: Registrar un nuevo resultado
     *     description: Registra el resultado de un ejercicio de lectura de pseudopalabras
     *     tags: [Resultados]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ResultadoInput'
     *           examples:
     *             resultado_correcto:
     *               summary: Respuesta correcta con audio
     *               value:
     *                 usuario_ID: 5
     *                 id_reactivo: 12
     *                 voz_usuario_URL: "https://res.cloudinary.com/audio123.mp3"
     *                 tiempo_respuesta: 2500
     *                 es_correcto: true
     *             resultado_incorrecto:
     *               summary: Respuesta incorreta sin audio
     *               value:
     *                 usuario_ID: 5
     *                 id_reactivo: 13
     *                 tiempo_respuesta: 4200
     *                 es_correcto: false
     *     responses:
     *       201:
     *         description: Resultado registrado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Resultado registrado exitosamente"
     *                 resultado:
     *                   $ref: '#/components/schemas/Resultado'
     *       400:
     *         description: Error de validación
     *       401:
     *         description: No autorizado
     *       500:
     *         description: Error interno del servidor
     */
    static async registrarResultado(req, res) {
        try {
            const resultado = await ResultadoLecturaPseudopalabra.createResultado(req.body);
            res.status(201).json({
                message: 'Resultado registrado exitosamente',
                resultado
            });
        } catch (error) {
            console.error('Error al registrar resultado:', error);
            if (error.message.includes('validación')) {
                return res.status(400).json({ error: error.message });
            }
            if (error.message.includes('no existe')) {
                return res.status(400).json({ error: error.message });
            }
            if (error.message.includes('ya tiene un resultado')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/resultados/listado:
     *   get:
     *     summary: Obtener listado de resultados
     *     description: Obtiene todos los resultados con filtros opcionales
     *     tags: [Resultados]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: usuario_ID
     *         schema:
     *           type: integer
     *         description: Filtrar por ID de usuario
     *       - in: query
     *         name: id_reactivo
     *         schema:
     *           type: integer
     *         description: Filtrar por ID de reactivo
     *       - in: query
     *         name: es_correcto
     *         schema:
     *           type: boolean
     *         description: Filtrar por respuestas correctas/incorrectas
     *       - in: query
     *         name: fecha_desde
     *         schema:
     *           type: string
     *           format: date
     *         description: Fecha desde (YYYY-MM-DD)
     *       - in: query
     *         name: fecha_hasta
     *         schema:
     *           type: string
     *           format: date
     *         description: Fecha hasta (YYYY-MM-DD)
     *     responses:
     *       200:
     *         description: Resultados obtenidos exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Resultados obtenidos exitosamente"
     *                 resultados:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/ResultadoCompleto'
     *                 total:
     *                   type: integer
     *                   example: 25
     *       401:
     *         description: No autorizado
     *       500:
     *         description: Error interno del servidor
     */
    static async obtenerResultados(req, res) {
        try {
            const filters = {
                usuario_ID: req.query.usuario_ID ? parseInt(req.query.usuario_ID) : undefined,
                id_reactivo: req.query.id_reactivo ? parseInt(req.query.id_reactivo) : undefined,
                es_correcto: req.query.es_correcto !== undefined ? req.query.es_correcto === 'true' : undefined,
                fecha_desde: req.query.fecha_desde || undefined,
                fecha_hasta: req.query.fecha_hasta || undefined
            };

            const resultados = await ResultadoLecturaPseudopalabra.getAllResultados(filters);
            res.json({
                message: 'Resultados obtenidos exitosamente',
                resultados,
                total: resultados.length
            });
        } catch (error) {
            console.error('Error al obtener resultados:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/resultados/obtener/{id}:
     *   get:
     *     summary: Obtener resultado por ID
     *     description: Obtiene un resultado específico por su ID
     *     tags: [Resultados]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del resultado
     *     responses:
     *       200:
     *         description: Resultado obtenido exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Resultado obtenido exitosamente"
     *                 resultado:
     *                   $ref: '#/components/schemas/ResultadoCompleto'
     *       404:
     *         description: Resultado no encontrado
     *       401:
     *         description: No autorizado
     *       500:
     *         description: Error interno del servidor
     */
    static async obtenerResultadoPorId(req, res) {
        try {
            const { id } = req.params;
            const resultado = await ResultadoLecturaPseudopalabra.getResultadoById(id);
            res.json({
                message: 'Resultado obtenido exitosamente',
                resultado
            });
        } catch (error) {
            console.error('Error al obtener resultado:', error);
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/resultados/usuario/{usuario_ID}:
     *   get:
     *     summary: Obtener resultados de un usuario
     *     description: Obtiene todos los resultados de un usuario específico
     *     tags: [Resultados]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: usuario_ID
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del usuario
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *         description: Límite de resultados (opcional)
     *     responses:
     *       200:
     *         description: Resultados del usuario obtenidos exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Resultados del usuario obtenidos exitosamente"
     *                 resultados:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/ResultadoCompleto'
     *                 total:
     *                   type: integer
     *                   example: 15
     *       401:
     *         description: No autorizado
     *       500:
     *         description: Error interno del servidor
     */
    static async obtenerResultadosUsuario(req, res) {
        try {
            const { usuario_ID } = req.params;
            const options = {};
            
            if (req.query.limit) {
                options.limit = parseInt(req.query.limit);
            }

            const resultados = await ResultadoLecturaPseudopalabra.getResultadosByUsuario(usuario_ID, options);
            res.json({
                message: 'Resultados del usuario obtenidos exitosamente',
                resultados,
                total: resultados.length
            });
        } catch (error) {
            console.error('Error al obtener resultados del usuario:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/resultados/actualizar/{id}:
     *   put:
     *     summary: Actualizar resultado
     *     description: Actualiza un resultado existente
     *     tags: [Resultados]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del resultado
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               voz_usuario_URL:
     *                 type: string
     *                 format: uri
     *                 example: "https://res.cloudinary.com/audio456.mp3"
     *               tiempo_respuesta:
     *                 type: integer
     *                 example: 2800
     *               es_correcto:
     *                 type: boolean
     *                 example: false
     *           examples:
     *             agregar_audio:
     *               summary: Agregar URL de audio
     *               value:
     *                 voz_usuario_URL: "https://res.cloudinary.com/audio456.mp3"
     *             corregir_tiempo:
     *               summary: Corregir tiempo de respuesta
     *               value:
     *                 tiempo_respuesta: 2800
     *                 es_correcto: false
     *     responses:
     *       200:
     *         description: Resultado actualizado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Resultado actualizado exitosamente"
     *                 resultado:
     *                   $ref: '#/components/schemas/Resultado'
     *       400:
     *         description: Error de validación
     *       404:
     *         description: Resultado no encontrado
     *       401:
     *         description: No autorizado
     *       500:
     *         description: Error interno del servidor
     */
    static async actualizarResultado(req, res) {
        try {
            const { id } = req.params;
            const resultado = await ResultadoLecturaPseudopalabra.updateResultado(id, req.body);
            res.json({
                message: 'Resultado actualizado exitosamente',
                resultado
            });
        } catch (error) {
            console.error('Error al actualizar resultado:', error);
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
     * /api/resultados/eliminar/{id}:
     *   delete:
     *     summary: Eliminar resultado
     *     description: Elimina un resultado por su ID
     *     tags: [Resultados]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del resultado
     *     responses:
     *       200:
     *         description: Resultado eliminado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Resultado eliminado exitosamente"
     *       404:
     *         description: Resultado no encontrado
     *       401:
     *         description: No autorizado
     *       500:
     *         description: Error interno del servidor
     */
    static async eliminarResultado(req, res) {
        try {
            const { id } = req.params;
            await ResultadoLecturaPseudopalabra.deleteResultado(id);
            res.json({
                message: 'Resultado eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar resultado:', error);
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/resultados/estadisticas/usuario/{usuario_ID}:
     *   get:
     *     summary: Obtener estadísticas de un usuario
     *     description: Obtiene estadísticas detalladas del desempeño de un usuario
     *     tags: [Resultados]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: usuario_ID
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del usuario
     *     responses:
     *       200:
     *         description: Estadísticas del usuario obtenidas exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Estadísticas del usuario obtenidas exitosamente"
     *                 estadisticas:
     *                   $ref: '#/components/schemas/EstadisticasUsuario'
     *       404:
     *         description: No se encontraron estadísticas para el usuario
     *       401:
     *         description: No autorizado
     *       500:
     *         description: Error interno del servidor
     */
    static async obtenerEstadisticasUsuario(req, res) {
        try {
            const { usuario_ID } = req.params;
            const estadisticas = await ResultadoLecturaPseudopalabra.getEstadisticasUsuario(usuario_ID);
            
            if (!estadisticas) {
                return res.status(404).json({ 
                    error: 'No se encontraron estadísticas para este usuario' 
                });
            }

            res.json({
                message: 'Estadísticas del usuario obtenidas exitosamente',
                estadisticas
            });
        } catch (error) {
            console.error('Error al obtener estadísticas del usuario:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/resultados/estadisticas/reactivo/{id_reactivo}:
     *   get:
     *     summary: Obtener estadísticas de un reactivo
     *     description: Obtiene estadísticas de desempeño de un reactivo específico
     *     tags: [Resultados]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id_reactivo
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del reactivo
     *     responses:
     *       200:
     *         description: Estadísticas del reactivo obtenidas exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Estadísticas del reactivo obtenidas exitosamente"
     *                 estadisticas:
     *                   type: object
     *                   properties:
     *                     pseudopalabra:
     *                       type: string
     *                       example: "blista"
     *                     tiempo_duracion:
     *                       type: integer
     *                       example: 3000
     *                     total_intentos:
     *                       type: integer
     *                       example: 12
     *                     respuestas_correctas:
     *                       type: integer
     *                       example: 8
     *                     respuestas_incorrectas:
     *                       type: integer
     *                       example: 4
     *                     porcentaje_acierto:
     *                       type: number
     *                       example: 66.67
     *                     tiempo_promedio_respuesta:
     *                       type: number
     *                       example: 2750.5
     *       404:
     *         description: No se encontraron estadísticas para el reactivo
     *       401:
     *         description: No autorizado
     *       500:
     *         description: Error interno del servidor
     */
    static async obtenerEstadisticasReactivo(req, res) {
        try {
            const { id_reactivo } = req.params;
            const estadisticas = await ResultadoLecturaPseudopalabra.getEstadisticasReactivo(id_reactivo);
            
            if (!estadisticas) {
                return res.status(404).json({ 
                    error: 'No se encontraron estadísticas para este reactivo' 
                });
            }

            res.json({
                message: 'Estadísticas del reactivo obtenidas exitosamente',
                estadisticas
            });
        } catch (error) {
            console.error('Error al obtener estadísticas del reactivo:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/resultados/ranking/usuarios:
     *   get:
     *     summary: Obtener ranking de usuarios
     *     description: Obtiene el ranking de usuarios por desempeño
     *     tags: [Resultados]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Límite de usuarios en el ranking
     *     responses:
     *       200:
     *         description: Ranking de usuarios obtenido exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Ranking de usuarios obtenido exitosamente"
     *                 ranking:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/RankingUsuario'
     *                 total:
     *                   type: integer
     *                   example: 8
     *       401:
     *         description: No autorizado
     *       500:
     *         description: Error interno del servidor
     */
    static async obtenerRankingUsuarios(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const ranking = await ResultadoLecturaPseudopalabra.getRankingUsuarios(limit);
            res.json({
                message: 'Ranking de usuarios obtenido exitosamente',
                ranking,
                total: ranking.length
            });
        } catch (error) {
            console.error('Error al obtener ranking de usuarios:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    /**
     * @swagger
     * /api/resultados/reactivos/mas-dificiles:
     *   get:
     *     summary: Obtener reactivos más difíciles
     *     description: Obtiene los reactivos con menor tasa de acierto
     *     tags: [Resultados]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Límite de reactivos
     *     responses:
     *       200:
     *         description: Reactivos más difíciles obtenidos exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Reactivos más difíciles obtenidos exitosamente"
     *                 reactivos:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id_reactivo:
     *                         type: integer
     *                       pseudopalabra:
     *                         type: string
     *                       tiempo_duracion:
     *                         type: integer
     *                       total_intentos:
     *                         type: integer
     *                       porcentaje_acierto:
     *                         type: number
     *                       tiempo_promedio_respuesta:
     *                         type: number
     *                 total:
     *                   type: integer
     *                   example: 5
     *       401:
     *         description: No autorizado
     *       500:
     *         description: Error interno del servidor
     */
    static async obtenerReactivosMasDificiles(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const reactivos = await ResultadoLecturaPseudopalabra.getReactivosMasDificiles(limit);
            res.json({
                message: 'Reactivos más difíciles obtenidos exitosamente',
                reactivos,
                total: reactivos.length
            });
        } catch (error) {
            console.error('Error al obtener reactivos más difíciles:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

module.exports = ResultadoController;
