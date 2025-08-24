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
const verificarEsDoctor = async (usuario_id) => {
    const query = `
        SELECT tipo FROM usuarios 
        WHERE usuario_id = $1 AND tipo = 'Doctor'
    `;
    const result = await pool.query(query, [usuario_id]);
    return result.rows.length > 0;
};

// Verificar que el usuario sea paciente
const verificarEsPaciente = async (usuario_id) => {
    const query = `
        SELECT tipo FROM usuarios 
        WHERE usuario_id = $1 AND tipo = 'Paciente'
    `;
    const result = await pool.query(query, [usuario_id]);
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
            u.usuario_id,
            u.nombre,
            u.correo,
            u.fecha_de_nacimiento,
            u.numero_telefono,
            u.sexo,
            u.escolaridad,
            u.domicilio,
            u.codigo_postal,
            u.imagen_url,
            dp.created_at as fecha_vinculacion
        FROM doctor_paciente dp
        INNER JOIN usuarios u ON dp.paciente_id = u.usuario_id
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
            u.usuario_id,
            u.nombre,
            u.correo,
            u.fecha_de_nacimiento,
            u.numero_telefono,
            u.sexo,
            u.especialidad,
            u.domicilio,
            u.codigo_postal,
            u.imagen_url,
            dp.created_at as fecha_vinculacion
        FROM doctor_paciente dp
        INNER JOIN usuarios u ON dp.doctor_id = u.usuario_id
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
            dp.created_at as fecha_vinculacion,
            d.nombre as doctor_nombre,
            d.especialidad,
            p.nombre as paciente_nombre,
            p.escolaridad
        FROM doctor_paciente dp
        INNER JOIN usuarios d ON dp.doctor_id = d.usuario_id
        INNER JOIN usuarios p ON dp.paciente_id = p.usuario_id
        ORDER BY dp.created_at DESC
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