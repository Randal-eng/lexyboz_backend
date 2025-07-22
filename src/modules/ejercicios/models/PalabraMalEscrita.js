const pool = require('../../../db/connection');

const crearReactivo = async ({ sub_tipo, tiempo_duracion, oracion_1, oracion_2, palabra_incorrecta }) => {
    const query = `
        INSERT INTO Palabra_Mal_Escrito (sub_tipo, tiempo_duracion, oracion_1, oracion_2, palabra_incorrecta)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [sub_tipo, tiempo_duracion, oracion_1, oracion_2, palabra_incorrecta];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obtenerReactivos = async () => {
    const result = await pool.query('SELECT * FROM Palabra_Mal_Escrito');
    return result.rows;
};

module.exports = {
    crearReactivo,
    obtenerReactivos,
};
