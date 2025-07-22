const pool = require('../../../db/connection');

// Asignar kit a paciente
const asignarKit = async ({ kit_id, paciente_id, estado }) => {
    const query = `
        INSERT INTO Kits_Asignados (kit_id, paciente_id, estado)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [kit_id, paciente_id, estado];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Obtener asignaciones (puedes filtrar por paciente o kit)
const obtenerAsignaciones = async (filtro = {}) => {
    let query = 'SELECT * FROM Kits_Asignados';
    const values = [];
    const conditions = [];
    if (filtro.kit_id) {
        values.push(filtro.kit_id);
        conditions.push(`kit_id = $${values.length}`);
    }
    if (filtro.paciente_id) {
        values.push(filtro.paciente_id);
        conditions.push(`paciente_id = $${values.length}`);
    }
    if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY fecha_asignacion DESC';
    const result = await pool.query(query, values);
    return result.rows;
};

// Editar estado de asignación
const editarEstadoAsignacion = async (asignacion_id, estado) => {
    const query = `
        UPDATE Kits_Asignados SET estado = $1
        WHERE asignacion_id = $2
        RETURNING *;
    `;
    const result = await pool.query(query, [estado, asignacion_id]);
    return result.rows[0];
};

// Eliminar asignación
const eliminarAsignacion = async (asignacion_id) => {
    const result = await pool.query('DELETE FROM Kits_Asignados WHERE asignacion_id = $1 RETURNING *;', [asignacion_id]);
    return result.rows[0];
};

module.exports = {
    asignarKit,
    obtenerAsignaciones,
    editarEstadoAsignacion,
    eliminarAsignacion,
};
