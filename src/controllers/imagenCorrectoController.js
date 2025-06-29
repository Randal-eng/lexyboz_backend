const imagenCorrectoModel = require('../models/imagenCorrectoModel');

const crearReactivo = async (req, res) => {
    try {
        const { sub_tipo, tiempo_duracion, oracion } = req.body;
        if (!sub_tipo || !oracion) {
            return res.status(400).json({ message: 'sub_tipo y oracion son requeridos.' });
        }
        const reactivo = await imagenCorrectoModel.crearReactivo({ sub_tipo, tiempo_duracion, oracion });
        return res.status(201).json(reactivo);
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear reactivo.', error: error.message });
    }
};

const obtenerReactivos = async (req, res) => {
    try {
        const reactivos = await imagenCorrectoModel.obtenerReactivos();
        return res.status(200).json(reactivos);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener reactivos.', error: error.message });
    }
};

module.exports = {
    crearReactivo,
    obtenerReactivos,
};
