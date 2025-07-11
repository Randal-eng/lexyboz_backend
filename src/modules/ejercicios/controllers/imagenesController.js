const imagenesModel = require('../models/imagenesModel');

const crearImagen = async (req, res) => {
    try {
        const { reactivo_id, imagen_url, es_correcta } = req.body;
        if (!reactivo_id || !imagen_url || typeof es_correcta !== 'boolean') {
            return res.status(400).json({ message: 'reactivo_id, imagen_url y es_correcta son requeridos.' });
        }
        const imagen = await imagenesModel.crearImagen({ reactivo_id, imagen_url, es_correcta });
        return res.status(201).json(imagen);
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear imagen.', error: error.message });
    }
};

const obtenerImagenesPorReactivo = async (req, res) => {
    try {
        const { reactivo_id } = req.params;
        const imagenes = await imagenesModel.obtenerImagenesPorReactivo(reactivo_id);
        return res.status(200).json(imagenes);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener imagenes.', error: error.message });
    }
};

module.exports = {
    crearImagen,
    obtenerImagenesPorReactivo,
};
