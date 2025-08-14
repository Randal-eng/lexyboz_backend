const kitModel = require('../models/Kit');

// =====================================================
// CONTROLADORES DE KITS
// =====================================================

/**
 * Crear un nuevo kit
 */
const crearKit = async (req, res) => {
    try {
        const { name, descripcion } = req.body;
        const creado_por = req.user.usuario_id; // Obtener del middleware de autenticación

        if (!name) {
            return res.status(400).json({ 
                message: 'El nombre del kit es requerido.' 
            });
        }

        const nuevoKit = await kitModel.crearKit({
            name,
            descripcion,
            creado_por
        });

        res.status(201).json({
            message: 'Kit creado exitosamente',
            kit: nuevoKit
        });

    } catch (error) {
        console.error('Error al crear kit:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Crear un nuevo kit con ejercicios
 */
const crearKitConEjercicios = async (req, res) => {
    try {
        const { name, descripcion, ejercicios = [] } = req.body;
        
        // Usar creado_por del JSON si está presente, sino del token JWT
        const creado_por = req.body.creado_por || req.user?.usuario_id;

        if (!name) {
            return res.status(400).json({ 
                message: 'El nombre del kit es requerido.' 
            });
        }

        if (!creado_por) {
            return res.status(400).json({ 
                message: 'El campo creado_por es requerido.' 
            });
        }

        const resultado = await kitModel.crearKitConEjercicios({
            name,
            descripcion,
            creado_por,
            ejercicios
        });

        res.status(201).json({
            message: 'Kit creado exitosamente con ejercicios',
            ...resultado
        });

    } catch (error) {
        console.error('Error al crear kit con ejercicios:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Obtener todos los kits con paginación y filtros
 */
const obtenerKits = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            activo,
            creado_por,
            buscar
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        const filtros = {
            limit: parseInt(limit),
            offset,
            activo: activo !== undefined ? activo === 'true' : null,
            creado_por: creado_por ? parseInt(creado_por) : null,
            buscar
        };

        const resultado = await kitModel.obtenerKits(filtros);

        res.json({
            message: 'Kits obtenidos exitosamente',
            data: resultado.kits,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(resultado.total / parseInt(limit)),
                total_items: resultado.total,
                items_per_page: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener kits:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Obtener un kit por ID con sus ejercicios
 */
const obtenerKitPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ 
                message: 'ID de kit inválido' 
            });
        }

        const kit = await kitModel.obtenerKitPorId(parseInt(id));

        if (!kit) {
            return res.status(404).json({ 
                message: 'Kit no encontrado' 
            });
        }

        res.json({
            message: 'Kit obtenido exitosamente',
            kit
        });

    } catch (error) {
        console.error('Error al obtener kit:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Actualizar un kit
 */
const actualizarKit = async (req, res) => {
    try {
        const { id } = req.params;
        const datosActualizacion = req.body;
        const usuarioId = req.user.usuario_id;

        if (!id || isNaN(id)) {
            return res.status(400).json({ 
                message: 'ID de kit inválido' 
            });
        }

        // Verificar que el kit existe y el usuario tiene permisos
        const kitExistente = await kitModel.obtenerKitPorId(parseInt(id));
        if (!kitExistente) {
            return res.status(404).json({ 
                message: 'Kit no encontrado' 
            });
        }

        // Verificar permisos (solo el creador o admin puede editar)
        if (kitExistente.creado_por !== usuarioId && req.user.tipo !== 'Admin') {
            return res.status(403).json({ 
                message: 'No tienes permisos para editar este kit' 
            });
        }

        const kitActualizado = await kitModel.actualizarKit(parseInt(id), datosActualizacion);

        res.json({
            message: 'Kit actualizado exitosamente',
            kit: kitActualizado
        });

    } catch (error) {
        console.error('Error al actualizar kit:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Eliminar un kit (soft delete)
 */
const eliminarKit = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.user.usuario_id;

        if (!id || isNaN(id)) {
            return res.status(400).json({ 
                message: 'ID de kit inválido' 
            });
        }

        // Verificar que el kit existe y el usuario tiene permisos
        const kitExistente = await kitModel.obtenerKitPorId(parseInt(id));
        if (!kitExistente) {
            return res.status(404).json({ 
                message: 'Kit no encontrado' 
            });
        }

        // Verificar permisos (solo el creador o admin puede eliminar)
        if (kitExistente.creado_por !== usuarioId && req.user.tipo !== 'Admin') {
            return res.status(403).json({ 
                message: 'No tienes permisos para eliminar este kit' 
            });
        }

        const kitEliminado = await kitModel.eliminarKit(parseInt(id));

        res.json({
            message: 'Kit eliminado exitosamente',
            kit: kitEliminado
        });

    } catch (error) {
        console.error('Error al eliminar kit:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Agregar ejercicio a un kit
 */
const agregarEjercicioAKit = async (req, res) => {
    try {
        const { id } = req.params;
        const { ejercicio_id, orden_en_kit } = req.body;
        const usuarioId = req.user.usuario_id;

        if (!id || isNaN(id)) {
            return res.status(400).json({ 
                message: 'ID de kit inválido' 
            });
        }

        if (!ejercicio_id) {
            return res.status(400).json({ 
                message: 'ID de ejercicio es requerido' 
            });
        }

        // Verificar permisos del kit
        const kitExistente = await kitModel.obtenerKitPorId(parseInt(id));
        if (!kitExistente) {
            return res.status(404).json({ 
                message: 'Kit no encontrado' 
            });
        }

        if (kitExistente.creado_por !== usuarioId && req.user.tipo !== 'Admin') {
            return res.status(403).json({ 
                message: 'No tienes permisos para modificar este kit' 
            });
        }

        const relacion = await kitModel.agregarEjercicioAKit(
            parseInt(id), 
            parseInt(ejercicio_id), 
            orden_en_kit ? parseInt(orden_en_kit) : null
        );

        res.status(201).json({
            message: 'Ejercicio agregado al kit exitosamente',
            relacion
        });

    } catch (error) {
        console.error('Error al agregar ejercicio al kit:', error);
        
        if (error.message.includes('duplicate key')) {
            return res.status(400).json({ 
                message: 'Este ejercicio ya está en el kit' 
            });
        }

        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Remover ejercicio de un kit
 */
const removerEjercicioDeKit = async (req, res) => {
    try {
        const { id, ejercicio_id } = req.params;
        const usuarioId = req.user.usuario_id;

        if (!id || isNaN(id) || !ejercicio_id || isNaN(ejercicio_id)) {
            return res.status(400).json({ 
                message: 'IDs inválidos' 
            });
        }

        // Verificar permisos del kit
        const kitExistente = await kitModel.obtenerKitPorId(parseInt(id));
        if (!kitExistente) {
            return res.status(404).json({ 
                message: 'Kit no encontrado' 
            });
        }

        if (kitExistente.creado_por !== usuarioId && req.user.tipo !== 'Admin') {
            return res.status(403).json({ 
                message: 'No tienes permisos para modificar este kit' 
            });
        }

        const relacionEliminada = await kitModel.removerEjercicioDeKit(
            parseInt(id), 
            parseInt(ejercicio_id)
        );

        if (!relacionEliminada) {
            return res.status(404).json({ 
                message: 'Ejercicio no encontrado en este kit' 
            });
        }

        res.json({
            message: 'Ejercicio removido del kit exitosamente'
        });

    } catch (error) {
        console.error('Error al remover ejercicio del kit:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Reordenar ejercicios en un kit
 */
const reordenarEjerciciosEnKit = async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevos_ordenes } = req.body;
        const usuarioId = req.user.usuario_id;

        if (!id || isNaN(id)) {
            return res.status(400).json({ 
                message: 'ID de kit inválido' 
            });
        }

        if (!nuevos_ordenes || !Array.isArray(nuevos_ordenes)) {
            return res.status(400).json({ 
                message: 'nuevos_ordenes debe ser un array' 
            });
        }

        // Verificar permisos del kit
        const kitExistente = await kitModel.obtenerKitPorId(parseInt(id));
        if (!kitExistente) {
            return res.status(404).json({ 
                message: 'Kit no encontrado' 
            });
        }

        if (kitExistente.creado_por !== usuarioId && req.user.tipo !== 'Admin') {
            return res.status(403).json({ 
                message: 'No tienes permisos para modificar este kit' 
            });
        }

        const resultado = await kitModel.reordenarEjerciciosEnKit(parseInt(id), nuevos_ordenes);

        res.json({
            message: 'Ejercicios reordenados exitosamente',
            resultado
        });

    } catch (error) {
        console.error('Error al reordenar ejercicios:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Agregar múltiples ejercicios a un kit
 */
const agregarEjerciciosAKit = async (req, res) => {
    try {
        const { id } = req.params;
        const { ejercicios } = req.body;

        if (!ejercicios || !Array.isArray(ejercicios) || ejercicios.length === 0) {
            return res.status(400).json({ 
                message: 'Debe proporcionar un array de ejercicios con ejercicio_id y orden.' 
            });
        }

        const resultado = await kitModel.agregarEjerciciosAKit(parseInt(id), ejercicios);

        res.status(201).json({
            message: 'Ejercicios agregados al kit exitosamente',
            resultado
        });

    } catch (error) {
        console.error('Error al agregar ejercicios al kit:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Obtener ejercicios de un kit
 */
const obtenerEjerciciosDeKit = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            page = 1,
            limit = 20,
            activo = true
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        const filtros = {
            limit: parseInt(limit),
            offset,
            activo: activo === 'true' || activo === true
        };

        const resultado = await kitModel.obtenerEjerciciosDeKit(parseInt(id), filtros);

        res.json({
            message: 'Ejercicios del kit obtenidos exitosamente',
            ...resultado,
            page: parseInt(page),
            totalPages: Math.ceil(resultado.total / parseInt(limit))
        });

    } catch (error) {
        console.error('Error al obtener ejercicios del kit:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

/**
 * Remover múltiples ejercicios de un kit
 */
const removerEjerciciosDeKit = async (req, res) => {
    try {
        const { id } = req.params;
        const { ejercicios_ids } = req.body;

        if (!ejercicios_ids || !Array.isArray(ejercicios_ids) || ejercicios_ids.length === 0) {
            return res.status(400).json({ 
                message: 'Debe proporcionar un array de ejercicios_ids.' 
            });
        }

        const resultado = await kitModel.removerEjerciciosDeKit(parseInt(id), ejercicios_ids);

        res.json({
            message: 'Ejercicios removidos del kit exitosamente',
            resultado
        });

    } catch (error) {
        console.error('Error al remover ejercicios del kit:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

module.exports = {
    crearKit,
    crearKitConEjercicios,
    obtenerKits,
    obtenerKitPorId,
    actualizarKit,
    eliminarKit,
    agregarEjercicioAKit,
    removerEjercicioDeKit,
    reordenarEjerciciosEnKit,
    agregarEjerciciosAKit,
    obtenerEjerciciosDeKit,
    removerEjerciciosDeKit
};
