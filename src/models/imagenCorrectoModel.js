const pool = require('../db/connection');

const crearReactivo = async ({ sub_tipo, tiempo_duracion, oracion }) => {
    const query = `
        INSERT INTO Imagen_Correcto (sub_tipo, tiempo_duracion, oracion)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [sub_tipo, tiempo_duracion, oracion];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obtenerReactivos = async () => {
    const result = await pool.query('SELECT * FROM Imagen_Correcto');
    return result.rows;
};

module.exports = {
    crearReactivo,
    obtenerReactivos,
};
