const { crearReactivoImagenCorrecta } = require('../models/ReactivoImagenCorrecta');

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

module.exports = { crearReactivoImagenCorrectaController };