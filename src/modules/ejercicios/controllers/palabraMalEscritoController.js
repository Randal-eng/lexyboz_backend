const palabraMalEscritoModel = require('../models/palabraMalEscritoModel');

const crearReactivo = async (req, res) => {
    try {
        const { sub_tipo, tiempo_duracion, oracion_1, oracion_2, palabra_incorrecta } = req.body;
        if (!sub_tipo || !oracion_1 || !oracion_2 || !palabra_incorrecta) {
            return res.status(400).json({ message: 'sub_tipo, oracion_1, oracion_2 y palabra_incorrecta son requeridos.' });
        }
        const reactivo = await palabraMalEscritoModel.crearReactivo({ sub_tipo, tiempo_duracion, oracion_1, oracion_2, palabra_incorrecta });
        return res.status(201).json(reactivo);
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear reactivo.', error: error.message });
    }
};

const obtenerReactivos = async (req, res) => {
    try {
        const reactivos = await palabraMalEscritoModel.obtenerReactivos();
        return res.status(200).json(reactivos);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener reactivos.', error: error.message });
    }
};

module.exports = {
    crearReactivo,
    obtenerReactivos,
};
