const solicitudVinculacionModel = require('../models/SolicitudVinculacion');

// Usuario envía solicitud a doctor
const enviarSolicitud = async (req, res) => {
    try {
        const { doctor_id, mensaje } = req.body;
        const usuario_id = req.user?.id; // El JWT tiene 'id', no 'usuario_id'

        if (!doctor_id) {
            return res.status(400).json({ 
                message: 'doctor_id es requerido.' 
            });
        }

        if (!usuario_id) {
            return res.status(401).json({ 
                message: 'Usuario no autenticado.' 
            });
        }

        const resultado = await solicitudVinculacionModel.enviarSolicitud(
            usuario_id, 
            doctor_id, 
            mensaje
        );

        return res.status(201).json({
            message: `Solicitud enviada exitosamente al Dr. ${resultado.doctor_nombre}`,
            solicitud: resultado.solicitud
        });

    } catch (error) {
        return res.status(400).json({ 
            message: 'Error al enviar solicitud.', 
            error: error.message 
        });
    }
};

// Doctor obtiene sus solicitudes pendientes
const obtenerSolicitudesPendientes = async (req, res) => {
    try {
        const { doctor_id } = req.params;

        if (!doctor_id) {
            return res.status(400).json({ 
                message: 'doctor_id es requerido.' 
            });
        }

        const solicitudes = await solicitudVinculacionModel.obtenerSolicitudesParaDoctor(doctor_id);

        return res.status(200).json({
            message: 'Solicitudes obtenidas exitosamente.',
            solicitudes,
            total: solicitudes.length
        });

    } catch (error) {
        return res.status(500).json({ 
            message: 'Error al obtener solicitudes pendientes.', 
            error: error.message 
        });
    }
};

// Usuario obtiene sus solicitudes enviadas
const obtenerMisSolicitudes = async (req, res) => {
    try {
        const usuario_id = req.user?.id; // El JWT tiene 'id', no 'usuario_id'

        if (!usuario_id) {
            return res.status(401).json({ 
                message: 'Usuario no autenticado.' 
            });
        }

        const solicitudes = await solicitudVinculacionModel.obtenerSolicitudesDeUsuario(usuario_id);

        return res.status(200).json({
            message: 'Solicitudes obtenidas exitosamente.',
            solicitudes,
            total: solicitudes.length
        });

    } catch (error) {
        return res.status(500).json({ 
            message: 'Error al obtener solicitudes del usuario.', 
            error: error.message 
        });
    }
};

// Doctor responde a una solicitud
const responderSolicitud = async (req, res) => {
    try {
        const { solicitud_id } = req.params;
        const { respuesta } = req.body; // 'aceptada' o 'rechazada'
        const usuario_id = req.user?.id; // ID del usuario autenticado
        const respondido_por = req.user?.id; // El JWT tiene 'id', no 'usuario_id'

        if (!solicitud_id || !respuesta) {
            return res.status(400).json({ 
                message: 'solicitud_id y respuesta son requeridos.' 
            });
        }

        if (!['aceptada', 'rechazada'].includes(respuesta)) {
            return res.status(400).json({ 
                message: 'La respuesta debe ser "aceptada" o "rechazada".' 
            });
        }

        if (!usuario_id) {
            return res.status(401).json({ 
                message: 'Usuario no autenticado.' 
            });
        }

        // Obtener el doctor_id desde la tabla doctor usando el usuario_id
        const pool = require('../../../db/connection');
        const doctorQuery = await pool.query(
            'SELECT doctor_id FROM doctor WHERE usuario_id = $1',
            [usuario_id]
        );

        if (doctorQuery.rows.length === 0) {
            return res.status(403).json({ 
                message: 'Solo los doctores pueden responder solicitudes.' 
            });
        }

        const doctor_id = doctorQuery.rows[0].doctor_id;

        const resultado = await solicitudVinculacionModel.responderSolicitud(
            solicitud_id, 
            doctor_id, 
            respuesta, 
            respondido_por
        );

        const mensaje = respuesta === 'aceptada' 
            ? `Solicitud aceptada. ${resultado.usuario_nombre} es ahora tu paciente.`
            : `Solicitud de ${resultado.usuario_nombre} ha sido rechazada.`;

        return res.status(200).json({
            message: mensaje,
            solicitud: resultado.solicitud,
            vinculacion: resultado.vinculacion || null
        });

    } catch (error) {
        return res.status(400).json({ 
            message: 'Error al responder solicitud.', 
            error: error.message 
        });
    }
};

// Obtener estadísticas de solicitudes para dashboard del doctor
const obtenerEstadisticas = async (req, res) => {
    try {
        const { doctor_id } = req.params;

        if (!doctor_id) {
            return res.status(400).json({ 
                message: 'doctor_id es requerido.' 
            });
        }

        const estadisticas = await solicitudVinculacionModel.obtenerEstadisticasSolicitudes(doctor_id);

        return res.status(200).json({
            message: 'Estadísticas obtenidas exitosamente.',
            estadisticas
        });

    } catch (error) {
        return res.status(500).json({ 
            message: 'Error al obtener estadísticas.', 
            error: error.message 
        });
    }
};

module.exports = {
    enviarSolicitud,
    obtenerSolicitudesPendientes,
    obtenerMisSolicitudes,
    responderSolicitud,
    obtenerEstadisticas
};
