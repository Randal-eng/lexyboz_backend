const pool = require('../db/connection');

// Asociar ejercicio a kit
const agregarEjercicioAKit = async (ejercicio_id, kit_id) => {
    const query = `
        INSERT INTO Ejercicios_Kits (ejercicio_id, kit_id)
        VALUES ($1, $2)
        RETURNING *;
    `;
    const result = await pool.query(query, [ejercicio_id, kit_id]);
    return result.rows[0];
};

// Eliminar asociación
const eliminarEjercicioDeKit = async (ejercicio_id, kit_id) => {
    const query = `
        DELETE FROM Ejercicios_Kits
        WHERE ejercicio_id = $1 AND kit_id = $2
        RETURNING *;
    `;
    const result = await pool.query(query, [ejercicio_id, kit_id]);
    return result.rows[0];
};

// Obtener ejercicios de un kit
const obtenerEjerciciosPorKit = async (kit_id) => {
    const query = `
        SELECT e.*
        FROM Ejercicios_Kits ek
        JOIN Ejercicios e ON ek.ejercicio_id = e.ejercicio_id
        WHERE ek.kit_id = $1;
    `;
    const result = await pool.query(query, [kit_id]);
    return result.rows;
};

module.exports = {
    agregarEjercicioAKit,
    eliminarEjercicioDeKit,
    obtenerEjerciciosPorKit,
};
