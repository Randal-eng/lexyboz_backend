const pool = require('../../../db/connection');
const Joi = require('joi');

const resultadoImagenCorrectaSchema = Joi.object({
    usuario_id: Joi.number().integer().required(),
    id_reactivo: Joi.number().integer().required(),
    tiempo_inicio_reactivo: Joi.date().iso().required(),
    tiempo_terminar_reactivo: Joi.date().iso().required(),
    imagen_seleccionada_id: Joi.number().integer().required()
});

const guardarResultadoImagenCorrecta = async (datos) => {
    const { error, value } = resultadoImagenCorrectaSchema.validate(datos);
    if (error) throw new Error('Datos inválidos: ' + error.details[0].message);

    const query = `
        INSERT INTO resultados_escoger_imagen_correcta
        (usuario_id, id_reactivo, tiempo_inicio_reactivo, tiempo_terminar_reactivo, imagen_seleccionada_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING resultado_reactivo_usuario_id;
    `;
    const result = await pool.query(query, [
        value.usuario_id,
        value.id_reactivo,
        value.tiempo_inicio_reactivo,
        value.tiempo_terminar_reactivo,
        value.imagen_seleccionada_id
    ]);
    return result.rows[0];
};

module.exports = { guardarResultadoImagenCorrecta };