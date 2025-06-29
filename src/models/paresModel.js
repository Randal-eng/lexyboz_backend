const pool = require('../db/connection');

const crearPar = async ({ palabra, pseudopalabra, par_es_correcto }) => {
    const query = `
        INSERT INTO Pares (palabra, pseudopalabra, par_es_correcto)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [palabra, pseudopalabra, par_es_correcto];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obtenerPares = async () => {
    const result = await pool.query('SELECT * FROM Pares');
    return result.rows;
};

module.exports = {
    crearPar,
    obtenerPares,
};
