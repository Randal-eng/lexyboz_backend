const escrituraReordenamientoModel = require('../models/escrituraReordenamientoModel');

const crearReactivo = async (req, res) => {
    try {
        const { tipo_subtipo, tiempo_duracion, palabra_correcta, palabra_mal_escrita, imagen_url } = req.body;
        if (!tipo_subtipo || !palabra_correcta) {
            return res.status(400).json({ message: 'tipo_subtipo y palabra_correcta son requeridos.' });
        }
        const reactivo = await escrituraReordenamientoModel.crearReactivo({ tipo_subtipo, tiempo_duracion, palabra_correcta, palabra_mal_escrita, imagen_url });
        return res.status(201).json(reactivo);
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear reactivo.', error: error.message });
    }
};

const obtenerReactivos = async (req, res) => {
    try {
        const reactivos = await escrituraReordenamientoModel.obtenerReactivos();
        return res.status(200).json(reactivos);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener reactivos.', error: error.message });
    }
};

module.exports = {
    crearReactivo,
    obtenerReactivos,
};
