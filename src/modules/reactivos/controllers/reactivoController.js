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
        // Buscar el archivo de audio en req.files (puede ser 'audio' o 'voz_usuario')
        const audioFile = req.files ? req.files.find(f => 
            f.fieldname === 'audio' || f.fieldname === 'voz_usuario'
        ) : null;
        
        if (audioFile) {
            const FormData = require('form-data');
            const axios = require('axios');
            const form = new FormData();
            form.append('file', audioFile.buffer, {
                filename: audioFile.originalname || 'audio.wav',
                contentType: audioFile.mimetype || 'audio/wav'
            });
            try {
                console.log('Enviando audio a IA...', {
                    url: 'https://lexyvoz-ai.onrender.com/inferir/',
                    filename: audioFile.originalname,
                    size: audioFile.size,
                    mimetype: audioFile.mimetype
                });
                
                const iaRes = await axios.post('https://lexyvoz-ai.onrender.com/inferir/', form, {
                    headers: form.getHeaders(),
                    maxBodyLength: Infinity,
                    timeout: 30000
                });
                
                console.log('Respuesta de IA recibida:', {
                    status: iaRes.status,
                    data: iaRes.data
                });
                
                iaResponse = iaRes.data;
            } catch (err) {
                console.error('Error al enviar audio a la IA:', {
                    message: err.message,
                    code: err.code,
                    response: err.response?.data,
                    status: err.response?.status
                });
                iaResponse = { error: 'Error al procesar el audio con la IA', details: err.message };
            }
        }

        // Subir audio a Cloudinary si existe
        let voz_usuario_url = null;
        if (audioFile) {
            voz_usuario_url = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'video', folder: 'resultados_voz_usuarios' },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    }
                );
                stream.end(audioFile.buffer);
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
        let es_correcto = iaToSave.probabilidad >= 70;

        console.log('[Controller] Cálculo es_correcto:', {
            probabilidad: iaToSave.probabilidad,
            es_correcto,
            umbral: 70
        });

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
        // Aceptar tanto paciente_id como usuario_id
        let usuario_id = cleanBody.usuario_id ? Number(cleanBody.usuario_id) : 
                        cleanBody.paciente_id ? Number(cleanBody.paciente_id) : null;
        let id_reactivo = cleanBody.id_reactivo ? Number(cleanBody.id_reactivo) : null;
        let voz_usuario_url = cleanBody.voz_usuario_url || null;
        let tiempo_respuesta = cleanBody.tiempo_respuesta ? Number(cleanBody.tiempo_respuesta) : null;
        let probabilidad = cleanBody.probabilidad ? Number(cleanBody.probabilidad) : 0;
        let es_correcto = probabilidad >= 70;

        console.log('[Controller JSON] Cálculo es_correcto:', {
            probabilidad,
            es_correcto,
            umbral: 70
        });

        // Validar datos requeridos
        if (!usuario_id) {
            return res.status(400).json({ 
                message: 'usuario_id o paciente_id es requerido',
                received: cleanBody
            });
        }
        
        if (!id_reactivo) {
            return res.status(400).json({ 
                message: 'id_reactivo es requerido',
                received: cleanBody
            });
        }

        // Insertar en la base de datos
        const pool = require('../../../db/connection');
        const query = `
            INSERT INTO resultados_lectura_pseudopalabras (
                usuario_id, id_reactivo, voz_usuario_url, tiempo_respuesta, es_correcto, fecha_realizacion
            ) VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *;
        `;
        const values = [usuario_id, id_reactivo, voz_usuario_url, tiempo_respuesta, es_correcto];
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
const reactivoPalabrasNormalesModel = require('../models/ReactivoLecturaPalabras');
const ResultadoLecturaPseudopalabras = require('../models/ResultadoLecturaPseudopalabras');
const cloudinary = require('../../../config/cloudinary/cloudinaryConfig');

