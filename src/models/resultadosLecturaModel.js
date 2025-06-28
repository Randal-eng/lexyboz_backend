const pool = require('../db/connection');

const registrarResultado = async ({
    usuario_id,
    tipo_subtipo,
    tiempo_inicio_reactivo,
    tiempo_terminar_reactivo,
    voz_usuario_url
}) => {
    const query = `
        INSERT INTO Resultados_Lectura
        (usuario_id, tipo_subtipo, tiempo_inicio_reactivo, tiempo_terminar_reactivo, voz_usuario_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [usuario_id, tipo_subtipo, tiempo_inicio_reactivo, tiempo_terminar_reactivo, voz_usuario_url];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obtenerResultadosPorUsuario = async (usuario_id) => {
    const query = 'SELECT * FROM Resultados_Lectura WHERE usuario_id = $1';
    const result = await pool.query(query, [usuario_id]);
    return result.rows;
};

module.exports = {
    registrarResultado,
    obtenerResultadosPorUsuario,
};
