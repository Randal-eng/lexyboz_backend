const escritosModel = require('../models/Escrito');

const crearEscrito = async (req, res) => {
    try {
        const { tipo_subtipo, tipo, subtipo } = req.body;
        if (!tipo_subtipo || !tipo || !subtipo) {
            return res.status(400).json({ message: 'tipo_subtipo, tipo y subtipo son requeridos.' });
        }
        const escrito = await escritosModel.crearEscrito({ tipo_subtipo, tipo, subtipo });
        return res.status(201).json(escrito);
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear escrito.', error: error.message });
    }
};

const obtenerEscritos = async (req, res) => {
    try {
        const escritos = await escritosModel.obtenerEscritos();
        return res.status(200).json(escritos);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener escritos.', error: error.message });
    }
};

module.exports = {
    crearEscrito,
    obtenerEscritos,
};
