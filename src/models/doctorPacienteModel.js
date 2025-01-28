const pool = require('../db/connection');

const vincularPacienteConDoctor = async (doctor_id, paciente_id) => {
    const query = `
        INSERT INTO Doctor_Paciente (doctor_ID, paciente_ID)
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