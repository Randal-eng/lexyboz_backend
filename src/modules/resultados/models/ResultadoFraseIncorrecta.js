const pool = require('../../../db/connection');

const registrarResultado = async ({
    usuario_id,
    tiempo_inicio_reactivo,
    tiempo_palabra_seleccionada,
    tipo_subtipo,
    palabra_seleccionada_de_oracion
}) => {
    const query = `
        INSERT INTO Resultados_Usuario_Escoger_Frase_Incorrecto
        (usuario_id, tiempo_inicio_reactivo, tiempo_palabra_seleccionada, tipo_subtipo, palabra_seleccionada_de_oracion)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [usuario_id, tiempo_inicio_reactivo, tiempo_palabra_seleccionada, tipo_subtipo, palabra_seleccionada_de_oracion];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const obtenerResultadosPorUsuario = async (usuario_id) => {
    const result = await pool.query('SELECT * FROM Resultados_Usuario_Escoger_Frase_Incorrecto WHERE usuario_id = $1', [usuario_id]);
    return result.rows;
};

module.exports = {
    registrarResultado,
    obtenerResultadosPorUsuario,
};
