const pool = require('../../../db/connection');

const crearDensa = async ({ tipo_subtipo, tiempo_duracion, lectura }) => {
    const query = `
        INSERT INTO Densas (tipo_subtipo, tiempo_duracion, lectura)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [tipo_subtipo, tiempo_duracion, lectura];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obtenerDensas = async () => {
    const result = await pool.query('SELECT * FROM Densas');
    return result.rows;
};

module.exports = {
    crearDensa,
    obtenerDensas,
};
