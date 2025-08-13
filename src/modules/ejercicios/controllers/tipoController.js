const Tipo = require('../models/Tipo');

/**
 * Controlador para gestionar Tipos de ejercicios
 */
class TipoController {
    /**
     * Crear un nuevo tipo
     */
    static async createTipo(req, res) {
        try {
            const tipo = await Tipo.createTipo(req.body);
            res.status(201).json({
                success: true,
                message: 'Tipo creado exitosamente',
                data: tipo
            });
        } catch (error) {
            console.error('Error al crear tipo:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Obtener todos los tipos
     */
    static async getAllTipos(req, res) {
        try {
            const { include_subtipos } = req.query;
            
            let tipos;
            if (include_subtipos === 'true') {
                tipos = await Tipo.getAllTiposWithSubTipos();
            } else {
                tipos = await Tipo.getAllTipos();
            }

            res.status(200).json({
                success: true,
                message: 'Tipos obtenidos exitosamente',
                data: tipos,
                count: tipos.length
            });
        } catch (error) {
            console.error('Error al obtener tipos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtener tipo por ID
     */
    static async getTipoById(req, res) {
        try {
            const { id } = req.params;
            const { include_subtipos } = req.query;

            let tipo;
            if (include_subtipos === 'true') {
                tipo = await Tipo.getTipoWithSubTipos(parseInt(id));
            } else {
                tipo = await Tipo.getTipoById(parseInt(id));
            }

            res.status(200).json({
                success: true,
                message: 'Tipo obtenido exitosamente',
                data: tipo
            });
        } catch (error) {
            console.error('Error al obtener tipo:', error);
            if (error.message === 'Tipo no encontrado') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor'
                });
            }
        }
    }

    /**
     * Actualizar tipo
     */
    static async updateTipo(req, res) {
        try {
            const { id } = req.params;
            const tipo = await Tipo.updateTipo(parseInt(id), req.body);
            
            res.status(200).json({
                success: true,
                message: 'Tipo actualizado exitosamente',
                data: tipo
            });
        } catch (error) {
            console.error('Error al actualizar tipo:', error);
            if (error.message === 'Tipo no encontrado') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else if (error.message.includes('validación') || error.message.includes('existe')) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor'
                });
            }
        }
    }

    /**
     * Eliminar tipo
     */
    static async deleteTipo(req, res) {
        try {
            const { id } = req.params;
            await Tipo.deleteTipo(parseInt(id));
            
            res.status(200).json({
                success: true,
                message: 'Tipo eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar tipo:', error);
            if (error.message === 'Tipo no encontrado') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else if (error.message.includes('sub-tipos') || error.message.includes('ejercicios')) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor'
                });
            }
        }
    }

    /**
     * Buscar tipos por nombre
     */
    static async searchTipos(req, res) {
        try {
            const { q } = req.query;
            
            if (!q || q.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere un término de búsqueda'
                });
            }

            const tipos = await Tipo.searchTipos(q.trim());
            
            res.status(200).json({
                success: true,
                message: 'Búsqueda completada exitosamente',
                data: tipos,
                count: tipos.length,
                search_term: q.trim()
            });
        } catch (error) {
            console.error('Error al buscar tipos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtener estadísticas de tipos
     */
    static async getTiposStats(req, res) {
        try {
            // Obtener todos los tipos con sus sub-tipos para estadísticas
            const tiposWithSubTipos = await Tipo.getAllTiposWithSubTipos();
            
            const stats = {
                total_tipos: tiposWithSubTipos.length,
                total_subtipos: tiposWithSubTipos.reduce((acc, tipo) => acc + tipo.sub_tipos.length, 0),
                tipos_sin_subtipos: tiposWithSubTipos.filter(tipo => tipo.sub_tipos.length === 0).length,
                promedio_subtipos_por_tipo: tiposWithSubTipos.length > 0 
                    ? (tiposWithSubTipos.reduce((acc, tipo) => acc + tipo.sub_tipos.length, 0) / tiposWithSubTipos.length).toFixed(2)
                    : 0,
                detalle_por_tipo: tiposWithSubTipos.map(tipo => ({
                    id_tipo: tipo.id_tipo,
                    tipo_nombre: tipo.tipo_nombre,
                    cantidad_subtipos: tipo.sub_tipos.length
                }))
            };

            res.status(200).json({
                success: true,
                message: 'Estadísticas obtenidas exitosamente',
                data: stats
            });
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = TipoController;
