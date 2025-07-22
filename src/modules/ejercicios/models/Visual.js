const pool = require('../../../db/connection');

const crearVisual = async ({ tipo_subtipo, tipo, subtipo }) => {
    const query = `
        INSERT INTO Visuales (tipo_subtipo, tipo, subtipo)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [tipo_subtipo, tipo, subtipo];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obtenerVisuales = async () => {
    const result = await pool.query('SELECT * FROM Visuales');
    return result.rows;
};

module.exports = {
    crearVisual,
    obtenerVisuales,
};
