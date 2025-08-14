const ejercicioModel = require('../models/Ejercicio');

// =====================================================
// CONTROLADORES DE EJERCICIOS
// =====================================================

/**
 * Crear un nuevo ejercicio
 */
const crearEjercicio = async (req, res) => {
    try {
        const { titulo, descripcion, id_reactivo, tipo_ejercicio } = req.body;
        const creado_por = req.user.usuario_id; // Obtener del middleware de autenticación

        if (!titulo) {
            return res.status(400).json({ 
                message: 'El título del ejercicio es requerido.' 
            });
        }

        const nuevoEjercicio = await ejercicioModel.crearEjercicio({
            titulo,
            descripcion,
            creado_por,
            id_reactivo: id_reactivo || null,
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

        const resultado = await ejercicioModel.obtenerEjerciciosPorTipo(parseInt(tipo_id), filtros);

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
        console.error('Error al obtener mis ejercicios:', error);
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
    obtenerMisEjercicios
};
