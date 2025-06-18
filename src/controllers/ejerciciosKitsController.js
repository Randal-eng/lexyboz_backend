const ejerciciosKitsModel = require('../models/ejerciciosKitsModel');

const agregarEjercicioAKit = async (req, res) => {
    try {
        const { ejercicio_id, kit_id } = req.body;
        if (!ejercicio_id || !kit_id) {
            return res.status(400).json({ message: 'ejercicio_id y kit_id son requeridos.' });
        }
        const relacion = await ejerciciosKitsModel.agregarEjercicioAKit(ejercicio_id, kit_id);
        return res.status(201).json(relacion);
    } catch (error) {
        return res.status(500).json({ message: 'Error al asociar ejercicio a kit.', error: error.message });
    }
};

const eliminarEjercicioDeKit = async (req, res) => {
    try {
        const { ejercicio_id, kit_id } = req.body;
        if (!ejercicio_id || !kit_id) {
            return res.status(400).json({ message: 'ejercicio_id y kit_id son requeridos.' });
        }
        const relacion = await ejerciciosKitsModel.eliminarEjercicioDeKit(ejercicio_id, kit_id);
        if (!relacion) return res.status(404).json({ message: 'Relación no encontrada.' });
        return res.status(200).json({ message: 'Relación eliminada.', relacion });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar relación.', error: error.message });
    }
};

const obtenerEjerciciosPorKit = async (req, res) => {
    try {
        const { kit_id } = req.params;
        const ejercicios = await ejerciciosKitsModel.obtenerEjerciciosPorKit(kit_id);
        return res.status(200).json(ejercicios);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener ejercicios del kit.', error: error.message });
    }
};

module.exports = {
    agregarEjercicioAKit,
    eliminarEjercicioDeKit,
    obtenerEjerciciosPorKit,
};
