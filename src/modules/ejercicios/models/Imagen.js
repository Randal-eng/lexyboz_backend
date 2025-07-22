const pool = require('../../../db/connection');

const crearImagen = async ({ reactivo_id, imagen_url, es_correcta }) => {
    const query = `
        INSERT INTO Imagenes (reactivo_id, imagen_url, es_correcta)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [reactivo_id, imagen_url, es_correcta];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obtenerImagenesPorReactivo = async (reactivo_id) => {
    const result = await pool.query('SELECT * FROM Imagenes WHERE reactivo_id = $1', [reactivo_id]);
    return result.rows;
};

module.exports = {
    crearImagen,
    obtenerImagenesPorReactivo,
};
