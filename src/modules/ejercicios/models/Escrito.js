const pool = require('../../../db/connection');

const crearEscrito = async ({ tipo_subtipo, tipo, subtipo }) => {
    const query = `
        INSERT INTO Escritos (tipo_subtipo, tipo, subtipo)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [tipo_subtipo, tipo, subtipo];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obtenerEscritos = async () => {
    const result = await pool.query('SELECT * FROM Escritos');
    return result.rows;
};

module.exports = {
    crearEscrito,
    obtenerEscritos,
};
