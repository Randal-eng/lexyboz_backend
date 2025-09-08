const ejercicioModel = require('../models/Ejercicio');
const reactivoModel = require('../../reactivos/models/Reactivo');
const TipoModel = require('../../tipos/models/Tipo');

// =====================================================
// CONTROLADORES DE EJERCICIOS
// =====================================================

/**
 * Crear un nuevo ejercicio
 */
const crearEjercicio = async (req, res) => {
    try {
        const { titulo, descripcion, tipo_ejercicio, creado_por } = req.body;
        
        // Usar creado_por del JSON si está presente, sino del token JWT
        const creadorId = creado_por || req.user?.usuario_id;

        if (!titulo) {
            return res.status(400).json({ 
                message: 'El título del ejercicio es requerido.' 
            });
        }

        if (!creadorId) {
            return res.status(400).json({ 
                message: 'El campo creado_por es requerido.' 
            });
        }

        const nuevoEjercicio = await ejercicioModel.crearEjercicio({
            titulo,
            descripcion,
            creado_por: creadorId,
            tipo_ejercicio: tipo_ejercicio || null
        });

        res.status(201).json({
            message: 'Ejercicio creado exitosamente',
            ejercicio: nuevoEjercicio
        });

    } catch (error) {
        console.error('Error al crear ejercicio:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Obtener todos los ejercicios con paginación y filtros
 */
const obtenerEjercicios = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            activo,
            creado_por,
            tipo_ejercicio,
            buscar
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        const filtros = {
            limit: parseInt(limit),
            offset,
            activo: activo !== undefined ? activo === 'true' : null,
            creado_por: creado_por ? parseInt(creado_por) : null,
            tipo_ejercicio: tipo_ejercicio ? parseInt(tipo_ejercicio) : null,
            buscar
        };

        const resultado = await ejercicioModel.obtenerEjercicios(filtros);

        res.json({
            message: 'Ejercicios obtenidos exitosamente',
            data: resultado.ejercicios,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(resultado.total / parseInt(limit)),
                total_items: resultado.total,
                items_per_page: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener ejercicios:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Obtener un ejercicio por ID con toda su información
 */
const obtenerEjercicioPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ 
                message: 'ID de ejercicio inválido' 
            });
        }

        const ejercicio = await ejercicioModel.obtenerEjercicioPorId(parseInt(id));

        if (!ejercicio) {
            return res.status(404).json({ 
                message: 'Ejercicio no encontrado' 
            });
        }

        res.json({
            message: 'Ejercicio obtenido exitosamente',
            ejercicio
        });

    } catch (error) {
        console.error('Error al obtener ejercicio:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Actualizar un ejercicio
 */
const actualizarEjercicio = async (req, res) => {
    try {
        const { id } = req.params;
        const datosActualizacion = req.body;
        const usuarioId = req.user.usuario_id;

        if (!id || isNaN(id)) {
            return res.status(400).json({ 
                message: 'ID de ejercicio inválido' 
            });
        }

        // Verificar que el ejercicio existe y el usuario tiene permisos
        const ejercicioExistente = await ejercicioModel.obtenerEjercicioPorId(parseInt(id));
        if (!ejercicioExistente) {
            return res.status(404).json({ 
                message: 'Ejercicio no encontrado' 
            });
        }

        // Verificar permisos (solo el creador o admin puede editar)
        if (ejercicioExistente.creado_por !== usuarioId && req.user.tipo !== 'Admin') {
            return res.status(403).json({ 
                message: 'No tienes permisos para editar este ejercicio' 
            });
        }

        const ejercicioActualizado = await ejercicioModel.actualizarEjercicio(parseInt(id), datosActualizacion);

        res.json({
            message: 'Ejercicio actualizado exitosamente',
            ejercicio: ejercicioActualizado
        });

    } catch (error) {
        console.error('Error al actualizar ejercicio:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Eliminar un ejercicio (soft delete)
 */
const eliminarEjercicio = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.user.usuario_id;

        if (!id || isNaN(id)) {
            return res.status(400).json({ 
                message: 'ID de ejercicio inválido' 
            });
        }

        // Verificar que el ejercicio existe y el usuario tiene permisos
        const ejercicioExistente = await ejercicioModel.obtenerEjercicioPorId(parseInt(id));
        if (!ejercicioExistente) {
            return res.status(404).json({ 
                message: 'Ejercicio no encontrado' 
            });
        }

        // Verificar permisos (solo el creador o admin puede eliminar)
        if (ejercicioExistente.creado_por !== usuarioId && req.user.tipo !== 'Admin') {
            return res.status(403).json({ 
                message: 'No tienes permisos para eliminar este ejercicio' 
            });
        }

        const ejercicioEliminado = await ejercicioModel.eliminarEjercicio(parseInt(id));

        res.json({
            message: 'Ejercicio eliminado exitosamente',
            ejercicio: ejercicioEliminado
        });

    } catch (error) {
        console.error('Error al eliminar ejercicio:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Obtener ejercicios por tipo
 */
const obtenerEjerciciosPorTipo = async (req, res) => {
    try {
        const { tipo_id } = req.params;
        const {
            page = 1,
            limit = 20,
            activo = true
        } = req.query;

        console.log('--- [LOG] Parámetros recibidos ---');
        console.log('tipo_id:', tipo_id);
        console.log('page:', page, 'limit:', limit, 'activo:', activo);

        if (!tipo_id || isNaN(tipo_id)) {
            return res.status(400).json({ 
                message: 'ID de tipo inválido' 
            });
        }

        // Validar existencia del tipo antes de consultar ejercicios
        const tipoExiste = await TipoModel.existeTipoPorId(parseInt(tipo_id));
        if (!tipoExiste) {
            return res.status(404).json({
                message: `El tipo con id ${tipo_id} no existe.`
            });
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        // Permitir activo=true, activo='true', activo=1, activo='1' como verdadero
        let activoParsed = null;
        if (activo !== undefined) {
            if (activo === true || activo === 'true' || activo === 1 || activo === '1') {
                activoParsed = true;
            } else if (activo === false || activo === 'false' || activo === 0 || activo === '0') {
                activoParsed = false;
            }
        }
        const filtros = {
            limit: parseInt(limit),
            offset,
            activo: activoParsed
        };

        console.log('--- [LOG] Filtros usados ---');
        console.log(filtros);

        const resultado = await ejercicioModel.obtenerEjerciciosPorTipo(parseInt(tipo_id), filtros);

        console.log('--- [LOG] Resultado de la consulta ---');
        console.log('Total:', resultado.total);
        console.log('Ejercicios:', resultado.ejercicios);

        res.json({
            message: 'Ejercicios por tipo obtenidos exitosamente',
            data: resultado.ejercicios,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(resultado.total / parseInt(limit)),
                total_items: resultado.total,
                items_per_page: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener ejercicios por tipo:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Obtener ejercicios disponibles para un kit (que no están en el kit)
 */
const obtenerEjerciciosDisponibles = async (req, res) => {
    try {
        const { kit_id } = req.params;
        const {
            page = 1,
            limit = 20,
            buscar
        } = req.query;

        if (!kit_id || isNaN(kit_id)) {
            return res.status(400).json({ 
                message: 'ID de kit inválido' 
            });
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        const filtros = {
            limit: parseInt(limit),
            offset,
            buscar
        };

        const resultado = await ejercicioModel.obtenerEjerciciosDisponibles(parseInt(kit_id), filtros);

        res.json({
            message: 'Ejercicios disponibles obtenidos exitosamente',
            data: resultado.ejercicios,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(resultado.total / parseInt(limit)),
                total_items: resultado.total,
                items_per_page: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener ejercicios disponibles:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Obtener estadísticas de ejercicios
 */
const obtenerEstadisticasEjercicios = async (req, res) => {
    try {
        const estadisticas = await ejercicioModel.obtenerEstadisticasEjercicios();

        res.json({
            message: 'Estadísticas obtenidas exitosamente',
            estadisticas
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Duplicar un ejercicio
 */
const duplicarEjercicio = async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevo_titulo } = req.body;
        const usuarioId = req.user.usuario_id;

        if (!id || isNaN(id)) {
            return res.status(400).json({ 
                message: 'ID de ejercicio inválido' 
            });
        }

        if (!nuevo_titulo) {
            return res.status(400).json({ 
                message: 'El nuevo título es requerido' 
            });
        }

        // Verificar que el ejercicio existe
        const ejercicioExistente = await ejercicioModel.obtenerEjercicioPorId(parseInt(id));
        if (!ejercicioExistente) {
            return res.status(404).json({ 
                message: 'Ejercicio no encontrado' 
            });
        }

        const ejercicioDuplicado = await ejercicioModel.duplicarEjercicio(
            parseInt(id), 
            nuevo_titulo, 
            usuarioId
        );

        res.status(201).json({
            message: 'Ejercicio duplicado exitosamente',
            ejercicio: ejercicioDuplicado
        });

    } catch (error) {
        console.error('Error al duplicar ejercicio:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Obtener ejercicios creados por el usuario actual
 */
const obtenerMisEjercicios = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            activo,
            buscar
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const usuarioId = req.user.usuario_id;
        
        const filtros = {
            limit: parseInt(limit),
            offset,
            activo: activo !== undefined ? activo === 'true' : null,
            creado_por: usuarioId,
            buscar
        };

        const resultado = await ejercicioModel.obtenerEjercicios(filtros);

        res.json({
            message: 'Mis ejercicios obtenidos exitosamente',
            data: resultado.ejercicios,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(resultado.total / parseInt(limit)),
                total_items: resultado.total,
                items_per_page: parseInt(limit)
            }
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

// =====================================================
// CONTROLADORES PARA GESTIÓN DE REACTIVOS EN EJERCICIOS
// =====================================================

/**
 * Agregar reactivos a un ejercicio
 */
const agregarReactivosAEjercicio = async (req, res) => {
    try {
        const { ejercicioId } = req.params;
        const { reactivos } = req.body;
        const usuario_id = req.user.usuario_id;

        // Validar que el usuario es el creador del ejercicio
        const ejercicio = await ejercicioModel.obtenerEjercicioPorId(ejercicioId);
        if (!ejercicio) {
            return res.status(404).json({ 
                message: 'Ejercicio no encontrado' 
            });
        }

        if (ejercicio.creado_por !== usuario_id) {
            return res.status(403).json({ 
                message: 'No tienes permiso para modificar este ejercicio' 
            });
        }

        // Validar formato de reactivos
        if (!reactivos || !Array.isArray(reactivos) || reactivos.length === 0) {
            return res.status(400).json({
                message: 'Debe proporcionar al menos un reactivo',
                format: 'reactivos: [{ id_reactivo: number, orden: number }]'
            });
        }

        const resultado = await reactivoModel.agregarReactivosAEjercicio(ejercicioId, reactivos);

        res.status(200).json({
            message: 'Reactivos agregados exitosamente al ejercicio',
            resultado
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
        const { ejercicioId } = req.params;

        // Verificar que el ejercicio existe
        const ejercicio = await ejercicioModel.obtenerEjercicioPorId(ejercicioId);
        if (!ejercicio) {
            return res.status(404).json({ 
                message: 'Ejercicio no encontrado' 
            });
        }

        const reactivos = await reactivoModel.obtenerReactivosDeEjercicio(ejercicioId);

        res.status(200).json({
            message: 'Reactivos obtenidos exitosamente',
            ejercicio: {
                ejercicio_id: ejercicio.ejercicio_id,
                titulo: ejercicio.titulo,
                descripcion: ejercicio.descripcion
            },
            reactivos,
            total_reactivos: reactivos.length
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
        const { ejercicioId, reactivoId } = req.params;
        const usuario_id = req.user.usuario_id;

        // Verificar que el usuario es el creador del ejercicio
        const ejercicio = await ejercicioModel.obtenerEjercicioPorId(ejercicioId);
        if (!ejercicio) {
            return res.status(404).json({ 
                message: 'Ejercicio no encontrado' 
            });
        }

        if (ejercicio.creado_por !== usuario_id) {
            return res.status(403).json({ 
                message: 'No tienes permiso para modificar este ejercicio' 
            });
        }

        const resultado = await reactivoModel.removerReactivoDeEjercicio(ejercicioId, reactivoId);

        res.status(200).json({
            message: 'Reactivo removido exitosamente del ejercicio',
            resultado
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
        const { ejercicioId } = req.params;
        const { nuevosOrdenes } = req.body;
        const usuario_id = req.user.usuario_id;

        // Verificar que el usuario es el creador del ejercicio
        const ejercicio = await ejercicioModel.obtenerEjercicioPorId(ejercicioId);
        if (!ejercicio) {
            return res.status(404).json({ 
                message: 'Ejercicio no encontrado' 
            });
        }

        if (ejercicio.creado_por !== usuario_id) {
            return res.status(403).json({ 
                message: 'No tienes permiso para modificar este ejercicio' 
            });
        }

        // Validar formato de nuevos órdenes
        if (!nuevosOrdenes || !Array.isArray(nuevosOrdenes) || nuevosOrdenes.length === 0) {
            return res.status(400).json({
                message: 'Debe proporcionar el nuevo orden de los reactivos',
                format: 'nuevosOrdenes: [{ reactivo_id: number, orden: number }]'
            });
        }

        const resultado = await reactivoModel.reordenarReactivosEnEjercicio(ejercicioId, nuevosOrdenes);

        res.status(200).json({
            message: 'Reactivos reordenados exitosamente',
            resultado
        });

    } catch (error) {
        console.error('Error al reordenar reactivos:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Crear ejercicio con reactivos (función completa)
 */
const crearEjercicioConReactivos = async (req, res) => {
    try {
        const { titulo, descripcion, tipo_ejercicio, reactivos, creado_por } = req.body;
        
        // Usar creado_por del JSON si está presente, sino del token JWT
        const creadorId = creado_por || req.user?.usuario_id;

        if (!titulo) {
            return res.status(400).json({ 
                message: 'El título del ejercicio es requerido.' 
            });
        }

        if (!creadorId) {
            return res.status(400).json({ 
                message: 'El campo creado_por es requerido.' 
            });
        }

        // Crear el ejercicio primero
        const nuevoEjercicio = await ejercicioModel.crearEjercicio({
            titulo,
            descripcion,
            creado_por: creadorId,
            tipo_ejercicio: tipo_ejercicio || null
        });

        let resultado = {
            ejercicio: nuevoEjercicio,
            reactivos_agregados: []
        };

        // Si se proporcionaron reactivos, agregarlos
        if (reactivos && Array.isArray(reactivos) && reactivos.length > 0) {
            try {
                const reactivosResult = await reactivoModel.agregarReactivosAEjercicio(
                    nuevoEjercicio.ejercicio_id, 
                    reactivos
                );
                resultado.reactivos_agregados = reactivosResult.reactivos_agregados;
                resultado.tipo_reactivos = reactivosResult.tipo;
            } catch (reactivosError) {
                // Si hay error con reactivos, el ejercicio ya fue creado
                console.warn('Error al agregar reactivos, pero ejercicio fue creado:', reactivosError.message);
                resultado.warning = `Ejercicio creado pero error al agregar reactivos: ${reactivosError.message}`;
            }
        }

        res.status(201).json({
            message: 'Ejercicio creado exitosamente',
            ...resultado
        });

    } catch (error) {
        console.error('Error al crear ejercicio con reactivos:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Verificar compatibilidad de reactivos con ejercicio
 */
const verificarCompatibilidadReactivos = async (req, res) => {
    try {
        const { ejercicioId } = req.params;
        const { tipoId } = req.query;

        if (!tipoId) {
            return res.status(400).json({
                message: 'El parámetro tipoId es requerido'
            });
        }

        const compatibilidad = await reactivoModel.verificarCompatibilidadTipo(ejercicioId, parseInt(tipoId));

        res.status(200).json({
            message: 'Verificación de compatibilidad completada',
            compatibilidad
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
 * Obtener kits que contienen un ejercicio específico
 */
const obtenerKitsDeEjercicio = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            page = 1,
            limit = 20,
            activo = true
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const query = `
            SELECT 
                ek.kit_id,
                ek.orden_en_kit,
                ek.activo as activo_en_kit,
                ek.fecha_creacion as fecha_agregado,
                k.name as kit_name,
                k.descripcion as kit_descripcion,
                k.creado_por,
                k.fecha_creacion as kit_fecha_creacion,
                k.activo as kit_activo,
                u.nombre as creador_nombre,
                u.correo as creador_correo
            FROM ejercicios_kits ek
            INNER JOIN kits k ON ek.kit_id = k.kit_id
            INNER JOIN Usuario u ON k.creado_por = u.usuario_id
            WHERE ek.ejercicio_id = $1 ${activo === 'true' ? 'AND ek.activo = true AND k.activo = true' : ''}
            ORDER BY ek.orden_en_kit ASC, ek.fecha_creacion ASC
            LIMIT $2 OFFSET $3
        `;

        const countQuery = `
            SELECT COUNT(*) as total
            FROM ejercicios_kits ek
            INNER JOIN kits k ON ek.kit_id = k.kit_id
            WHERE ek.ejercicio_id = $1 ${activo === 'true' ? 'AND ek.activo = true AND k.activo = true' : ''}
        `;

        const [kitsResult, countResult] = await Promise.all([
            ejercicioModel.executeQuery(query, [parseInt(id), parseInt(limit), offset]),
            ejercicioModel.executeQuery(countQuery, [parseInt(id)])
        ]);

        const total = parseInt(countResult.rows[0].total);

        res.json({
            message: 'Kits del ejercicio obtenidos exitosamente',
            kits: kitsResult.rows,
            total,
            limit: parseInt(limit),
            offset,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });

    } catch (error) {
        console.error('Error al obtener kits del ejercicio:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

module.exports = {
    crearEjercicio,
    obtenerEjercicios,
    obtenerEjercicioPorId,
    actualizarEjercicio,
    eliminarEjercicio,
    obtenerEjerciciosPorTipo,
    obtenerEjerciciosDisponibles,
    obtenerEstadisticasEjercicios,
    duplicarEjercicio,
    obtenerMisEjercicios,
    // Nuevas funciones para gestión de reactivos
    agregarReactivosAEjercicio,
    obtenerReactivosDeEjercicio,
    removerReactivoDeEjercicio,
    reordenarReactivosEnEjercicio,
    crearEjercicioConReactivos,
    verificarCompatibilidadReactivos,
    // Nueva función para gestión de kits
    obtenerKitsDeEjercicio
};
