const SubTipo = require('../models/SubTipo');

/**
 * Controlador para gestionar Sub-tipos de ejercicios
 */
class SubTipoController {
    /**
     * Crear un nuevo sub-tipo
     */
    static async createSubTipo(req, res) {
        try {
            const subTipo = await SubTipo.createSubTipo(req.body);
            res.status(201).json({
                success: true,
                message: 'Sub-tipo creado exitosamente',
                data: subTipo
            });
        } catch (error) {
            console.error('Error al crear sub-tipo:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Obtener todos los sub-tipos
     */
    static async getAllSubTipos(req, res) {
        try {
            const { tipo } = req.query;
            
            let subTipos;
            if (tipo) {
                subTipos = await SubTipo.getSubTiposByTipo(parseInt(tipo));
            } else {
                subTipos = await SubTipo.getAllSubTipos();
            }

            res.status(200).json({
                success: true,
                message: 'Sub-tipos obtenidos exitosamente',
                data: subTipos,
                count: subTipos.length,
                ...(tipo && { filtered_by_tipo: parseInt(tipo) })
            });
        } catch (error) {
            console.error('Error al obtener sub-tipos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtener sub-tipo por ID
     */
    static async getSubTipoById(req, res) {
        try {
            const { id } = req.params;
            const subTipo = await SubTipo.getSubTipoById(parseInt(id));

            res.status(200).json({
                success: true,
                message: 'Sub-tipo obtenido exitosamente',
                data: subTipo
            });
        } catch (error) {
            console.error('Error al obtener sub-tipo:', error);
            if (error.message === 'Sub-tipo no encontrado') {
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
     * Obtener sub-tipos por tipo
     */
    static async getSubTiposByTipo(req, res) {
        try {
            const { tipo_id } = req.params;
            const subTipos = await SubTipo.getSubTiposByTipo(parseInt(tipo_id));

            res.status(200).json({
                success: true,
                message: 'Sub-tipos obtenidos exitosamente',
                data: subTipos,
                count: subTipos.length,
                tipo_id: parseInt(tipo_id)
            });
        } catch (error) {
            console.error('Error al obtener sub-tipos por tipo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Actualizar sub-tipo
     */
    static async updateSubTipo(req, res) {
        try {
            const { id } = req.params;
            const subTipo = await SubTipo.updateSubTipo(parseInt(id), req.body);
            
            res.status(200).json({
                success: true,
                message: 'Sub-tipo actualizado exitosamente',
                data: subTipo
            });
        } catch (error) {
            console.error('Error al actualizar sub-tipo:', error);
            if (error.message === 'Sub-tipo no encontrado') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else if (error.message.includes('validación') || error.message.includes('existe') || error.message.includes('tipo especificado')) {
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
     * Eliminar sub-tipo
     */
    static async deleteSubTipo(req, res) {
        try {
            const { id } = req.params;
            await SubTipo.deleteSubTipo(parseInt(id));
            
            res.status(200).json({
                success: true,
                message: 'Sub-tipo eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar sub-tipo:', error);
            if (error.message === 'Sub-tipo no encontrado') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else if (error.message.includes('ejercicios')) {
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
     * Buscar sub-tipos por nombre
     */
    static async searchSubTipos(req, res) {
        try {
            const { q, tipo } = req.query;
            
            if (!q || q.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere un término de búsqueda'
                });
            }

            const subTipos = await SubTipo.searchSubTipos(q.trim(), tipo ? parseInt(tipo) : null);
            
            res.status(200).json({
                success: true,
                message: 'Búsqueda completada exitosamente',
                data: subTipos,
                count: subTipos.length,
                search_term: q.trim(),
                ...(tipo && { filtered_by_tipo: parseInt(tipo) })
            });
        } catch (error) {
            console.error('Error al buscar sub-tipos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtener conteo de sub-tipos por tipo
     */
    static async getSubTiposCountByTipo(req, res) {
        try {
            const counts = await SubTipo.countSubTiposByTipo();
            
            res.status(200).json({
                success: true,
                message: 'Conteo obtenido exitosamente',
                data: counts
            });
        } catch (error) {
            console.error('Error al obtener conteo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Verificar si existe un sub-tipo con el mismo nombre en el tipo
     */
    static async checkSubTipoExists(req, res) {
        try {
            const { sub_tipo_nombre, tipo, exclude_id } = req.query;
            
            if (!sub_tipo_nombre || !tipo) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requieren los parámetros sub_tipo_nombre y tipo'
                });
            }

            const exists = await SubTipo.existsSubTipoInTipo(
                sub_tipo_nombre, 
                parseInt(tipo), 
                exclude_id ? parseInt(exclude_id) : null
            );
            
            res.status(200).json({
                success: true,
                message: 'Verificación completada',
                data: {
                    exists,
                    sub_tipo_nombre,
                    tipo: parseInt(tipo)
                }
            });
        } catch (error) {
            console.error('Error al verificar sub-tipo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtener estadísticas de sub-tipos
     */
    static async getSubTiposStats(req, res) {
        try {
            const allSubTipos = await SubTipo.getAllSubTipos();
            const countsByTipo = await SubTipo.countSubTiposByTipo();
            
            // Agrupar por tipo
            const subTiposByTipo = allSubTipos.reduce((acc, subTipo) => {
                if (!acc[subTipo.tipo_nombre]) {
                    acc[subTipo.tipo_nombre] = [];
                }
                acc[subTipo.tipo_nombre].push(subTipo);
                return acc;
            }, {});

            const stats = {
                total_subtipos: allSubTipos.length,
                total_tipos_con_subtipos: Object.keys(subTiposByTipo).length,
                tipos_sin_subtipos: countsByTipo.filter(count => count.cantidad_subtipos === '0').length,
                promedio_subtipos_por_tipo: countsByTipo.length > 0 
                    ? (allSubTipos.length / countsByTipo.length).toFixed(2)
                    : 0,
                detalle_por_tipo: countsByTipo,
                subtipos_por_tipo: subTiposByTipo
            };

            res.status(200).json({
                success: true,
                message: 'Estadísticas de sub-tipos obtenidas exitosamente',
                data: stats
            });
        } catch (error) {
            console.error('Error al obtener estadísticas de sub-tipos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = SubTipoController;
