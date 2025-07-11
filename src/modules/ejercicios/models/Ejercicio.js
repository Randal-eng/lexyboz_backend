const pool = require('../db/connection');

// Crear ejercicio
const crearEjercicio = async ({ titulo, descripcion, tipo_ejercicio, creado_por }) => {
    const query = `
        INSERT INTO Ejercicios (titulo, descripcion, tipo_ejercicio, creado_por)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [titulo, descripcion, tipo_ejercicio, creado_por];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Obtener todos los ejercicios
const obtenerEjercicios = async () => {
    const result = await pool.query('SELECT * FROM Ejercicios ORDER BY ejercicio_id DESC');
    return result.rows;
};

// Obtener ejercicio por ID
const obtenerEjercicioPorId = async (ejercicio_id) => {
    const result = await pool.query('SELECT * FROM Ejercicios WHERE ejercicio_id = $1', [ejercicio_id]);
    return result.rows[0];
};

// Editar ejercicio
const editarEjercicio = async (ejercicio_id, { titulo, descripcion, tipo_ejercicio }) => {
    const query = `
        UPDATE Ejercicios SET titulo = $1, descripcion = $2, tipo_ejercicio = $3
        WHERE ejercicio_id = $4 RETURNING *;
    `;
    const values = [titulo, descripcion, tipo_ejercicio, ejercicio_id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Eliminar ejercicio
const eliminarEjercicio = async (ejercicio_id) => {
    const result = await pool.query('DELETE FROM Ejercicios WHERE ejercicio_id = $1 RETURNING *;', [ejercicio_id]);
    return result.rows[0];
};

module.exports = {
    crearEjercicio,
    obtenerEjercicios,
    obtenerEjercicioPorId,
    editarEjercicio,
    eliminarEjercicio,
};
