const pool = require('../../../db/connection');

const registrarResultado = async ({
    usuario_id,
    tipo_subtipo,
    voz_usuario_url
}) => {
    const query = `
        INSERT INTO Resultados_Lectura_Palabras_Normales
        (usuario_id, tipo_subtipo, voz_usuario_url)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [usuario_id, tipo_subtipo, voz_usuario_url];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obtenerResultadosPorUsuario = async (usuario_id) => {
    const query = 'SELECT * FROM Resultados_Lectura_Palabras_Normales WHERE usuario_id = $1';
    const result = await pool.query(query, [usuario_id]);
    return result.rows;
};

module.exports = {
    registrarResultado,
    obtenerResultadosPorUsuario,
};
