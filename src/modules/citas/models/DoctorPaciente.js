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

// Verificar que el usuario existe y no es doctor
const verificarUsuarioValido = async (usuario_id) => {
    const query = `
        SELECT usuario_id, tipo FROM usuario 
        WHERE usuario_id = $1
    `;
    const result = await pool.query(query, [usuario_id]);
    if (result.rows.length === 0) {
        return { existe: false, tipo: null };
    }
    return { existe: true, tipo: result.rows[0].tipo };
};

// Obtener o crear paciente a partir de usuario_id
const obtenerOCrearPaciente = async (usuario_id) => {
    // Primero verificar si ya existe un paciente para este usuario
    const queryExistente = `
        SELECT paciente_id FROM Paciente WHERE usuario_ID = $1
    `;
    const resultExistente = await pool.query(queryExistente, [usuario_id]);

    if (resultExistente.rows.length > 0) {
        return resultExistente.rows[0].paciente_id;
    }

    // Si no existe, obtener datos de usuario para domicilio y código_postal
    const queryUsuario = `SELECT domicilio, codigo_postal FROM usuario WHERE usuario_id = $1`;
    const resultUsuario = await pool.query(queryUsuario, [usuario_id]);
    let domicilio = 'N/A';
    let codigo_postal = '00000';
    if (resultUsuario.rows.length > 0) {
        domicilio = resultUsuario.rows[0].domicilio || 'N/A';
        codigo_postal = resultUsuario.rows[0].codigo_postal || '00000';
    }
    const queryCrear = `
        INSERT INTO paciente (usuario_ID, escolaridad, domicilio, codigo_postal)
        VALUES ($1, 'N/A', $2, $3)
        RETURNING paciente_id
    `;
    const resultCrear = await pool.query(queryCrear, [usuario_id, domicilio, codigo_postal]);

    // Actualizar el tipo de usuario a 'Paciente'
    const queryActualizarUsuario = `
        UPDATE usuario 
        SET tipo = 'Paciente' 
        WHERE usuario_id = $1
    `;
    await pool.query(queryActualizarUsuario, [usuario_id]);

    return resultCrear.rows[0].paciente_id;
};

// Nueva función: Vincula un doctor con un usuario (creando paciente si es necesario) o paciente existente
const vincularDoctorConUsuarioOPaciente = async (doctor_id, id_vinculacion, tipo_vinculacion = 'usuario') => {
    // Verificar que el doctor existe y es doctor
    const esDoctor = await verificarEsDoctor(doctor_id);
    if (!esDoctor) {
        throw new Error('El ID proporcionado no corresponde a un doctor válido');
    }

    let paciente_id;

    if (tipo_vinculacion === 'usuario') {
        // Caso 1: Vincular con usuario_id (crear paciente si es necesario)
        const usuarioInfo = await verificarUsuarioValido(id_vinculacion);

        if (!usuarioInfo.existe) {
            throw new Error('El usuario especificado no existe');
        }

        if (usuarioInfo.tipo === 'Doctor') {
            throw new Error('No se puede vincular un doctor como paciente');
        }

        // Obtener o crear el paciente
        paciente_id = await obtenerOCrearPaciente(id_vinculacion);

    } else if (tipo_vinculacion === 'paciente') {
        // Caso 2: Vincular con paciente_id existente
        const esPaciente = await verificarEsPaciente(id_vinculacion);
        if (!esPaciente) {
            throw new Error('El ID proporcionado no corresponde a un paciente válido');
        }
        paciente_id = id_vinculacion;
    } else {
        throw new Error('Tipo de vinculación no válido. Use "usuario" o "paciente"');
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

    return {
        vinculacion: result.rows[0],
        paciente_id: paciente_id,
        fue_creado_paciente: tipo_vinculacion === 'usuario'
    };
};

// Verificar que el usuario sea paciente (función original para compatibilidad)
const verificarEsPaciente = async (paciente_id) => {
    const query = `
        SELECT p.paciente_id FROM Paciente p
        INNER JOIN usuario u ON p.usuario_ID = u.usuario_id
        WHERE p.paciente_id = $1 AND u.tipo = 'Paciente'
    `;
    const result = await pool.query(query, [paciente_id]);
    return result.rows.length > 0;
};

// Función original para compatibilidad con código existente
const vincularPacienteConDoctor = async (doctor_id, paciente_id) => {
    const resultado = await vincularDoctorConUsuarioOPaciente(doctor_id, paciente_id, 'paciente');
    return resultado.vinculacion;
};

// Obtener todos los pacientes de un doctor
const obtenerPacientesDeDoctor = async (doctor_id) => {
    console.log('--- [obtenerPacientesDeDoctor] doctor_id:', doctor_id);
    const query = `
        SELECT 
            p.paciente_id,
            u.usuario_id,
            u.nombre,
            u.correo,
            u.fecha_de_nacimiento,
            u.numero_telefono,
            u.sexo,
            CASE WHEN p.escolaridad IS NULL OR p.escolaridad = '' THEN NULL ELSE p.escolaridad END AS escolaridad,
            p.domicilio,
            p.codigo_postal,
            u.imagen_url
        FROM doctor_paciente dp
        INNER JOIN paciente p ON dp.paciente_id = p.paciente_id
        INNER JOIN usuario u ON p.usuario_ID = u.usuario_id
        WHERE dp.doctor_id = $1
        ORDER BY u.nombre ASC
    `;
    try {
        const result = await pool.query(query, [doctor_id]);
        console.log('--- [obtenerPacientesDeDoctor] result:', result.rows);
        return result.rows;
    } catch (error) {
        console.error('--- [obtenerPacientesDeDoctor] ERROR:', error);
        throw error;
    }
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

    // Eliminar la vinculación
    const query = `
        DELETE FROM doctor_paciente 
        WHERE doctor_id = $1 AND paciente_id = $2
        RETURNING *;
    `;
    const result = await pool.query(query, [doctor_id, paciente_id]);

    // Actualizar Paciente: is_active = FALSE
    await pool.query('UPDATE "paciente" SET is_active = FALSE WHERE paciente_id = $1', [paciente_id]);

    // Obtener usuario_id relacionado al paciente
    const usuarioRes = await pool.query('SELECT usuario_ID FROM "paciente" WHERE paciente_id = $1', [paciente_id]);
    if (usuarioRes.rows.length > 0) {
        const usuario_id = usuarioRes.rows[0].usuario_id;
        // Cambiar tipo en usuario a 'Usuario'
        await pool.query('UPDATE usuario SET tipo = $1 WHERE usuario_id = $2', ['Usuario', usuario_id]);
    }

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
        INNER JOIN usuario pu ON p.usuario_ID = pu.usuario_id
        ORDER BY du.nombre ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

module.exports = {
    vincularPacienteConDoctor,
    vincularDoctorConUsuarioOPaciente, // Nueva función principal
    obtenerPacientesDeDoctor,
    obtenerDoctoresDePaciente,
    desvincularDoctorPaciente,
    obtenerTodasLasVinculaciones,
    existeVinculacion,
    verificarEsDoctor,
    verificarEsPaciente
};