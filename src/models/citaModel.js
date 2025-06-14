const Joi = require('joi');
const pool = require('../db/connection');

const ESTADOS_VALIDOS = ['Programada', 'Completada', 'Cancelada', 'Reprogramada'];

const validarEstado = (estado) => {
    if (!ESTADOS_VALIDOS.includes(estado)) {
        throw new Error(`Estado inválido. Debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
    }
};

const citaSchema = Joi.object({
    doctor_id: Joi.number().integer().required(),
    paciente_id: Joi.number().integer().required(),
    fecha_cita: Joi.date().iso().required(),
    estado: Joi.string().valid('Programada', 'Completada', 'Cancelada', 'Reprogramada').required()
});

const validateCita = (cita) => {
    const { error } = citaSchema.validate(cita);
    if (error) {
        throw new Error(`Error de validación: ${error.details[0].message}`);
    }
};

// Crear una cita
const crearCita = async ({ doctor_id, paciente_id, fecha_cita, estado }) => {
    validateCita({ doctor_id, paciente_id, fecha_cita, estado });
    validarEstado(estado);
    const query = `
        INSERT INTO Citas (doctor_id, paciente_id, fecha_cita, estado)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [doctor_id, paciente_id, fecha_cita, estado];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Consultar todas las citas (opcional: filtrar por doctor o paciente)
const obtenerCitas = async (filtro = {}) => {
    let query = 'SELECT * FROM Citas';
    const values = [];
    const conditions = [];
    if (filtro.doctor_id) {
        values.push(filtro.doctor_id);
        conditions.push(`doctor_id = $${values.length}`);
    }
    if (filtro.paciente_id) {
        values.push(filtro.paciente_id);
        conditions.push(`paciente_id = $${values.length}`);
    }
    if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY fecha_cita DESC';
    const result = await pool.query(query, values);
    return result.rows;
};

// Consultar una cita por ID
const obtenerCitaPorId = async (cita_id) => {
    const query = 'SELECT * FROM Citas WHERE cita_id = $1';
    const result = await pool.query(query, [cita_id]);
    return result.rows[0];
};

// Editar una cita
const editarCita = async (cita_id, { doctor_id, paciente_id, fecha_cita, estado }) => {
    validateCita({ doctor_id, paciente_id, fecha_cita, estado });
    validarEstado(estado);
    const query = `
        UPDATE Citas
        SET doctor_id = $1, paciente_id = $2, fecha_cita = $3, estado = $4
        WHERE cita_id = $5
        RETURNING *;
    `;
    const values = [doctor_id, paciente_id, fecha_cita, estado, cita_id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Eliminar una cita
const eliminarCita = async (cita_id) => {
    const query = 'DELETE FROM Citas WHERE cita_id = $1 RETURNING *;';
    const result = await pool.query(query, [cita_id]);
    return result.rows[0];
};

module.exports = {
    crearCita,
    obtenerCitas,
    obtenerCitaPorId,
    editarCita,
    eliminarCita,
};
