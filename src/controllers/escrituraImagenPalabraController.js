const escrituraImagenPalabraModel = require('../models/escrituraImagenPalabraModel');

const crearReactivo = async (req, res) => {
    try {
        const { tipo_subtipo, tiempo_duracion, palabra_correcta, imagen_url } = req.body;
        if (!tipo_subtipo || !palabra_correcta) {
            return res.status(400).json({ message: 'tipo_subtipo y palabra_correcta son requeridos.' });
        }
        const reactivo = await escrituraImagenPalabraModel.crearReactivo({ tipo_subtipo, tiempo_duracion, palabra_correcta, imagen_url });
        return res.status(201).json(reactivo);
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear reactivo.', error: error.message });
    }
};

const obtenerReactivos = async (req, res) => {
    try {
        const reactivos = await escrituraImagenPalabraModel.obtenerReactivos();
        return res.status(200).json(reactivos);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener reactivos.', error: error.message });
    }
};

module.exports = {
    crearReactivo,
    obtenerReactivos,
};
