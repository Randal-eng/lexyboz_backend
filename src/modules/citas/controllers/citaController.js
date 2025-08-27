const citaModel = require('../models/Cita');
// Agendar cita con validaciones de vinculación y fecha
const agendarCita = async (req, res) => {
    try {
        const { doctor_id, paciente_id, fecha_cita } = req.body;

        if (!doctor_id || !paciente_id || !fecha_cita) {
            return res.status(400).json({ message: 'doctor_id, paciente_id y fecha_cita son requeridos.' });
        }

        if (new Date(fecha_cita) <= new Date()) {
            return res.status(400).json({ message: 'La fecha de la cita debe ser futura.' });
        }

        // Validar vinculación doctor-paciente
        const pool = require('../../../db/connection');
        const vinculado = await pool.query(
            'SELECT 1 FROM doctor_paciente WHERE doctor_id = $1 AND paciente_id = $2',
            [doctor_id, paciente_id]
        );
        if (vinculado.rows.length === 0) {
            return res.status(400).json({ message: 'El paciente no está vinculado con el doctor.' });
        }

        // Crear la cita con estado Programada
        const cita = await citaModel.crearCita({ doctor_id, paciente_id, fecha_cita, estado: 'Programada' });
        return res.status(201).json({ message: 'Cita agendada exitosamente.', cita });
    } catch (error) {
        return res.status(500).json({ message: 'Error al agendar cita.', error: error.message });
    }
};

// Crear/agendar cita con validaciones inteligentes
const crearCita = async (req, res) => {
    try {
        const { doctor_id, paciente_id, fecha_cita, estado } = req.body;
        if (!doctor_id || !paciente_id || !fecha_cita) {
            return res.status(400).json({ message: 'doctor_id, paciente_id y fecha_cita son requeridos.' });
        }

        // Estado por defecto
        const estadoFinal = estado || 'Programada';

        // Si el estado es Programada, validar fecha futura y vinculación
        if (estadoFinal === 'Programada') {
            if (new Date(fecha_cita) <= new Date()) {
                return res.status(400).json({ message: 'La fecha de la cita debe ser futura.' });
            }
            // Validar vinculación doctor-paciente
            const pool = require('../../../db/connection');
            const vinculado = await pool.query(
                'SELECT 1 FROM doctor_paciente WHERE doctor_id = $1 AND paciente_id = $2',
                [doctor_id, paciente_id]
            );
            if (vinculado.rows.length === 0) {
                return res.status(400).json({ message: 'El paciente no está vinculado con el doctor.' });
            }
        }

        // Crear la cita
        const nuevaCita = await citaModel.crearCita({ doctor_id, paciente_id, fecha_cita, estado: estadoFinal });
        return res.status(201).json({ message: 'Cita creada exitosamente.', cita: nuevaCita });
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear la cita.', error: error.message });
    }
};

// Obtener todas las citas (opcional: filtrar por doctor o paciente)
const obtenerCitas = async (req, res) => {
    try {
        const filtro = {
            doctor_id: req.query.doctor_id,
            paciente_id: req.query.paciente_id,
        };
        const citas = await citaModel.obtenerCitas(filtro);
        return res.status(200).json(citas);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener las citas.', error: error.message });
    }
};

// Obtener una cita por ID
const obtenerCitaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const cita = await citaModel.obtenerCitaPorId(id);
        if (!cita) {
            return res.status(404).json({ message: 'Cita no encontrada.' });
        }
        return res.status(200).json(cita);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener la cita.', error: error.message });
    }
};

// Editar cita
const editarCita = async (req, res) => {
    try {
        const { id } = req.params;
        const { doctor_id, paciente_id, fecha_cita, estado } = req.body;
        const citaEditada = await citaModel.editarCita(id, { doctor_id, paciente_id, fecha_cita, estado });
        if (!citaEditada) {
            return res.status(404).json({ message: 'Cita no encontrada.' });
        }
        return res.status(200).json(citaEditada);
    } catch (error) {
        return res.status(500).json({ message: 'Error al editar la cita.', error: error.message });
    }
};

// Eliminar cita
const eliminarCita = async (req, res) => {
    try {
        const { id } = req.params;
        const citaEliminada = await citaModel.eliminarCita(id);
        if (!citaEliminada) {
            return res.status(404).json({ message: 'Cita no encontrada.' });
        }
        return res.status(200).json({ message: 'Cita eliminada.', cita: citaEliminada });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar la cita.', error: error.message });
    }
};

module.exports = {
    crearCita,
    obtenerCitas,
    obtenerCitaPorId,
    agendarCita,
    editarCita,
    eliminarCita,
};
