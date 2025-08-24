const pool = require('../../../db/connection');

// Verificar si ya existe la vinculación entre doctor y paciente
const existeVinculacion = async (doctor_id, paciente_id) => {
    const query = `
        SELECT * FROM doctor_paciente 
        WHERE doctor_id = $1 AND paciente_id = $2
    `;
    const result = await pool.query(query, [doctor_id, paciente_id]);
    return result.rows.length > 0;
};

// Verificar que el usuario sea doctor
const verificarEsDoctor = async (doctor_id) => {
    const query = `
        SELECT d.doctor_id FROM doctor d
        INNER JOIN usuario u ON d.usuario_id = u.usuario_id
        WHERE d.doctor_id = $1 AND u.tipo = 'Doctor'
    `;
    const result = await pool.query(query, [doctor_id]);
    return result.rows.length > 0;
};

// Verificar que el usuario sea paciente
const verificarEsPaciente = async (paciente_id) => {
    const query = `
        SELECT p.paciente_id FROM paciente p
        INNER JOIN usuario u ON p.usuario_id = u.usuario_id
        WHERE p.paciente_id = $1 AND u.tipo = 'Paciente'
    `;
    const result = await pool.query(query, [paciente_id]);
    return result.rows.length > 0;
};

// Vincula un doctor con un paciente
const vincularPacienteConDoctor = async (doctor_id, paciente_id) => {
    // Verificar que el doctor existe y es doctor
    const esDoctor = await verificarEsDoctor(doctor_id);
    if (!esDoctor) {
        throw new Error('El ID proporcionado no corresponde a un doctor válido');
    }

    // Verificar que el paciente existe y es paciente
    const esPaciente = await verificarEsPaciente(paciente_id);
    if (!esPaciente) {
        throw new Error('El ID proporcionado no corresponde a un paciente válido');
    }

    // Verificar si ya existe la vinculación
    const yaVinculado = await existeVinculacion(doctor_id, paciente_id);
    if (yaVinculado) {
        throw new Error('El doctor y paciente ya están vinculados');
    }

    const query = `
        INSERT INTO doctor_paciente (doctor_id, paciente_id)
        VALUES ($1, $2)
        RETURNING *;
    `;
    const values = [doctor_id, paciente_id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Obtener todos los pacientes de un doctor
const obtenerPacientesDeDoctor = async (doctor_id) => {
    const query = `
        SELECT 
            p.paciente_id,
            u.usuario_id,
            u.nombre,
            u.correo,
            u.fecha_de_nacimiento,
            u.numero_telefono,
            u.sexo,
            p.escolaridad,
            p.domicilio,
            p.codigo_postal,
            u.imagen_url
        FROM doctor_paciente dp
        INNER JOIN paciente p ON dp.paciente_id = p.paciente_id
        INNER JOIN usuario u ON p.usuario_id = u.usuario_id
        WHERE dp.doctor_id = $1
        ORDER BY u.nombre ASC
    `;
    const result = await pool.query(query, [doctor_id]);
    return result.rows;
};

// Obtener todos los doctores de un paciente
const obtenerDoctoresDePaciente = async (paciente_id) => {
    const query = `
        SELECT 
            d.doctor_id,
            u.usuario_id,
            u.nombre,
            u.correo,
            u.fecha_de_nacimiento,
            u.numero_telefono,
            u.sexo,
            d.especialidad,
            d.domicilio,
            d.codigo_postal,
            u.imagen_url
        FROM doctor_paciente dp
        INNER JOIN doctor d ON dp.doctor_id = d.doctor_id
        INNER JOIN usuario u ON d.usuario_id = u.usuario_id
        WHERE dp.paciente_id = $1
        ORDER BY u.nombre ASC
    `;
    const result = await pool.query(query, [paciente_id]);
    return result.rows;
};

// Desvincular doctor y paciente
const desvincularDoctorPaciente = async (doctor_id, paciente_id) => {
    // Verificar si existe la vinculación
    const yaVinculado = await existeVinculacion(doctor_id, paciente_id);
    if (!yaVinculado) {
        throw new Error('No existe vinculación entre el doctor y paciente especificados');
    }

    const query = `
        DELETE FROM doctor_paciente 
        WHERE doctor_id = $1 AND paciente_id = $2
        RETURNING *;
    `;
    const result = await pool.query(query, [doctor_id, paciente_id]);
    return result.rows[0];
};

// Obtener todas las vinculaciones
const obtenerTodasLasVinculaciones = async () => {
    const query = `
        SELECT 
            dp.doctor_id,
            dp.paciente_id,
            du.nombre as doctor_nombre,
            d.especialidad,
            pu.nombre as paciente_nombre,
            p.escolaridad
        FROM doctor_paciente dp
        INNER JOIN doctor d ON dp.doctor_id = d.doctor_id
        INNER JOIN usuario du ON d.usuario_id = du.usuario_id
        INNER JOIN paciente p ON dp.paciente_id = p.paciente_id
        INNER JOIN usuario pu ON p.usuario_id = pu.usuario_id
        ORDER BY du.nombre ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

module.exports = {
    vincularPacienteConDoctor,
    obtenerPacientesDeDoctor,
    obtenerDoctoresDePaciente,
    desvincularDoctorPaciente,
    obtenerTodasLasVinculaciones,
    existeVinculacion,
    verificarEsDoctor,
    verificarEsPaciente
};