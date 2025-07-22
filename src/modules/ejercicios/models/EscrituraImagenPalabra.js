const pool = require('../../../db/connection');

const crearReactivo = async ({ tipo_subtipo, tiempo_duracion, palabra_correcta, imagen_url }) => {
    const query = `
        INSERT INTO Escritura_Imagen_Palabra (tipo_subtipo, tiempo_duracion, palabra_correcta, imagen_url)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [tipo_subtipo, tiempo_duracion, palabra_correcta, imagen_url];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obtenerReactivos = async () => {
    const result = await pool.query('SELECT * FROM Escritura_Imagen_Palabra');
    return result.rows;
};

module.exports = {
    crearReactivo,
    obtenerReactivos,
};
