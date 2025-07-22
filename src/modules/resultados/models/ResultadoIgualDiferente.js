const pool = require('../../../db/connection');

const registrarResultado = async ({
    usuario_id,
    tiempo_inicio_reactivo,
    tiempo_terminar_reactivo,
    tipo_subtipo,
    es_correcto
}) => {
    const query = `
        INSERT INTO Resultados_Igual_Diferente
        (usuario_id, tiempo_inicio_reactivo, tiempo_terminar_reactivo, tipo_subtipo, es_correcto)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [usuario_id, tiempo_inicio_reactivo, tiempo_terminar_reactivo, tipo_subtipo, es_correcto];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obtenerResultadosPorUsuario = async (usuario_id) => {
    const result = await pool.query('SELECT * FROM Resultados_Igual_Diferente WHERE usuario_id = $1', [usuario_id]);
    return result.rows;
};

module.exports = {
    registrarResultado,
    obtenerResultadosPorUsuario,
};
