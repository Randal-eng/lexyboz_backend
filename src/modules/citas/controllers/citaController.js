const citaModel = require('../models/Cita');

// Crear cita
const crearCita = async (req, res) => {
    try {
        const { doctor_id, paciente_id, fecha_cita, estado } = req.body;
        if (!doctor_id || !paciente_id || !fecha_cita || !estado) {
            return res.status(400).json({ message: 'doctor_id, paciente_id, fecha_cita y estado son requeridos.' });
        }
        const nuevaCita = await citaModel.crearCita({ doctor_id, paciente_id, fecha_cita, estado });
        return res.status(201).json(nuevaCita);
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
    editarCita,
    eliminarCita,
};
