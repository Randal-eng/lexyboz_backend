const pool = require('../../../db/connection');

// Vincula un doctor con un paciente
const vincularPacienteConDoctor = async (doctor_id, paciente_id) => {
    const query = `
        INSERT INTO doctor_paciente (doctor_id, paciente_id)
        VALUES ($1, $2)
        RETURNING *;
    `;
    const values = [doctor_id, paciente_id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = {
    vincularPacienteConDoctor,
};