const pool = require('../db/connection');

const crearPseudopalabra = async ({ tipo_subtipo, tiempo_duracion, pseudopalabra }) => {
    const query = `
        INSERT INTO Lectura_Pseudopalabras (tipo_subtipo, tiempo_duracion, pseudopalabra)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [tipo_subtipo, tiempo_duracion, pseudopalabra];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obtenerPseudopalabras = async () => {
    const result = await pool.query('SELECT * FROM Lectura_Pseudopalabras');
    return result.rows;
};

module.exports = {
    crearPseudopalabra,
    obtenerPseudopalabras,
};
