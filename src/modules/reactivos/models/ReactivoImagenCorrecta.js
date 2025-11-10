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
    console.log('=== INICIO crearReactivoImagenCorrecta ===');
    console.log('Datos recibidos:', JSON.stringify(datos, null, 2));
    
    const { error, value } = reactivoImagenCorrectaSchema.validate(datos);
    if (error) {
        console.log('Error de validación:', error.details[0].message);
        throw new Error('Datos inválidos: ' + error.details[0].message);
    }
    
    console.log('Datos validados:', JSON.stringify(value, null, 2));

    try {
        // Insertar reactivo-imagen_correcta
        const insertReactivo = `
            INSERT INTO reactivo_imagen_correcta (id_sub_tipo, tiempo_duracion, oracion)
            VALUES ($1, $2, $3)
            RETURNING id_reactivo;
        `;
        
        console.log('Query reactivo:', insertReactivo);
        console.log('Parámetros:', [value.id_sub_tipo, value.tiempo_duracion, value.oracion]);
        
        const result = await pool.query(insertReactivo, [
            value.id_sub_tipo,
            value.tiempo_duracion,
            value.oracion
        ]);
        
        const id_reactivo = result.rows[0].id_reactivo;
        console.log('Reactivo creado con ID:', id_reactivo);

        // Insertar imágenes
        console.log('Insertando imágenes...');
        for (let i = 0; i < value.imagenes.length; i++) {
            const img = value.imagenes[i];
            console.log(`Insertando imagen ${i + 1}:`, img);
            
            try {
                await pool.query(
                    `INSERT INTO imagenes (reactivo_id, imagen_url, es_correcta) VALUES ($1, $2, $3)`,
                    [id_reactivo, img.imagen_url, img.es_correcta]
                );
                console.log(`Imagen ${i + 1} insertada exitosamente`);
            } catch (imgError) {
                console.error(`Error insertando imagen ${i + 1}:`, imgError);
                throw imgError;
            }
        }
        
        console.log('=== FIN crearReactivoImagenCorrecta EXITOSO ===');
        return { id_reactivo };
        
    } catch (dbError) {
        console.error('Error en base de datos:', dbError);
        throw dbError;
    }
};

module.exports = { crearReactivoImagenCorrecta };