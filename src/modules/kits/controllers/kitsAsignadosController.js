const kitsAsignadosModel = require('../models/KitAsignado');

const asignarKit = async (req, res) => {
    try {
        const { kit_id, paciente_id, estado } = req.body;
        if (!kit_id || !paciente_id || !estado) {
            return res.status(400).json({ message: 'kit_id, paciente_id y estado son requeridos.' });
        }
        const asignacion = await kitsAsignadosModel.asignarKit({ kit_id, paciente_id, estado });
        return res.status(201).json(asignacion);
    } catch (error) {
        return res.status(500).json({ message: 'Error al asignar kit.', error: error.message });
    }
};

const obtenerAsignaciones = async (req, res) => {
    try {
        const filtro = {
            kit_id: req.query.kit_id,
            paciente_id: req.query.paciente_id,
        };
        const asignaciones = await kitsAsignadosModel.obtenerAsignaciones(filtro);
        return res.status(200).json(asignaciones);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener asignaciones.', error: error.message });
    }
};

const editarEstadoAsignacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        if (!estado) {
            return res.status(400).json({ message: 'estado es requerido.' });
        }
        const asignacion = await kitsAsignadosModel.editarEstadoAsignacion(id, estado);
        if (!asignacion) return res.status(404).json({ message: 'Asignación no encontrada.' });
        return res.status(200).json(asignacion);
    } catch (error) {
        return res.status(500).json({ message: 'Error al editar asignación.', error: error.message });
    }
};

const eliminarAsignacion = async (req, res) => {
    try {
        const { id } = req.params;
        const asignacion = await kitsAsignadosModel.eliminarAsignacion(id);
        if (!asignacion) return res.status(404).json({ message: 'Asignación no encontrada.' });
        return res.status(200).json({ message: 'Asignación eliminada.', asignacion });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar asignación.', error: error.message });
    }
};

// Historial de kits por paciente (paginado)
const obtenerHistorialPorPaciente = async (req, res) => {
    try {
        const { paciente_id } = req.params;
        if (!paciente_id) {
            return res.status(400).json({ message: 'paciente_id es requerido.' });
        }
        const page = parseInt(req.query.page, 10) > 0 ? parseInt(req.query.page, 10) : 1;
        const limit = parseInt(req.query.limit, 10) > 0 ? parseInt(req.query.limit, 10) : 10;
        const offset = (page - 1) * limit;

        const { rows, total } = await kitsAsignadosModel.obtenerHistorialPorPaciente({ paciente_id, limit, offset });

        return res.status(200).json({
            page,
            limit,
            total,
            count: rows.length,
            historial: rows,
            ...(rows.length === 0 ? { message: 'No hay historial de kits para este paciente.' } : {}),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener historial de kits.', error: error.message });
    }
};

module.exports = {
    asignarKit,
    obtenerAsignaciones,
    editarEstadoAsignacion,
    eliminarAsignacion,
    obtenerHistorialPorPaciente,
};
