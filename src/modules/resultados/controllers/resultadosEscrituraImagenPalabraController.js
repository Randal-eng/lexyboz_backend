const resultadosModel = require('../models/ResultadoEscrituraImagenPalabra');

const registrarResultado = async (req, res) => {
    try {
        const { usuario_id, tipo_subtipo, tiempo_inicio_reactivo, tiempo_terminar_reactivo, palabra_formada } = req.body;
        if (!usuario_id || !tipo_subtipo) {
            return res.status(400).json({ message: 'usuario_id y tipo_subtipo son requeridos.' });
        }
        const resultado = await resultadosModel.registrarResultado({ usuario_id, tipo_subtipo, tiempo_inicio_reactivo, tiempo_terminar_reactivo, palabra_formada });
        return res.status(201).json(resultado);
    } catch (error) {
        return res.status(500).json({ message: 'Error al registrar resultado.', error: error.message });
    }
};

const obtenerResultadosPorUsuario = async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const resultados = await resultadosModel.obtenerResultadosPorUsuario(usuario_id);
        return res.status(200).json(resultados);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener resultados.', error: error.message });
    }
};

const obtenerResultadosConUsuario = async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const resultados = await resultadosModel.obtenerResultadosConUsuario(usuario_id);
        return res.status(200).json(resultados);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener resultados con usuario.', error: error.message });
    }
};

module.exports = {
    registrarResultado,
    obtenerResultadosPorUsuario,
    obtenerResultadosConUsuario,
};
