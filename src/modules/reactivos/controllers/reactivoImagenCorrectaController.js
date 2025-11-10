const { crearReactivoImagenCorrecta } = require('../models/ReactivoImagenCorrecta');
const { guardarResultadoImagenCorrecta } = require('../models/ResultadoImagenCorrecta');

const crearReactivoImagenCorrectaController = async (req, res) => {
    try {
        console.log('=== CONTROLLER: Datos recibidos ===');
        console.log('Body:', req.body);
        console.log('Headers:', req.headers);
        
        // Verificar que la tabla imagenes existe
        const pool = require('../../../db/connection');
        try {
            const testQuery = await pool.query("SELECT COUNT(*) FROM imagenes LIMIT 1");
            console.log('Tabla imagenes existe y es accesible');
        } catch (tableError) {
            console.error('Problema con tabla imagenes:', tableError.message);
            return res.status(500).json({
                message: 'Problema con la estructura de la base de datos',
                error: `Tabla imagenes: ${tableError.message}`
            });
        }
        
        const datos = req.body;
        
        // Si las imágenes vienen como string (por JSON), parsear
        if (typeof datos.imagenes === 'string') {
            datos.imagenes = JSON.parse(datos.imagenes);
        }
        
        console.log('Datos procesados para modelo:', datos);
        const resultado = await crearReactivoImagenCorrecta(datos);
        
        res.status(201).json({
            message: 'Reactivo Imagen Correcta creado exitosamente',
            id_reactivo: resultado.id_reactivo
        });
    } catch (error) {
        console.error('=== ERROR EN CONTROLLER ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        console.error('Datos que causaron el error:', req.body);
        
        res.status(400).json({
            message: 'Error al crear reactivo Imagen Correcta',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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