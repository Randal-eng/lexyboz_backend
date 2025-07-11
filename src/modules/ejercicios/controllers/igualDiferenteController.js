const igualDiferenteModel = require('../models/igualDiferenteModel');

const crearReactivo = async (req, res) => {
    try {
        const { sub_tipo, tiempo_duracion, par_id } = req.body;
        if (!sub_tipo || !par_id) {
            return res.status(400).json({ message: 'sub_tipo y par_id son requeridos.' });
        }
        const reactivo = await igualDiferenteModel.crearReactivo({ sub_tipo, tiempo_duracion, par_id });
        return res.status(201).json(reactivo);
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear reactivo.', error: error.message });
    }
};

const obtenerReactivos = async (req, res) => {
    try {
        const reactivos = await igualDiferenteModel.obtenerReactivos();
        return res.status(200).json(reactivos);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener reactivos.', error: error.message });
    }
};

module.exports = {
    crearReactivo,
    obtenerReactivos,
};
