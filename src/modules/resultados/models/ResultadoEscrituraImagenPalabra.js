const pool = require('../db/connection');

const registrarResultado = async ({
    usuario_id,
    tipo_subtipo,
    tiempo_inicio_reactivo,
    tiempo_terminar_reactivo,
    palabra_formada
}) => {
    const query = `
        INSERT INTO Resultados_Escritura_Imagen_Palabra
        (usuario_id, tipo_subtipo, tiempo_inicio_reactivo, tiempo_terminar_reactivo, palabra_formada)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [usuario_id, tipo_subtipo, tiempo_inicio_reactivo, tiempo_terminar_reactivo, palabra_formada];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obtenerResultadosPorUsuario = async (usuario_id) => {
    const query = 'SELECT * FROM Resultados_Escritura_Imagen_Palabra WHERE usuario_id = $1';
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
        FROM Resultados_Escritura_Imagen_Palabra r
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
