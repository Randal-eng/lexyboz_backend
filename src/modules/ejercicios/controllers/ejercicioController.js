const ejercicioModel = require('../models/Ejercicio');

const crearEjercicio = async (req, res) => {
    try {
        const { titulo, descripcion, tipo_ejercicio, creado_por } = req.body;
        if (!titulo || !creado_por) {
            return res.status(400).json({ message: 'titulo y creado_por son requeridos.' });
        }
        const ejercicio = await ejercicioModel.crearEjercicio({ titulo, descripcion, tipo_ejercicio, creado_por });
        return res.status(201).json(ejercicio);
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear ejercicio.', error: error.message });
    }
};

const obtenerEjercicios = async (req, res) => {
    try {
        const ejercicios = await ejercicioModel.obtenerEjercicios();
        return res.status(200).json(ejercicios);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener ejercicios.', error: error.message });
    }
};

const obtenerEjercicioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const ejercicio = await ejercicioModel.obtenerEjercicioPorId(id);
        if (!ejercicio) return res.status(404).json({ message: 'Ejercicio no encontrado.' });
        return res.status(200).json(ejercicio);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener ejercicio.', error: error.message });
    }
};

const editarEjercicio = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, tipo_ejercicio } = req.body;
        const ejercicio = await ejercicioModel.editarEjercicio(id, { titulo, descripcion, tipo_ejercicio });
        if (!ejercicio) return res.status(404).json({ message: 'Ejercicio no encontrado.' });
        return res.status(200).json(ejercicio);
    } catch (error) {
        return res.status(500).json({ message: 'Error al editar ejercicio.', error: error.message });
    }
};

const eliminarEjercicio = async (req, res) => {
    try {
        const { id } = req.params;
        const ejercicio = await ejercicioModel.eliminarEjercicio(id);
        if (!ejercicio) return res.status(404).json({ message: 'Ejercicio no encontrado.' });
        return res.status(200).json({ message: 'Ejercicio eliminado.', ejercicio });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar ejercicio.', error: error.message });
    }
};

module.exports = {
    crearEjercicio,
    obtenerEjercicios,
    obtenerEjercicioPorId,
    editarEjercicio,
    eliminarEjercicio,
};
