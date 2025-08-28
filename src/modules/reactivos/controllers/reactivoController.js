const reactivoModel = require('../models/Reactivo');
const ResultadoLecturaPseudopalabras = require('../models/ResultadoLecturaPseudopalabras');
const cloudinary = require('../../../config/cloudinary/cloudinaryConfig');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

// =====================================================
// CONTROLADORES DE REACTIVOS
// =====================================================

/**
 * Crear un nuevo reactivo
*/
const crearReactivo = async (req, res) => {
    console.log('Datos recibidos:', req.body);
    try {
        const { contenido, orden, sub_tipo_id, tiempo_limite, configuracion } = req.body;

        if (!contenido || !sub_tipo_id) {
            return res.status(400).json({
                message: 'El contenido y sub_tipo_id son requeridos.'
            });
        }

        const nuevoReactivo = await reactivoModel.crearReactivo({
            contenido,
            orden: orden || 1,
            sub_tipo_id,
            tiempo_limite,
            configuracion
        });

        res.status(201).json({
            message: 'Reactivo creado exitosamente',
            reactivo: nuevoReactivo
        });

    } catch (error) {
        console.error('Error al crear reactivo:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtener todos los reactivos con paginación y filtros
 */
const obtenerReactivos = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            activo,
            sub_tipo_id,
            tipo_id,
            buscar
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const filtros = {
            limit: parseInt(limit),
            offset,
            activo: activo !== undefined ? activo === 'true' : null,
            sub_tipo_id: sub_tipo_id ? parseInt(sub_tipo_id) : null,
            tipo_id: tipo_id ? parseInt(tipo_id) : null,
            buscar
        };

        const resultado = await reactivoModel.obtenerReactivos(filtros);

        res.json({
            message: 'Reactivos obtenidos exitosamente',
            data: resultado.reactivos,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(resultado.total / parseInt(limit)),
                total_items: resultado.total,
                items_per_page: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener reactivos:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtener un reactivo por ID
 */
const obtenerReactivoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: 'ID de reactivo inválido'
            });
        }

        const reactivo = await reactivoModel.obtenerReactivoPorId(parseInt(id));

        if (!reactivo) {
            return res.status(404).json({
                message: 'Reactivo no encontrado'
            });
        }

        res.json({
            message: 'Reactivo obtenido exitosamente',
            reactivo
        });

    } catch (error) {
        console.error('Error al obtener reactivo:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Actualizar un reactivo
 */
const actualizarReactivo = async (req, res) => {
    try {
        const { id } = req.params;
        const datosActualizacion = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: 'ID de reactivo inválido'
            });
        }

        // Verificar que el reactivo existe
        const reactivoExistente = await reactivoModel.obtenerReactivoPorId(parseInt(id));
        if (!reactivoExistente) {
            return res.status(404).json({
                message: 'Reactivo no encontrado'
            });
        }

        const reactivoActualizado = await reactivoModel.actualizarReactivo(parseInt(id), datosActualizacion);

        res.json({
            message: 'Reactivo actualizado exitosamente',
            reactivo: reactivoActualizado
        });

    } catch (error) {
        console.error('Error al actualizar reactivo:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Eliminar un reactivo (soft delete)
 */
const eliminarReactivo = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: 'ID de reactivo inválido'
            });
        }

        // Verificar que el reactivo existe
        const reactivoExistente = await reactivoModel.obtenerReactivoPorId(parseInt(id));
        if (!reactivoExistente) {
            return res.status(404).json({
                message: 'Reactivo no encontrado'
            });
        }

        const reactivoEliminado = await reactivoModel.eliminarReactivo(parseInt(id));

        res.json({
            message: 'Reactivo eliminado exitosamente',
            reactivo: reactivoEliminado
        });

    } catch (error) {
        console.error('Error al eliminar reactivo:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtener reactivos por sub tipo
 */
const obtenerReactivosPorSubTipo = async (req, res) => {
    try {
        const { sub_tipo_id } = req.params;
        const {
            page = 1,
            limit = 20,
            activo = true
        } = req.query;

        if (!sub_tipo_id || isNaN(sub_tipo_id)) {
            return res.status(400).json({
                message: 'ID de sub tipo inválido'
            });
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const filtros = {
            limit: parseInt(limit),
            offset,
            activo: activo !== undefined ? activo === 'true' : null
        };

        const resultado = await reactivoModel.obtenerReactivosPorSubTipo(parseInt(sub_tipo_id), filtros);

        res.json({
            message: 'Reactivos por sub tipo obtenidos exitosamente',
            data: resultado.reactivos,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(resultado.total / parseInt(limit)),
                total_items: resultado.total,
                items_per_page: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener reactivos por sub tipo:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtener reactivos por tipo
 */
const obtenerReactivosPorTipo = async (req, res) => {
    try {
        const { tipo_id } = req.params;
        const {
            page = 1,
            limit = 20,
            activo = true
        } = req.query;

        if (!tipo_id || isNaN(tipo_id)) {
            return res.status(400).json({
                message: 'ID de tipo inválido'
            });
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const filtros = {
            limit: parseInt(limit),
            offset,
            activo: activo !== undefined ? activo === 'true' : null
        };

        const resultado = await reactivoModel.obtenerReactivosPorTipo(parseInt(tipo_id), filtros);

        res.json({
            message: 'Reactivos por tipo obtenidos exitosamente',
            data: resultado.reactivos,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(resultado.total / parseInt(limit)),
                total_items: resultado.total,
                items_per_page: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener reactivos por tipo:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Verificar compatibilidad de tipo para un ejercicio
 */
const verificarCompatibilidadTipo = async (req, res) => {
    try {
        const { ejercicio_id, tipo_id } = req.params;

        if (!ejercicio_id || isNaN(ejercicio_id) || !tipo_id || isNaN(tipo_id)) {
            return res.status(400).json({
                message: 'IDs de ejercicio y tipo inválidos'
            });
        }

        const compatibilidad = await reactivoModel.verificarCompatibilidadTipo(
            parseInt(ejercicio_id),
            parseInt(tipo_id)
        );

        res.json({
            message: 'Compatibilidad verificada',
            ...compatibilidad
        });

    } catch (error) {
        console.error('Error al verificar compatibilidad:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Agregar reactivos a un ejercicio
 */
const agregarReactivosAEjercicio = async (req, res) => {
    try {
        const { ejercicio_id } = req.params;
        const { reactivos } = req.body;

        if (!ejercicio_id || isNaN(ejercicio_id)) {
            return res.status(400).json({
                message: 'ID de ejercicio inválido'
            });
        }

        if (!reactivos || !Array.isArray(reactivos) || reactivos.length === 0) {
            return res.status(400).json({
                message: 'Se requiere un array de reactivos'
            });
        }

        const resultado = await reactivoModel.agregarReactivosAEjercicio(
            parseInt(ejercicio_id),
            reactivos
        );

        res.status(201).json({
            message: 'Reactivos agregados al ejercicio exitosamente',
            ...resultado
        });

    } catch (error) {
        console.error('Error al agregar reactivos al ejercicio:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtener reactivos de un ejercicio
 */
const obtenerReactivosDeEjercicio = async (req, res) => {
    try {
        const { ejercicio_id } = req.params;

        if (!ejercicio_id || isNaN(ejercicio_id)) {
            return res.status(400).json({
                message: 'ID de ejercicio inválido'
            });
        }

        const reactivos = await reactivoModel.obtenerReactivosDeEjercicio(parseInt(ejercicio_id));

        res.json({
            message: 'Reactivos del ejercicio obtenidos exitosamente',
            ejercicio_id: parseInt(ejercicio_id),
            reactivos,
            total: reactivos.length
        });

    } catch (error) {
        console.error('Error al obtener reactivos del ejercicio:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Remover un reactivo de un ejercicio
 */
const removerReactivoDeEjercicio = async (req, res) => {
    try {
        const { ejercicio_id, reactivo_id } = req.params;

        if (!ejercicio_id || isNaN(ejercicio_id) || !reactivo_id || isNaN(reactivo_id)) {
            return res.status(400).json({
                message: 'IDs de ejercicio y reactivo inválidos'
            });
        }

        const resultado = await reactivoModel.removerReactivoDeEjercicio(
            parseInt(ejercicio_id),
            parseInt(reactivo_id)
        );

        res.json({
            message: 'Reactivo removido del ejercicio exitosamente',
            relacion: resultado
        });

    } catch (error) {
        console.error('Error al remover reactivo del ejercicio:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Reordenar reactivos en un ejercicio
 */
const reordenarReactivosEnEjercicio = async (req, res) => {
    try {
        const { ejercicio_id } = req.params;
        const { nuevos_ordenes } = req.body;

        if (!ejercicio_id || isNaN(ejercicio_id)) {
            return res.status(400).json({
                message: 'ID de ejercicio inválido'
            });
        }

        if (!nuevos_ordenes || !Array.isArray(nuevos_ordenes)) {
            return res.status(400).json({
                message: 'Se requiere un array de nuevos órdenes'
            });
        }

        const resultado = await reactivoModel.reordenarReactivosEnEjercicio(
            parseInt(ejercicio_id),
            nuevos_ordenes
        );

        res.json({
            message: 'Reactivos reordenados exitosamente',
            ejercicio_id: parseInt(ejercicio_id),
            reactivos_actualizados: resultado
        });

    } catch (error) {
        console.error('Error al reordenar reactivos:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};



// Controlador para guardar resultado de lectura de pseudopalabras

const guardarResultadoLecturaPseudopalabras = async (req, res) => {
/**
 * Endpoint: POST /api/resultados/guardar-lectura-pseudopalabras
 * Descripción: Guarda el resultado de lectura de pseudopalabras (audio y datos) para un usuario y reactivo.
 * Cambios recientes:
 *   - Se verifica si el kit está marcado como 'done' antes de guardar el resultado.
 *   - Si el kit no está marcado como 'done', se guarda el resultado y se actualiza el kit a 'done'.
 *   - Si el kit ya está marcado como 'done', se bloquea el guardado de más resultados para ese kit.
 * Campos requeridos en el body:
 *   - usuario_id: ID del usuario
 *   - id_reactivo: ID del reactivo
 *   - kit_id: ID del kit
 *   - tiempo_respuesta, es_correcto, fecha_realizacion, voz_usuario_url (opcional, se sube a Cloudinary)
 * Respuestas:
 *   - 201: Resultado guardado exitosamente y kit marcado como completado
 *   - 403: El kit ya está completado, no se permite guardar más resultados
 *   - 400: Kit no encontrado
 *   - 500: Error interno del servidor
 */
    try {
            console.log('Datos recibidos en endpoint guardarResultadoLecturaPseudopalabras:', req.body);
            // Limpiar nombres y valores de campos
            const cleanBody = {};
            Object.keys(req.body).forEach(key => {
                cleanBody[key.trim()] = typeof req.body[key] === 'string' ? req.body[key].trim() : req.body[key];
            });
            let { usuario_id, id_reactivo, tiempo_respuesta, es_correcto, fecha_realizacion, kit_id } = cleanBody;
            usuario_id = usuario_id ? Number(usuario_id) : null;
            id_reactivo = id_reactivo ? Number(id_reactivo) : null;
            tiempo_respuesta = tiempo_respuesta ? Number(tiempo_respuesta) : null;
            kit_id = kit_id ? Number(kit_id) : null;
            if (typeof es_correcto === 'string') {
                es_correcto = es_correcto === 'true';
            }
            // Verificar si el kit está marcado como 'done'
            const pool = require('../../kits/models/Kit').pool || require('../../../db/connection');
            const kitDoneResult = await pool.query('SELECT done FROM kits WHERE kit_id = $1', [kit_id]);
            if (kitDoneResult.rows.length === 0) {
                return res.status(400).json({ message: 'Kit no encontrado' });
            }
            if (kitDoneResult.rows[0].done) {
                return res.status(403).json({ message: 'No se permite guardar más resultados, el kit ya está marcado como completado.' });
            }
            let voz_usuario_url = null;
            if (req.file) {
                voz_usuario_url = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'video', folder: 'resultados_voz_usuarios' },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result.secure_url);
                        }
                    );
                    stream.end(req.file.buffer);
                });
            }
            // Insertar resultado solo si el kit no está marcado como done
            const resultado = await ResultadoLecturaPseudopalabras.create({
                usuario_id,
                id_reactivo,
                voz_usuario_url,
                tiempo_respuesta,
                es_correcto,
                fecha_realizacion
            });
            // Marcar el kit como done después del primer intento
            await pool.query('UPDATE kits SET done = true WHERE kit_id = $1', [kit_id]);
            res.status(201).json({
                message: 'Resultado guardado exitosamente',
                resultado
            });
    } catch (error) {
        console.error('Error al guardar resultado:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    crearReactivo,
    obtenerReactivos,
    obtenerReactivoPorId,
    actualizarReactivo,
    eliminarReactivo,
    obtenerReactivosPorSubTipo,
    obtenerReactivosPorTipo,
    verificarCompatibilidadTipo,
    agregarReactivosAEjercicio,
    obtenerReactivosDeEjercicio,
    removerReactivoDeEjercicio,
    reordenarReactivosEnEjercicio,
    guardarResultadoLecturaPseudopalabras,
    upload
};
