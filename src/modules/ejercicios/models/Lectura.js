const pool = require('../../../db/connection');

const crearLectura = async ({ tipo_subtipo, tipo, subtipo }) => {
    const query = `
        INSERT INTO Lecturas (tipo_subtipo, tipo, subtipo)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [tipo_subtipo, tipo, subtipo];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obtenerLecturas = async () => {
    const result = await pool.query('SELECT * FROM Lecturas');
    return result.rows;
};

module.exports = {
    crearLectura,
    obtenerLecturas,
};
