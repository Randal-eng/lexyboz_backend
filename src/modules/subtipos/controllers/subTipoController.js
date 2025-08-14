const SubTipo = require('../models/SubTipo');

class SubTipoController {
    // Obtener todos los subtipos
    static async listado(req, res) {
        try {
            const subtipos = await SubTipo.obtenerTodos();
            
            res.status(200).json({
                success: true,
                message: 'Sub-tipos obtenidos exitosamente',
                count: subtipos.length,
                data: subtipos
            });
        } catch (error) {
            console.error('Error en listado de subtipos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener subtipo por ID
    static async obtenerPorId(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de subtipo inválido'
                });
            }

            const subtipo = await SubTipo.obtenerPorId(parseInt(id));

            if (!subtipo) {
                return res.status(404).json({
                    success: false,
                    message: 'Sub-tipo no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Sub-tipo obtenido exitosamente',
                data: subtipo
            });
        } catch (error) {
            console.error('Error al obtener subtipo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener subtipos por tipo
    static async obtenerPorTipo(req, res) {
        try {
            const { tipo_id } = req.params;

            if (!tipo_id || isNaN(tipo_id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de tipo inválido'
                });
            }

            // Verificar que el tipo existe
            const tipoExiste = await SubTipo.tipoExiste(parseInt(tipo_id));
            if (!tipoExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'Tipo no encontrado'
                });
            }

            const subtipos = await SubTipo.obtenerPorTipo(parseInt(tipo_id));

            res.status(200).json({
                success: true,
                message: 'Sub-tipos del tipo obtenidos exitosamente',
                count: subtipos.length,
                data: subtipos
            });
        } catch (error) {
            console.error('Error al obtener subtipos por tipo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Crear nuevo subtipo
    static async crear(req, res) {
        try {
            const { tipo_id, sub_tipo_nombre } = req.body;

            if (!tipo_id || isNaN(tipo_id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de tipo inválido'
                });
            }

            if (!sub_tipo_nombre || sub_tipo_nombre.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre del sub-tipo es requerido'
                });
            }

            // Verificar que el tipo existe
            const tipoExiste = await SubTipo.tipoExiste(parseInt(tipo_id));
            if (!tipoExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'El tipo especificado no existe'
                });
            }

            // Verificar si ya existe el subtipo con ese nombre para ese tipo
            const existe = await SubTipo.existePorNombreYTipo(sub_tipo_nombre.trim(), parseInt(tipo_id));
            if (existe) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe un sub-tipo con ese nombre para este tipo'
                });
            }

            const nuevoSubTipo = await SubTipo.crear(parseInt(tipo_id), sub_tipo_nombre.trim());

            res.status(201).json({
                success: true,
                message: 'Sub-tipo creado exitosamente',
                data: nuevoSubTipo
            });
        } catch (error) {
            console.error('Error al crear subtipo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Actualizar subtipo
    static async actualizar(req, res) {
        try {
            const { id } = req.params;
            const { sub_tipo_nombre } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de subtipo inválido'
                });
            }

            if (!sub_tipo_nombre || sub_tipo_nombre.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre del sub-tipo es requerido'
                });
            }

            // Obtener el subtipo actual para verificar el tipo
            const subtipoActual = await SubTipo.obtenerPorId(parseInt(id));
            if (!subtipoActual) {
                return res.status(404).json({
                    success: false,
                    message: 'Sub-tipo no encontrado'
                });
            }

            // Verificar si existe otro subtipo con el mismo nombre para el mismo tipo
            const existe = await SubTipo.existePorNombreYTipo(
                sub_tipo_nombre.trim(), 
                subtipoActual.tipo_id, 
                parseInt(id)
            );
            if (existe) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe otro sub-tipo con ese nombre para este tipo'
                });
            }

            const subtipoActualizado = await SubTipo.actualizar(parseInt(id), sub_tipo_nombre.trim());

            if (!subtipoActualizado) {
                return res.status(404).json({
                    success: false,
                    message: 'Sub-tipo no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Sub-tipo actualizado exitosamente',
                data: subtipoActualizado
            });
        } catch (error) {
            console.error('Error al actualizar subtipo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Eliminar subtipo
    static async eliminar(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de subtipo inválido'
                });
            }

            const subtipoEliminado = await SubTipo.eliminar(parseInt(id));

            if (!subtipoEliminado) {
                return res.status(404).json({
                    success: false,
                    message: 'Sub-tipo no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Sub-tipo eliminado exitosamente',
                data: subtipoEliminado
            });
        } catch (error) {
            console.error('Error al eliminar subtipo:', error);
            
            // Verificar si es error de clave foránea
            if (error.code === '23503') {
                return res.status(409).json({
                    success: false,
                    message: 'No se puede eliminar el sub-tipo porque está siendo utilizado'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Buscar subtipos
    static async buscar(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Término de búsqueda requerido'
                });
            }

            const subtipos = await SubTipo.buscarPorNombre(q.trim());

            res.status(200).json({
                success: true,
                message: 'Búsqueda completada exitosamente',
                count: subtipos.length,
                data: subtipos
            });
        } catch (error) {
            console.error('Error en búsqueda de subtipos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener conteo por tipo
    static async conteoPorTipo(req, res) {
        try {
            const conteo = await SubTipo.conteoSubtiposPorTipo();

            res.status(200).json({
                success: true,
                message: 'Conteo por tipo obtenido exitosamente',
                count: conteo.length,
                data: conteo
            });
        } catch (error) {
            console.error('Error al obtener conteo por tipo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Verificar existencia
    static async verificarExistencia(req, res) {
        try {
            const { nombre, tipo_id, excluir_id } = req.query;

            if (!nombre || !tipo_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre y tipo_id son requeridos'
                });
            }

            if (isNaN(tipo_id)) {
                return res.status(400).json({
                    success: false,
                    message: 'tipo_id debe ser un número válido'
                });
            }

            const existe = await SubTipo.existePorNombreYTipo(
                nombre.trim(), 
                parseInt(tipo_id), 
                excluir_id ? parseInt(excluir_id) : null
            );

            res.status(200).json({
                success: true,
                message: 'Verificación completada',
                data: {
                    existe: existe,
                    nombre: nombre.trim(),
                    tipo_id: parseInt(tipo_id)
                }
            });
        } catch (error) {
            console.error('Error al verificar existencia:', error);
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
            const stats = await SubTipo.obtenerEstadisticas();

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

module.exports = SubTipoController;
