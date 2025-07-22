const pool = require('../../../db/connection');

const crearPalabra = async ({ tipo_subtipo, tiempo_duracion, palabra }) => {
    const query = `
        INSERT INTO Lectura_Palabras (tipo_subtipo, tiempo_duracion, palabra)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [tipo_subtipo, tiempo_duracion, palabra];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obtenerPalabras = async () => {
    const result = await pool.query('SELECT * FROM Lectura_Palabras');
    return result.rows;
};

module.exports = {
    crearPalabra,
    obtenerPalabras,
};
