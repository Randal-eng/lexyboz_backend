// Reporte por kit y paciente: porcentaje de aciertos por ejercicio
const obtenerReportePorKitPaciente = async (req, res) => {
    try {
        const { kit_id, paciente_id } = req.params;
        const pool = require('../../../db/connection');
        // Consulta: obtener resultados, ejercicio y aciertos
        // 1. Buscar ejercicios del kit
        // La tabla ejercicios no tiene kit_id, se debe obtener los ejercicios a través de la relación con ejercicios_kits
        // Log de depuración: mostrar registros de ejercicios_kits para el kit
        const relKitsEjercicios = await pool.query(
            'SELECT * FROM ejercicios_kits WHERE kit_id = $1',
            [kit_id]
        );
        console.log('[ReporteKitPaciente] registros en ejercicios_kits para kit', kit_id, ':', relKitsEjercicios.rows);

        const ejerciciosRes = await pool.query(
            `SELECT e.ejercicio_id FROM ejercicios e
            INNER JOIN ejercicios_kits ek ON ek.ejercicio_id = e.ejercicio_id
            WHERE ek.kit_id = $1`,
            [kit_id]
        );
        console.log('[ReporteKitPaciente] ejercicios encontrados para kit', kit_id, ':', ejerciciosRes.rows);
        const ejercicios = [];
        for (const ejercicio of ejerciciosRes.rows) {
            // 2. Buscar reactivos del ejercicio
            const reactivosRes = await pool.query(
                'SELECT reactivo_id FROM ejercicio_reactivos WHERE ejercicio_id = $1',
                [ejercicio.ejercicio_id]
            );
            const reactivoIds = reactivosRes.rows.map(r => r.reactivo_id);
            if (reactivoIds.length === 0) {
                ejercicios.push({
                    ejercicio_id: ejercicio.ejercicio_id,
                    aciertos: 0,
                    total: 0,
                    porcentaje: 0,
                    tiempo_promedio: 0,
                    ia_ultima_respuesta: null
                });
                continue;
            }
            // 3. Buscar resultados del paciente para esos reactivos
            const resultadosRes = await pool.query(
                `SELECT es_correcto, tiempo_respuesta, ia_respuesta FROM resultados_lectura_pseudopalabras WHERE usuario_id = $1 AND id_reactivo = ANY($2::int[]) ORDER BY fecha_realizacion ASC`,
                [paciente_id, reactivoIds]
            );
            const total = resultadosRes.rows.length;
            const aciertos = resultadosRes.rows.filter(r => r.es_correcto).length;
            // Calcular tiempo promedio
            const tiempos = resultadosRes.rows.map(r => Number(r.tiempo_respuesta)).filter(t => !isNaN(t));
            const tiempo_promedio = tiempos.length > 0 ? (tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0;
            // Obtener última respuesta de IA (si existe)
            let ia_ultima_respuesta = null;
            for (let i = resultadosRes.rows.length - 1; i >= 0; i--) {
                if (resultadosRes.rows[i].ia_respuesta) {
                    try {
                        ia_ultima_respuesta = JSON.parse(resultadosRes.rows[i].ia_respuesta);
                    } catch {
                        ia_ultima_respuesta = resultadosRes.rows[i].ia_respuesta;
                    }
                    break;
                }
            }
            ejercicios.push({
                ejercicio_id: ejercicio.ejercicio_id,
                aciertos,
                total,
                porcentaje: total > 0 ? Math.round((aciertos / total) * 100) : 0,
                tiempo_promedio: Number(tiempo_promedio.toFixed(2)),
                ia_ultima_respuesta
            });
        }
        return res.json({
            kit_id: Number(kit_id),
            paciente_id: Number(paciente_id),
            ejercicios
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al obtener el reporte',
            error: error.message
        });
    }
};
// Nuevo controlador: flujo igual al original pero responde con el registro insertado
/**
 * Endpoint: POST /api/resultados-lectura-pseudopalabras-directo
 * Recibe audio, lo envía a la IA, sube a Cloudinary, guarda y responde con el registro insertado.
 */
const guardarResultadoLecturaPseudopalabrasDirectoFull = async (req, res) => {
    try {
        // Limpiar y normalizar body
        const cleanBody = {};
        Object.keys(req.body).forEach(key => {
            const trimmedKey = key.trim();
            cleanBody[trimmedKey] = typeof req.body[key] === 'string' ? req.body[key].trim() : req.body[key];
        });
    let paciente_id = cleanBody.paciente_id ? Number(cleanBody.paciente_id) : null;
        let id_reactivo = cleanBody.id_reactivo ? Number(cleanBody.id_reactivo) : null;
        let tiempo_respuesta = cleanBody.tiempo_respuesta ? Number(cleanBody.tiempo_respuesta) : null;

        // Enviar audio a la IA si existe
        let iaResponse = null;
        if (req.file) {
            const FormData = require('form-data');
            const axios = require('axios');
            const form = new FormData();
            form.append('file', req.file.buffer, {
                filename: req.file.originalname || 'audio.wav',
                contentType: req.file.mimetype || 'audio/wav'
            });
            try {
                const iaRes = await axios.post('https://lexyvoz-ai.onrender.com/inferir/', form, {
                    headers: form.getHeaders(),
                    maxBodyLength: Infinity,
                    timeout: 30000
                });
                iaResponse = iaRes.data;
            } catch (err) {
                iaResponse = { error: 'Error al procesar el audio con la IA' };
            }
        }

        // Subir audio a Cloudinary si existe
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

        // Normalizar probabilidad y es_correcto
        let iaToSave = iaResponse || { clase: null, probabilidad: 0 };
        if (iaToSave && typeof iaToSave.probabilidad === 'string') {
            iaToSave.probabilidad = parseFloat(iaToSave.probabilidad);
        }
        if (!iaToSave || typeof iaToSave.probabilidad !== 'number' || isNaN(iaToSave.probabilidad)) {
            iaToSave = { clase: null, probabilidad: 0 };
        }
        let es_correcto = iaToSave.probabilidad >= 80;

        // Insertar en la base de datos y devolver el registro
        const pool = require('../../../db/connection');
        const query = `
            INSERT INTO resultados_lectura_pseudopalabras (
                usuario_id, id_reactivo, voz_usuario_url, tiempo_respuesta, es_correcto, fecha_realizacion
            ) VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *;
        `;
    const values = [paciente_id, id_reactivo, voz_usuario_url, tiempo_respuesta, es_correcto];
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(500).json({ message: 'No se pudo insertar el resultado.' });
        }
        return res.status(201).json({
            message: 'Resultado guardado correctamente',
            resultado: result.rows[0],
            ia: iaResponse
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al guardar resultado',
            error: error.message
        });
    }
};
// Nuevo controlador: guarda resultado y devuelve el registro insertado
/**
 * Endpoint: POST /api/resultados-lectura-pseudopalabras
 * Descripción: Guarda el resultado de lectura de pseudopalabras y devuelve el registro insertado.
 */
