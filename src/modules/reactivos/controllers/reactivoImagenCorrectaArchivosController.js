const cloudinary = require('../../../config/cloudinary/cloudinaryConfig');
const { crearReactivoImagenCorrecta } = require('../models/ReactivoImagenCorrecta');

// Middleware para subir hasta 4 imágenes
const multer = require('multer');
const storage = multer.memoryStorage();
const uploadImagenes = multer({ storage }).array('imagenes', 4);

const crearReactivoImagenCorrectaArchivosController = async (req, res) => {
    try {
        // Campos de texto
        const { id_sub_tipo, tiempo_duracion, oracion, es_correcta_index } = req.body;
        if (!req.files || req.files.length !== 4) {
            return res.status(400).json({ message: 'Debes subir exactamente 4 imágenes.' });
        }
        // Subir imágenes a Cloudinary
        const imagenes = await Promise.all(req.files.map(async (file, idx) => {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'reactivos_imagen_correcta' },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.end(file.buffer);
            });
            return {
                imagen_url: result.secure_url,
                es_correcta: Number(es_correcta_index) === idx
            };
        }));
        // Crear reactivo
        const datos = {
            id_sub_tipo: Number(id_sub_tipo),
            tiempo_duracion: Number(tiempo_duracion),
            oracion,
            imagenes
        };
        const resultado = await crearReactivoImagenCorrecta(datos);
        res.status(201).json({
            message: 'Reactivo Imagen Correcta creado exitosamente (archivos)',
            id_reactivo: resultado.id_reactivo
        });
    } catch (error) {
        res.status(400).json({
            message: 'Error al crear reactivo Imagen Correcta (archivos)',
            error: error.message
        });
    }
};

module.exports = { crearReactivoImagenCorrectaArchivosController, uploadImagenes };