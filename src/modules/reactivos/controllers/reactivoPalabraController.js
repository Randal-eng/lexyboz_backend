const ReactivoLecturaPalabras = require('../models/ReactivoLecturaPalabras');
const ResultadoLecturaPalabrasNormales = require('../models/ResultadoLecturaPalabrasNormales');
const cloudinary = require('../../../config/cloudinary/cloudinaryConfig');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Crear reactivo de palabras normales
const crearReactivoPalabra = async (req, res) => {
  try {
    const { id_sub_tipo, tiempo_duracion, palabra } = req.body;
    if (!id_sub_tipo || !palabra) {
      return res.status(400).json({ message: 'id_sub_tipo y palabra son requeridos.' });
    }
    const nuevoReactivo = await ReactivoLecturaPalabras.create({ id_sub_tipo, tiempo_duracion, palabra });
    res.status(201).json({ message: 'Reactivo creado exitosamente', reactivo: nuevoReactivo });
  } catch (error) {
    console.error('Error al crear reactivo:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// Guardar resultado de lectura de palabras normales
const guardarResultadoLecturaPalabrasNormales = async (req, res) => {
  try {
    const { usuario_ID, id_reactivo } = req.body;
    let voz_usuario_URL = null;
    if (req.file) {
      voz_usuario_URL = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'video', folder: 'resultados_voz_usuarios' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(req.file.buffer);
      });
    }
    // Enviar audio a la IA
    let iaResponse = null;
    if (req.file) {
      const FormData = require('form-data');
      const axios = require('axios');
      const form = new FormData();
      form.append('file', req.file.buffer, {
        filename: req.file.originalname || 'audio.wav',
        contentType: req.file.mimetype || 'audio/wav'
      });
      try {
        const iaRes = await axios.post('https://lexyvoz-ai.onrender.com/inferir/', form, {
          headers: form.getHeaders(),
          maxBodyLength: Infinity,
          timeout: 30000
        });
        iaResponse = iaRes.data;
      } catch (err) {
        console.error('Error al enviar audio a la IA:', err);
        iaResponse = { error: 'Error al procesar el audio con la IA' };
      }
    }
    // Guardar resultado en BD
    const resultado = await ResultadoLecturaPalabrasNormales.create({ usuario_ID, id_reactivo, voz_usuario_URL });
    res.status(201).json({ message: 'Resultado guardado exitosamente', resultado, ia: iaResponse });
  } catch (error) {
    console.error('Error al guardar resultado:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

module.exports = {
  crearReactivoPalabra,
  guardarResultadoLecturaPalabrasNormales,
  upload
};
