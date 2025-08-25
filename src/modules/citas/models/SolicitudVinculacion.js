const pool = require('../../../db/connection');

// Enviar solicitud de usuario a doctor
const enviarSolicitud = async (usuario_id, doctor_id, mensaje = null) => {
    // Verificar que el usuario no sea ya paciente de este doctor
    const queryVerificarVinculo = `
        SELECT * FROM doctor_paciente dp
        INNER JOIN Paciente p ON dp.paciente_id = p.paciente_id
        WHERE p.usuario_ID = $1 AND dp.doctor_id = $2
    `;
    const resultVinculo = await pool.query(queryVerificarVinculo, [usuario_id, doctor_id]);
    
    if (resultVinculo.rows.length > 0) {
        throw new Error('Ya eres paciente de este doctor');
    }

    // Verificar que no haya una solicitud pendiente
    const queryVerificarSolicitud = `
        SELECT * FROM solicitud_vinculacion 
        WHERE usuario_id = $1 AND doctor_id = $2 AND estado = 'pendiente'
    `;
    const resultSolicitud = await pool.query(queryVerificarSolicitud, [usuario_id, doctor_id]);
    
    if (resultSolicitud.rows.length > 0) {
        throw new Error('Ya tienes una solicitud pendiente con este doctor');
    }

    // Verificar que el doctor existe
    const queryVerificarDoctor = `
        SELECT d.doctor_id, u.nombre as doctor_nombre 
        FROM doctor d 
        INNER JOIN usuario u ON d.usuario_id = u.usuario_id 
        WHERE d.doctor_id = $1
    `;
    const resultDoctor = await pool.query(queryVerificarDoctor, [doctor_id]);
    
    if (resultDoctor.rows.length === 0) {
        throw new Error('El doctor especificado no existe');
    }

    // Verificar que el usuario existe y no es doctor
    const queryVerificarUsuario = `
        SELECT usuario_id, nombre, tipo 
        FROM usuario 
        WHERE usuario_id = $1
    `;
    const resultUsuario = await pool.query(queryVerificarUsuario, [usuario_id]);
    
    if (resultUsuario.rows.length === 0) {
        throw new Error('El usuario especificado no existe');
    }
    
    if (resultUsuario.rows[0].tipo === 'Doctor') {
        throw new Error('Los doctores no pueden enviar solicitudes para ser pacientes');
    }

    // Crear la solicitud
    const query = `
        INSERT INTO solicitud_vinculacion (usuario_id, doctor_id, mensaje)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const result = await pool.query(query, [usuario_id, doctor_id, mensaje]);
    
    return {
        solicitud: result.rows[0],
        doctor_nombre: resultDoctor.rows[0].doctor_nombre,
        usuario_nombre: resultUsuario.rows[0].nombre
    };
};

// Obtener solicitudes recibidas por un doctor (pendientes de respuesta)
const obtenerSolicitudesParaDoctor = async (doctor_id) => {
    const query = `
        SELECT 
            s.id,
            s.usuario_id,
            s.mensaje,
            s.fecha_solicitud,
            u.nombre as usuario_nombre,
            u.correo as usuario_correo,
            u.imagen_url as usuario_imagen
        FROM solicitud_vinculacion s
        INNER JOIN usuario u ON s.usuario_id = u.usuario_id
        WHERE s.doctor_id = $1 AND s.estado = 'pendiente'
        ORDER BY s.fecha_solicitud DESC
    `;
    const result = await pool.query(query, [doctor_id]);
    return result.rows;
};

// Obtener solicitudes enviadas por un usuario
const obtenerSolicitudesDeUsuario = async (usuario_id) => {
    const query = `
        SELECT 
            s.id,
            s.doctor_id,
            s.mensaje,
            s.estado,
            s.fecha_solicitud,
            s.fecha_respuesta,
            u.nombre as doctor_nombre,
            d.especialidad as doctor_especialidad
        FROM solicitud_vinculacion s
        INNER JOIN doctor d ON s.doctor_id = d.doctor_id
        INNER JOIN usuario u ON d.usuario_id = u.usuario_id
        WHERE s.usuario_id = $1
        ORDER BY s.fecha_solicitud DESC
    `;
    const result = await pool.query(query, [usuario_id]);
    return result.rows;
};

// Responder a una solicitud (aceptar/rechazar)
const responderSolicitud = async (solicitud_id, doctor_id, respuesta, respondido_por) => {
    if (!['aceptada', 'rechazada'].includes(respuesta)) {
        throw new Error('La respuesta debe ser "aceptada" o "rechazada"');
    }

    // Verificar que la solicitud existe y le pertenece al doctor
    const queryVerificar = `
        SELECT s.*, u.nombre as usuario_nombre 
        FROM solicitud_vinculacion s
        INNER JOIN usuario u ON s.usuario_id = u.usuario_id
        WHERE s.id = $1 AND s.doctor_id = $2 AND s.estado = 'pendiente'
    `;
    const resultVerificar = await pool.query(queryVerificar, [solicitud_id, doctor_id]);
    
    if (resultVerificar.rows.length === 0) {
        throw new Error('Solicitud no encontrada o ya fue respondida');
    }

    const solicitud = resultVerificar.rows[0];

    // Actualizar el estado de la solicitud
    const queryActualizar = `
        UPDATE solicitud_vinculacion 
        SET estado = $1, fecha_respuesta = NOW(), respondido_por = $2
        WHERE id = $3
        RETURNING *
    `;
    const resultActualizar = await pool.query(queryActualizar, [respuesta, respondido_por, solicitud_id]);

    // Si fue aceptada, crear la vinculación automáticamente
    if (respuesta === 'aceptada') {
        const doctorPacienteModel = require('./DoctorPaciente');
        try {
            const vinculacion = await doctorPacienteModel.vincularDoctorConUsuarioOPaciente(
                doctor_id, 
                solicitud.usuario_id, 
                'usuario'
            );
            
            return {
                solicitud: resultActualizar.rows[0],
                vinculacion: vinculacion,
                usuario_nombre: solicitud.usuario_nombre
            };
        } catch (error) {
            // Si falla la vinculación, revertir el estado de la solicitud
            await pool.query(
                'UPDATE solicitud_vinculacion SET estado = $1, fecha_respuesta = NULL, respondido_por = NULL WHERE id = $2',
                ['pendiente', solicitud_id]
            );
            throw new Error(`Error al crear la vinculación: ${error.message}`);
        }
    }

    return {
        solicitud: resultActualizar.rows[0],
        usuario_nombre: solicitud.usuario_nombre
    };
};

// Obtener estadísticas de solicitudes para el doctor
const obtenerEstadisticasSolicitudes = async (doctor_id) => {
    const query = `
        SELECT 
            COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes,
            COUNT(*) FILTER (WHERE estado = 'aceptada') as aceptadas,
            COUNT(*) FILTER (WHERE estado = 'rechazada') as rechazadas,
            COUNT(*) as total
        FROM solicitud_vinculacion 
        WHERE doctor_id = $1
    `;
    const result = await pool.query(query, [doctor_id]);
    return result.rows[0];
};

module.exports = {
    enviarSolicitud,
    obtenerSolicitudesParaDoctor,
    obtenerSolicitudesDeUsuario,
    responderSolicitud,
    obtenerEstadisticasSolicitudes
};
