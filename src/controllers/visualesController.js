const visualesModel = require('../models/visualesModel');

const crearVisual = async (req, res) => {
    try {
        const { tipo_subtipo, tipo, subtipo } = req.body;
        if (!tipo_subtipo || !tipo || !subtipo) {
            return res.status(400).json({ message: 'tipo_subtipo, tipo y subtipo son requeridos.' });
        }
        const visual = await visualesModel.crearVisual({ tipo_subtipo, tipo, subtipo });
        return res.status(201).json(visual);
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear visual.', error: error.message });
    }
};

const obtenerVisuales = async (req, res) => {
    try {
        const visuales = await visualesModel.obtenerVisuales();
        return res.status(200).json(visuales);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener visuales.', error: error.message });
    }
};

module.exports = {
    crearVisual,
    obtenerVisuales,
};