const guardarResultadoLecturaPseudopalabrasDirecto = async (req, res) => {
    try {
        // Normalizar y limpiar datos
        const cleanBody = {};
        Object.keys(req.body).forEach(key => {
            const trimmedKey = key.trim();
            cleanBody[trimmedKey] = typeof req.body[key] === 'string' ? req.body[key].trim() : req.body[key];
        });
    let paciente_id = cleanBody.paciente_id ? Number(cleanBody.paciente_id) : null;
        let id_reactivo = cleanBody.id_reactivo ? Number(cleanBody.id_reactivo) : null;
        let voz_usuario_url = cleanBody.voz_usuario_url || null;
        let tiempo_respuesta = cleanBody.tiempo_respuesta ? Number(cleanBody.tiempo_respuesta) : null;
        let probabilidad = cleanBody.probabilidad ? Number(cleanBody.probabilidad) : 0;
        let es_correcto = probabilidad >= 80;

        // Insertar en la base de datos
        const pool = require('../../../db/connection');
        const query = `
            INSERT INTO resultados_lectura_pseudopalabras (
                usuario_id, id_reactivo, voz_usuario_url, tiempo_respuesta, es_correcto, fecha_realizacion
            ) VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *;
        `;
    const values = [paciente_id, id_reactivo, voz_usuario_url, tiempo_respuesta, es_correcto];
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(500).json({ message: 'No se pudo insertar el resultado.' });
        }
        return res.status(201).json({
            message: 'Resultado guardado correctamente',
            resultado: result.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al guardar resultado',
            error: error.message
        });
    }
};
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

/**
 * Endpoint: POST /api/resultados/guardar-lectura-pseudopalabras
 * Descripción: Guarda el resultado de lectura de pseudopalabras (audio y datos) para un usuario y reactivo.
 * Cambios recientes:
 *   - Se verifica si el kit está marcado como 'done' antes de guardar el resultado.
 *   - Si el kit no está marcado como 'done', se guarda el resultado y se actualiza el kit a 'done'.
 *   - Si el kit ya está marcado como 'done', se bloquea el guardado de más resultados para ese kit.
 */
