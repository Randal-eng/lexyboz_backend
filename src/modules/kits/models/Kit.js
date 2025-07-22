const pool = require('../../../db/connection');

// Crear kit
const crearKit = async ({ nombre, descripcion, creado_por }) => {
    const query = `
        INSERT INTO Kits (nombre, descripcion, creado_por)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [nombre, descripcion, creado_por];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Obtener todos los kits
const obtenerKits = async () => {
    const result = await pool.query('SELECT * FROM Kits ORDER BY fecha_creacion DESC');
    return result.rows;
};

// Obtener kit por ID
const obtenerKitPorId = async (kit_id) => {
    const result = await pool.query('SELECT * FROM Kits WHERE kit_id = $1', [kit_id]);
    return result.rows[0];
};

// Editar kit
const editarKit = async (kit_id, { nombre, descripcion }) => {
    const query = `
        UPDATE Kits SET nombre = $1, descripcion = $2
        WHERE kit_id = $3 RETURNING *;
    `;
    const values = [nombre, descripcion, kit_id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Eliminar kit
const eliminarKit = async (kit_id) => {
    const result = await pool.query('DELETE FROM Kits WHERE kit_id = $1 RETURNING *;', [kit_id]);
    return result.rows[0];
};

module.exports = {
    crearKit,
    obtenerKits,
    obtenerKitPorId,
    editarKit,
    eliminarKit,
};
