const Tipo = require('../models/Tipo');

class TipoController {
    // Obtener todos los tipos
    static async listado(req, res) {
        try {
            const includeSubtipos = req.query.include_subtipos === 'true';
            const tipos = await Tipo.obtenerTodos(includeSubtipos);
            
            res.status(200).json({
                success: true,
                message: 'Tipos obtenidos exitosamente',
                count: tipos.length,
                data: tipos
            });
        } catch (error) {
            console.error('Error en listado de tipos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener tipo por ID
    static async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const includeSubtipos = req.query.include_subtipos === 'true';

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de tipo inválido'
                });
            }

            const tipo = await Tipo.obtenerPorId(parseInt(id), includeSubtipos);

            if (!tipo) {
                return res.status(404).json({
                    success: false,
                    message: 'Tipo no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Tipo obtenido exitosamente',
                data: tipo
            });
        } catch (error) {
            console.error('Error al obtener tipo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Crear nuevo tipo
    static async crear(req, res) {
        try {
            const { tipo_nombre } = req.body;

            if (!tipo_nombre || tipo_nombre.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre del tipo es requerido'
                });
            }

            // Verificar si ya existe
            const existe = await Tipo.existePorNombre(tipo_nombre.trim());
            if (existe) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe un tipo con ese nombre'
                });
            }

            const nuevoTipo = await Tipo.crear(tipo_nombre.trim());

            res.status(201).json({
                success: true,
                message: 'Tipo creado exitosamente',
                data: nuevoTipo
            });
        } catch (error) {
            console.error('Error al crear tipo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Actualizar tipo
    static async actualizar(req, res) {
        try {
            const { id } = req.params;
            const { tipo_nombre } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de tipo inválido'
                });
            }

            if (!tipo_nombre || tipo_nombre.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre del tipo es requerido'
                });
            }

            // Verificar si existe otro tipo con el mismo nombre
            const existe = await Tipo.existePorNombre(tipo_nombre.trim(), parseInt(id));
            if (existe) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe otro tipo con ese nombre'
                });
            }

            const tipoActualizado = await Tipo.actualizar(parseInt(id), tipo_nombre.trim());

            if (!tipoActualizado) {
                return res.status(404).json({
                    success: false,
                    message: 'Tipo no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Tipo actualizado exitosamente',
                data: tipoActualizado
            });
        } catch (error) {
            console.error('Error al actualizar tipo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Eliminar tipo
    static async eliminar(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de tipo inválido'
                });
            }

            const tipoEliminado = await Tipo.eliminar(parseInt(id));

            if (!tipoEliminado) {
                return res.status(404).json({
                    success: false,
                    message: 'Tipo no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Tipo eliminado exitosamente',
                data: tipoEliminado
            });
        } catch (error) {
            console.error('Error al eliminar tipo:', error);
            
            // Verificar si es error de clave foránea
            if (error.code === '23503') {
                return res.status(409).json({
                    success: false,
                    message: 'No se puede eliminar el tipo porque tiene sub-tipos asociados'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Buscar tipos
    static async buscar(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Término de búsqueda requerido'
                });
            }

            const tipos = await Tipo.buscarPorNombre(q.trim());

            res.status(200).json({
                success: true,
                message: 'Búsqueda completada exitosamente',
                count: tipos.length,
                data: tipos
            });
        } catch (error) {
            console.error('Error en búsqueda de tipos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener estadísticas
    static async estadisticas(req, res) {
        try {
            const stats = await Tipo.obtenerEstadisticas();

            res.status(200).json({
                success: true,
                message: 'Estadísticas obtenidas exitosamente',
                data: stats
            });
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = TipoController;