const guardarResultadoLecturaPseudopalabras = async (req, res) => {
    try {
        console.log('Datos recibidos en endpoint guardarResultadoLecturaPseudopalabras:', req.body);
        // Limpiar nombres y valores de campos y normalizar id_reactivo
        const cleanBody = {};
        Object.keys(req.body).forEach(key => {
            const trimmedKey = key.trim();
            cleanBody[trimmedKey] = typeof req.body[key] === 'string' ? req.body[key].trim() : req.body[key];
        });
        // Buscar id_reactivo aunque tenga espacios
        let id_reactivo = cleanBody.id_reactivo;
        if (!id_reactivo) {
            // Buscar variantes con espacios
            id_reactivo = Object.keys(cleanBody).find(k => k.replace(/\s+/g, '') === 'id_reactivo') ? cleanBody[Object.keys(cleanBody).find(k => k.replace(/\s+/g, '') === 'id_reactivo')] : null;
        }
        let usuario_id = cleanBody.usuario_id ? Number(cleanBody.usuario_id) : null;
        id_reactivo = id_reactivo ? Number(id_reactivo) : null;
        let tiempo_respuesta = cleanBody.tiempo_respuesta ? Number(cleanBody.tiempo_respuesta) : null;
        let kit_id = cleanBody.kit_id ? Number(cleanBody.kit_id) : null;

        // Verificar si el kit está marcado como 'done'
        const pool = require('../../kits/models/Kit').pool || require('../../../db/connection');
        const kitDoneResult = await pool.query('SELECT done FROM kits WHERE kit_id = $1', [kit_id]);
        if (kitDoneResult.rows.length === 0) {
            return res.status(400).json({ message: 'Kit no encontrado' });
        }

        let iaResponse = null;
        if (req.file) {
            const FormData = require('form-data');
            const axios = require('axios');
            const form = new FormData();
            form.append('file', req.file.buffer, {
                filename: req.file.originalname || 'audio.wav',
                contentType: req.file.mimetype || 'audio/wav'
            });
            try {
                const iaRes = await axios.post('https://lexyvoz-ai.onrender.com/inferir/', form, {
                    headers: form.getHeaders(),
                    maxBodyLength: Infinity,
                    timeout: 30000 // 30 segundos
                });
                iaResponse = iaRes.data;
            } catch (err) {
                console.error('Error al enviar audio a la IA:', err);
                iaResponse = { error: 'Error al procesar el audio con la IA' };
            }
        }

        if (kitDoneResult.rows[0].done) {
            // Si el kit está marcado como done, solo devuelve la respuesta de la IA, no guarda resultado
            return res.status(200).json({
                message: 'El kit ya está completado, solo se devuelve la respuesta de la IA.',
                ia: iaResponse
            });
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

        // Si la probabilidad no es válida, forzar es_correcto=false en el modelo
        let iaToSave = iaResponse || { clase: null, probabilidad: 0 };
        // Si la probabilidad existe pero es string, convertirla a número
        if (iaToSave && typeof iaToSave.probabilidad === 'string') {
            iaToSave.probabilidad = parseFloat(iaToSave.probabilidad);
        }
        // Si no es número, poner 0
        if (!iaToSave || typeof iaToSave.probabilidad !== 'number' || isNaN(iaToSave.probabilidad)) {
            iaToSave = { clase: null, probabilidad: 0 };
        }

        // Log para depuración antes de guardar en la base de datos
        console.log('[Controller] Llamando a guardarResultadoIA con:', {
            usuario_id,
            id_reactivo,
            voz_usuario_url,
            tiempo_respuesta,
            ia: iaToSave
        });
        // Usar la función del modelo para guardar el resultado de la IA
        let resultado;
        try {
            resultado = await reactivoModel.guardarResultadoIA({
                usuario_id,
                id_reactivo,
                voz_usuario_url,
                tiempo_respuesta,
                ia: iaToSave
            });
        } catch (err) {
            return res.status(500).json({
                message: 'Error al guardar resultado en la base de datos',
                error: err.message
            });
        }

        // Marcar el kit como done después del guardado exitoso
        try {
            await pool.query('UPDATE kits SET done = true WHERE kit_id = $1', [kit_id]);
        } catch (err) {
            // Si falla el update, igual se retorna el resultado guardado
            return res.status(201).json({
                message: 'Resultado guardado, pero no se pudo actualizar el kit a done',
                resultado,
                ia: iaResponse,
                error: err.message
            });
        }

        return res.status(201).json({
            message: 'Resultado guardado exitosamente',
            resultado,
            ia: iaResponse,
            paciente_id: usuario_id
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
    guardarResultadoLecturaPseudopalabrasDirecto,
    guardarResultadoLecturaPseudopalabrasDirectoFull,
    obtenerReportePorKitPaciente,
    upload
};
