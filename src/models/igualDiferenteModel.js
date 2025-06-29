const pool = require('../db/connection');

const crearReactivo = async ({ sub_tipo, tiempo_duracion, par_id }) => {
    const query = `
        INSERT INTO Igual_Diferente (sub_tipo, tiempo_duracion, par_id)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [sub_tipo, tiempo_duracion, par_id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obtenerReactivos = async () => {
    const result = await pool.query('SELECT * FROM Igual_Diferente');
    return result.rows;
};

module.exports = {
    crearReactivo,
    obtenerReactivos,
};
