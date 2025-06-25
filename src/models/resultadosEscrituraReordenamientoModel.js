const pool = require('../db/connection');

const registrarResultado = async ({
    usuario_id,
    tipo_subtipo,
    tiempo_inicio_reactivo,
    tiempo_terminar_reactivo,
    palabra_del_usuario
}) => {
    const query = `
        INSERT INTO Resultados_Escritura_Reordenamiento
        (usuario_id, tipo_subtipo, tiempo_inicio_reactivo, tiempo_terminar_reactivo, palabra_del_usuario)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [usuario_id, tipo_subtipo, tiempo_inicio_reactivo, tiempo_terminar_reactivo, palabra_del_usuario];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obtenerResultadosPorUsuario = async (usuario_id) => {
    const query = 'SELECT * FROM Resultados_Escritura_Reordenamiento WHERE usuario_id = $1';
    const result = await pool.query(query, [usuario_id]);
    return result.rows;
};

const obtenerResultadosConUsuario = async (usuario_id) => {
    const query = `
        SELECT 
            r.*,
            u.nombre,
            u.correo,
            u.tipo
        FROM Resultados_Escritura_Reordenamiento r
        JOIN Usuario u ON r.usuario_id = u.usuario_id
        WHERE r.usuario_id = $1
        ORDER BY r.resultado_reactivo_id DESC
    `;
    const result = await pool.query(query, [usuario_id]);
    return result.rows;
};

module.exports = {
    registrarResultado,
    obtenerResultadosPorUsuario,
    obtenerResultadosConUsuario,
};