// =====================================================
// FUNCIÓN HELPER PARA VERIFICAR PROGRESO DEL EJERCICIO
// =====================================================
const verificarYMarcarKitCompleto = async (kit_id, usuario_id, pool) => {
    try {
        console.log('[Helper] Verificando progreso del ejercicio para kit:', kit_id);
        
        // 1. Obtener el ejercicio_id del kit_id
        const ejercicioEnKitQuery = `
            SELECT ek.ejercicio_id 
            FROM ejercicios_kits ek 
            WHERE ek.kit_id = $1 AND ek.activo = true
            LIMIT 1
        `;
        const ejercicioResult = await pool.query(ejercicioEnKitQuery, [kit_id]);
        
        if (ejercicioResult.rows.length === 0) {
            console.log('[Helper] No se encontró ejercicio activo para el kit');
            return false;
        }
        
        const ejercicio_id = ejercicioResult.rows[0].ejercicio_id;
        console.log('[Helper] Ejercicio encontrado:', ejercicio_id);
        
        // 2. Contar total de reactivos en el ejercicio
        const totalReactivosQuery = `
            SELECT COUNT(*) as total
            FROM ejercicio_reactivos er
            WHERE er.ejercicio_id = $1
        `;
        const totalResult = await pool.query(totalReactivosQuery, [ejercicio_id]);
        const totalReactivos = parseInt(totalResult.rows[0].total);
        
        // 3. Contar reactivos completados por el usuario en este ejercicio
        const completadosQuery = `
            SELECT COUNT(DISTINCT r.id_reactivo) as completados
            FROM resultados_lectura_pseudopalabras r
            INNER JOIN ejercicio_reactivos er ON r.id_reactivo = er.reactivo_id
            WHERE r.usuario_id = $1 AND er.ejercicio_id = $2
        `;
        const completadosResult = await pool.query(completadosQuery, [usuario_id, ejercicio_id]);
        const reactivosCompletados = parseInt(completadosResult.rows[0].completados);
        
        console.log('[Helper] Progreso:', {
            ejercicio_id,
            totalReactivos,
            reactivosCompletados,
            porcentaje: Math.round((reactivosCompletados / totalReactivos) * 100)
        });
        
        // 4. Solo marcar kit como done si completó TODOS los reactivos
        if (reactivosCompletados >= totalReactivos) {
            console.log('[Helper] ¡Ejercicio completado! Marcando kit como done');
            await pool.query('UPDATE kits SET done = true WHERE kit_id = $1', [kit_id]);
            console.log('[Helper] Kit marcado como done exitosamente');
            return true;
        } else {
            console.log(`[Helper] Ejercicio aún no completado: ${reactivosCompletados}/${totalReactivos}`);
            return false;
        }
    } catch (err) {
        console.error('[Helper] ERROR al verificar progreso del ejercicio:', err.message);
        return false;
    }
};
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        // Aceptar cualquier archivo
        cb(null, true);
    },
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB límite
        fields: 20, // Permitir hasta 20 campos
        files: 5    // Permitir hasta 5 archivos
    }
});

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

        // Mapear campos del controlador al modelo
        const nuevoReactivo = await reactivoModel.crearReactivo({
            pseudopalabra: contenido,           // Mapear contenido → pseudopalabra
            id_sub_tipo: sub_tipo_id,          // Mapear sub_tipo_id → id_sub_tipo
            tiempo_duracion: tiempo_limite     // Mapear tiempo_limite → tiempo_duracion
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
 * Crear un nuevo reactivo de palabras normales
 */
const crearReactivoPalabraNormal = async (req, res) => {
    console.log('Datos recibidos para palabras normales:', req.body);
    try {
        const { contenido, orden, sub_tipo_id, tiempo_limite } = req.body;

        if (!contenido || !sub_tipo_id) {
            return res.status(400).json({
                message: 'El contenido (palabra) y sub_tipo_id son requeridos.'
            });
        }

        // Mapear campos del controlador al modelo
        const nuevoReactivo = await reactivoPalabrasNormalesModel.crearReactivoPalabraNormal({
            palabra: contenido,                // Mapear contenido → palabra
            id_sub_tipo: sub_tipo_id,          // Mapear sub_tipo_id → id_sub_tipo
            tiempo_duracion: tiempo_limite     // Mapear tiempo_limite → tiempo_duracion
        });

        res.status(201).json({
            message: 'Reactivo de palabra normal creado exitosamente',
            reactivo: nuevoReactivo
        });

    } catch (error) {
        console.error('Error al crear reactivo de palabra normal:', error);
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
        console.log('=== DEBUGGING ENDPOINT ===');
        console.log('req.body:', req.body);
        console.log('req.files:', req.files);
        console.log('req.file:', req.file);
        console.log('Content-Type:', req.headers['content-type']);
        console.log('Multer detectó archivos:', req.files?.length || 0);
        
        if (req.files && req.files.length > 0) {
            req.files.forEach((file, index) => {
                console.log(`Archivo ${index}:`, {
                    fieldname: file.fieldname,
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size
                });
            });
        }
        console.log('========================');
        
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
        // Buscar el archivo de audio en req.files (puede ser 'audio' o 'voz_usuario')
        const audioFile = req.files ? req.files.find(f => 
            f.fieldname === 'audio' || f.fieldname === 'voz_usuario'
        ) : null;
        
        console.log('Audio file encontrado:', audioFile ? {
            fieldname: audioFile.fieldname,
            originalname: audioFile.originalname,
            size: audioFile.size,
            mimetype: audioFile.mimetype
        } : 'No encontrado');
        
        if (audioFile) {
            const FormData = require('form-data');
            const axios = require('axios');
            const form = new FormData();
            form.append('file', audioFile.buffer, {
                filename: audioFile.originalname || 'audio.wav',
                contentType: audioFile.mimetype || 'audio/wav'
            });
            try {
                console.log('Enviando audio a IA...', {
                    url: 'https://lexyvoz-ai.onrender.com/inferir/',
                    filename: audioFile.originalname,
                    size: audioFile.size,
                    mimetype: audioFile.mimetype
                });
                
                const iaRes = await axios.post('https://lexyvoz-ai.onrender.com/inferir/', form, {
                    headers: form.getHeaders(),
                    maxBodyLength: Infinity,
                    timeout: 30000 // 30 segundos
                });
                
                console.log('Respuesta de IA recibida:', {
                    status: iaRes.status,
                    data: iaRes.data
                });
                
                iaResponse = iaRes.data;
            } catch (err) {
                console.error('Error al enviar audio a la IA:', {
                    message: err.message,
                    code: err.code,
                    response: err.response?.data,
                    status: err.response?.status
                });
                iaResponse = { error: 'Error al procesar el audio con la IA', details: err.message };
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
        if (audioFile) {
            voz_usuario_url = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'video', folder: 'resultados_voz_usuarios' },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    }
                );
                stream.end(audioFile.buffer);
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
            console.log('[Controller] ANTES de llamar guardarResultadoIA');
            resultado = await reactivoModel.guardarResultadoIA({
                usuario_id,
                id_reactivo,
                voz_usuario_url,
                tiempo_respuesta,
                ia: iaToSave
            });
            console.log('[Controller] RESULTADO de guardarResultadoIA:', resultado);
        } catch (err) {
            console.error('[Controller] ERROR en guardarResultadoIA:', {
                message: err.message,
                stack: err.stack
            });
            return res.status(500).json({
                message: 'Error al guardar resultado en la base de datos',
                error: err.message
            });
        }

        // Verificar si se han completado todos los reactivos del ejercicio en este kit
        const kitCompleto = await verificarYMarcarKitCompleto(kit_id, usuario_id, pool);

        console.log('[Controller] ÉXITO COMPLETO - Devolviendo respuesta final');
        return res.status(201).json({
            message: 'Resultado guardado exitosamente',
            resultado,
            ia: iaResponse,
            paciente_id: usuario_id,
            kit_completo: kitCompleto
        });
    } catch (error) {
        console.error('Error al obtener reporte por kit y paciente:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtener resultados de lectura de pseudopalabras
 */
const obtenerResultadosLecturaPseudopalabras = async (req, res) => {
    try {
        const { paciente_id, id_reactivo, kit_id, ejercicio_id, limit = 20, offset = 0 } = req.query;

        // Validar parámetros numéricos si se proporcionan
        if (paciente_id && (isNaN(paciente_id) || parseInt(paciente_id) <= 0)) {
            return res.status(400).json({ message: 'ID de paciente inválido' });
        }
        if (id_reactivo && (isNaN(id_reactivo) || parseInt(id_reactivo) <= 0)) {
            return res.status(400).json({ message: 'ID de reactivo inválido' });
        }
        if (kit_id && (isNaN(kit_id) || parseInt(kit_id) <= 0)) {
            return res.status(400).json({ message: 'ID de kit inválido' });
        }
        if (ejercicio_id && (isNaN(ejercicio_id) || parseInt(ejercicio_id) <= 0)) {
            return res.status(400).json({ message: 'ID de ejercicio inválido' });
        }

        // Construir query dinámico
        let whereConditions = [];
        let queryParams = [];
        let paramCounter = 1;

        if (paciente_id) {
            whereConditions.push(`r.usuario_id = $${paramCounter}`);
            queryParams.push(parseInt(paciente_id));
            paramCounter++;
        }

        if (id_reactivo) {
            whereConditions.push(`r.id_reactivo = $${paramCounter}`);
            queryParams.push(parseInt(id_reactivo));
            paramCounter++;
        }

        if (kit_id) {
            whereConditions.push(`k.kit_id = $${paramCounter}`);
            queryParams.push(parseInt(kit_id));
            paramCounter++;
        }

        if (ejercicio_id) {
            whereConditions.push(`e.ejercicio_id = $${paramCounter}`);
            queryParams.push(parseInt(ejercicio_id));
            paramCounter++;
        }

        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        const query = `
            SELECT 
                r.resultado_reactivo_usuario_id,
                r.usuario_id,
                r.id_reactivo,
                r.voz_usuario_url,
                r.tiempo_respuesta,
                r.es_correcto,
                r.fecha_realizacion,
                r.created_at,
                rp.pseudopalabra,
                u.nombre as usuario_nombre,
                e.ejercicio_id,
                e.titulo as ejercicio_titulo,
                e.descripcion as ejercicio_descripcion,
                k.kit_id,
                k.name as kit_titulo,
                k.descripcion as kit_descripcion,
                k.done as kit_completado
            FROM resultados_lectura_pseudopalabras r
            LEFT JOIN reactivo_lectura_pseudopalabras rp ON r.id_reactivo = rp.id_reactivo
            LEFT JOIN Usuario u ON r.usuario_id = u.usuario_id
            LEFT JOIN ejercicio_reactivos er ON r.id_reactivo = er.reactivo_id
            LEFT JOIN ejercicios e ON er.ejercicio_id = e.ejercicio_id
            LEFT JOIN ejercicios_kits ek ON e.ejercicio_id = ek.ejercicio_id AND ek.activo = true
            LEFT JOIN kits k ON ek.kit_id = k.kit_id
            ${whereClause}
            ORDER BY r.fecha_realizacion DESC
            LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
        `;

        queryParams.push(parseInt(limit), parseInt(offset));

        // Query para contar total
        const countQuery = `
            SELECT COUNT(*) as total
            FROM resultados_lectura_pseudopalabras r
            LEFT JOIN ejercicio_reactivos er ON r.id_reactivo = er.reactivo_id
            LEFT JOIN ejercicios e ON er.ejercicio_id = e.ejercicio_id
            LEFT JOIN ejercicios_kits ek ON e.ejercicio_id = ek.ejercicio_id AND ek.activo = true
            LEFT JOIN kits k ON ek.kit_id = k.kit_id
            ${whereClause}
        `;

        // Query para contar correctos (es_correcto = true)
        const correctosQuery = `
            SELECT COUNT(*) as correctos
            FROM resultados_lectura_pseudopalabras r
            LEFT JOIN ejercicio_reactivos er ON r.id_reactivo = er.reactivo_id
            LEFT JOIN ejercicios e ON er.ejercicio_id = e.ejercicio_id
            LEFT JOIN ejercicios_kits ek ON e.ejercicio_id = ek.ejercicio_id AND ek.activo = true
            LEFT JOIN kits k ON ek.kit_id = k.kit_id
            ${whereClause}${whereClause ? ' AND' : 'WHERE'} r.es_correcto = true
        `;

        const pool = require('../../../db/connection');
        const [resultados, countResult, correctosResult] = await Promise.all([
            pool.query(query, queryParams),
            pool.query(countQuery, queryParams.slice(0, -2)), // Sin limit y offset para count
            pool.query(correctosQuery, queryParams.slice(0, -2)) // Sin limit y offset para correctos
        ]);

        const total = parseInt(countResult.rows[0].total);
        const correctos = parseInt(correctosResult.rows[0].correctos);

        res.status(200).json({
            success: true,
            message: 'Resultados obtenidos exitosamente',
            data: resultados.rows,
            total,
            correctos,
            incorrectos: total - correctos,
            porcentaje_aciertos: total > 0 ? Math.round((correctos / total) * 100) : 0,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: (parseInt(offset) + parseInt(limit)) < total
        });

    } catch (error) {
        console.error('Error al obtener resultados de pseudopalabras:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// =====================================================
// FUNCIONES MEJORADAS PARA RUTAS CON PARÁMETROS
// =====================================================

/**
 * Obtener resultados por paciente específico
 */
const obtenerResultadosPorPaciente = async (req, res) => {
    try {
        const { paciente_id } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        // Validar parámetro
        if (!paciente_id || isNaN(paciente_id) || parseInt(paciente_id) <= 0) {
            return res.status(400).json({ message: 'ID de paciente inválido' });
        }

        // Reutilizar la función existente
        req.query = { paciente_id, limit, offset };
        return await obtenerResultadosLecturaPseudopalabras(req, res);
    } catch (error) {
        console.error('Error al obtener resultados por paciente:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtener resultados por kit específico
 */
const obtenerResultadosPorKit = async (req, res) => {
    try {
        const { kit_id } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        // Validar parámetro
        if (!kit_id || isNaN(kit_id) || parseInt(kit_id) <= 0) {
            return res.status(400).json({ message: 'ID de kit inválido' });
        }

        // Reutilizar la función existente
        req.query = { kit_id, limit, offset };
        return await obtenerResultadosLecturaPseudopalabras(req, res);
    } catch (error) {
        console.error('Error al obtener resultados por kit:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtener resultados por ejercicio específico
 */
const obtenerResultadosPorEjercicio = async (req, res) => {
    try {
        const { ejercicio_id } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        // Validar parámetro
        if (!ejercicio_id || isNaN(ejercicio_id) || parseInt(ejercicio_id) <= 0) {
            return res.status(400).json({ message: 'ID de ejercicio inválido' });
        }

        // Reutilizar la función existente
        req.query = { ejercicio_id, limit, offset };
        return await obtenerResultadosLecturaPseudopalabras(req, res);
    } catch (error) {
        console.error('Error al obtener resultados por ejercicio:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtener resultados por paciente y kit específicos
 */
const obtenerResultadosPacienteKit = async (req, res) => {
    try {
        const { paciente_id, kit_id } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        // Validar parámetros
        if (!paciente_id || isNaN(paciente_id) || parseInt(paciente_id) <= 0) {
            return res.status(400).json({ message: 'ID de paciente inválido' });
        }
        if (!kit_id || isNaN(kit_id) || parseInt(kit_id) <= 0) {
            return res.status(400).json({ message: 'ID de kit inválido' });
        }

        // Reutilizar la función existente
        req.query = { paciente_id, kit_id, limit, offset };
        return await obtenerResultadosLecturaPseudopalabras(req, res);
    } catch (error) {
        console.error('Error al obtener resultados por paciente y kit:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    crearReactivo,
    crearReactivoPalabraNormal,
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
    obtenerResultadosLecturaPseudopalabras,
    obtenerResultadosPorPaciente,
    obtenerResultadosPorKit,
    obtenerResultadosPorEjercicio,
    obtenerResultadosPacienteKit,
    upload
};
