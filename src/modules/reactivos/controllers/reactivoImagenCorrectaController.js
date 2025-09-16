const { crearReactivoImagenCorrecta } = require('../models/ReactivoImagenCorrecta');
const { guardarResultadoImagenCorrecta } = require('../models/ResultadoImagenCorrecta');

const crearReactivoImagenCorrectaController = async (req, res) => {
    try {
        const datos = req.body;
        // Si las imágenes vienen como string (por JSON), parsear
        if (typeof datos.imagenes === 'string') {
            datos.imagenes = JSON.parse(datos.imagenes);
        }
        const resultado = await crearReactivoImagenCorrecta(datos);
        res.status(201).json({
            message: 'Reactivo Imagen Correcta creado exitosamente',
            id_reactivo: resultado.id_reactivo
        });
    } catch (error) {
        res.status(400).json({
            message: 'Error al crear reactivo Imagen Correcta',
            error: error.message
        });
    }
};

const guardarResultadoImagenCorrectaController = async (req, res) => {
    try {
        const datos = req.body;
        const resultado = await guardarResultadoImagenCorrecta(datos);
        res.status(201).json({
            message: 'Resultado guardado exitosamente',
            resultado_id: resultado.resultado_reactivo_usuario_id,
            paciente_id: datos.paciente_id,
            es_correcta: resultado.es_correcta
        });
    } catch (error) {
        res.status(400).json({
            message: 'Error al guardar resultado',
            error: error.message
        });
    }
};

module.exports = { crearReactivoImagenCorrectaController, guardarResultadoImagenCorrectaController };