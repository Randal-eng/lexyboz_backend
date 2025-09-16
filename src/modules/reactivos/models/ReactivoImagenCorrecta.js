const pool = require('../../../db/connection');
const Joi = require('joi');

// Esquema de validación para reactivo tipo Imagen Correcta
const reactivoImagenCorrectaSchema = Joi.object({
    id_sub_tipo: Joi.number().integer().valid(7).required(),
    tiempo_duracion: Joi.number().integer().min(1).required(),
    oracion: Joi.string().min(5).max(255).required(),
    imagenes: Joi.array().items(
        Joi.object({
            imagen_url: Joi.string().uri().required(),
            es_correcta: Joi.boolean().required()
        })
    ).length(4).required()
});

const crearReactivoImagenCorrecta = async (datos) => {
    const { error, value } = reactivoImagenCorrectaSchema.validate(datos);
    if (error) throw new Error('Datos inválidos: ' + error.details[0].message);

    // Insertar reactivo-imagen_correcta
    const insertReactivo = `
        INSERT INTO reactivo_imagen_correcta (id_sub_tipo, tiempo_duracion, oracion)
        VALUES ($1, $2, $3)
        RETURNING id_reactivo;
    `;
    const result = await pool.query(insertReactivo, [
        value.id_sub_tipo,
        value.tiempo_duracion,
        value.oracion
    ]);
    const id_reactivo = result.rows[0].id_reactivo;

    // Insertar imágenes
    for (const img of value.imagenes) {
        await pool.query(
            `INSERT INTO imagenes (reactivo_id, imagen_url, es_correcta) VALUES ($1, $2, $3)`,
            [id_reactivo, img.imagen_url, img.es_correcta]
        );
    }
    return { id_reactivo };
};

module.exports = { crearReactivoImagenCorrecta };