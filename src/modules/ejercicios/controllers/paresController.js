const paresModel = require('../models/Par');

const crearPar = async (req, res) => {
    try {
        const { palabra, pseudopalabra, par_es_correcto } = req.body;
        if (typeof par_es_correcto !== 'boolean') {
            return res.status(400).json({ message: 'par_es_correcto debe ser booleano.' });
        }
        const par = await paresModel.crearPar({ palabra, pseudopalabra, par_es_correcto });
        return res.status(201).json(par);
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear par.', error: error.message });
    }
};

const obtenerPares = async (req, res) => {
    try {
        const pares = await paresModel.obtenerPares();
        return res.status(200).json(pares);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener pares.', error: error.message });
    }
};

module.exports = {
    crearPar,
    obtenerPares,
};
