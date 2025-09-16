const pool = require('../../../db/connection');
const Joi = require('joi');

const resultadoImagenCorrectaSchema = Joi.object({
    paciente_id: Joi.number().integer().required(),
    id_reactivo: Joi.number().integer().required(),
    tiempo_inicio_reactivo: Joi.date().iso().required(),
    tiempo_terminar_reactivo: Joi.date().iso().required(),
    imagen_seleccionada_id: Joi.number().integer().required()
});

const guardarResultadoImagenCorrecta = async (datos) => {
    const { error, value } = resultadoImagenCorrectaSchema.validate(datos);
    if (error) throw new Error('Datos inválidos: ' + error.details[0].message);

    // Verificar si la imagen seleccionada es la correcta
    const verificarQuery = `
        SELECT es_correcta FROM imagenes 
        WHERE imagen_id = $1 AND reactivo_id = $2;
    `;
    const verificarResult = await pool.query(verificarQuery, [
        value.imagen_seleccionada_id, 
        value.id_reactivo
    ]);
    
    if (verificarResult.rows.length === 0) {
        throw new Error('Imagen o reactivo no válido');
    }
    
    const es_correcta = verificarResult.rows[0].es_correcta;

    const query = `
        INSERT INTO resultados_escoger_imagen_correcta
        (usuario_id, id_reactivo, tiempo_inicio_reactivo, tiempo_terminar_reactivo, imagen_seleccionada_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING resultado_reactivo_usuario_id;
    `;
    const result = await pool.query(query, [
        value.paciente_id,
        value.id_reactivo,
        value.tiempo_inicio_reactivo,
        value.tiempo_terminar_reactivo,
        value.imagen_seleccionada_id
    ]);
    
    return {
        resultado_reactivo_usuario_id: result.rows[0].resultado_reactivo_usuario_id,
        es_correcta: es_correcta
    };
};

module.exports = { guardarResultadoImagenCorrecta };