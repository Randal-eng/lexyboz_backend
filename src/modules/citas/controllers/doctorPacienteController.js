const doctorPacienteModel = require('../models/DoctorPaciente');

// Controlador para vincular doctor y paciente
const vincularDoctorPaciente = async (req, res) => {
    try {
        const { doctor_id, paciente_id } = req.body;
        if (!doctor_id || !paciente_id) {
            return res.status(400).json({ message: 'doctor_id y paciente_id son requeridos.' });
        }
        const vinculo = await doctorPacienteModel.vincularPacienteConDoctor(doctor_id, paciente_id);
        return res.status(201).json({ message: 'Vinculación exitosa.', vinculo });
    } catch (error) {
        return res.status(500).json({ message: 'Error al vincular doctor y paciente.', error: error.message });
    }
};

// Controlador para obtener pacientes de un doctor
const obtenerPacientesDeDoctor = async (req, res) => {
    try {
        const { doctor_id } = req.params;
        if (!doctor_id) {
            return res.status(400).json({ message: 'doctor_id es requerido.' });
        }
        const pacientes = await doctorPacienteModel.obtenerPacientesDeDoctor(doctor_id);
        return res.status(200).json({ 
            message: 'Pacientes obtenidos exitosamente.', 
            pacientes,
            total: pacientes.length 
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener pacientes del doctor.', error: error.message });
    }
};

// Controlador para obtener doctores de un paciente
const obtenerDoctoresDePaciente = async (req, res) => {
    try {
        const { paciente_id } = req.params;
        if (!paciente_id) {
            return res.status(400).json({ message: 'paciente_id es requerido.' });
        }
        const doctores = await doctorPacienteModel.obtenerDoctoresDePaciente(paciente_id);
        return res.status(200).json({ 
            message: 'Doctores obtenidos exitosamente.', 
            doctores,
            total: doctores.length 
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener doctores del paciente.', error: error.message });
    }
};

// Controlador para desvincular doctor y paciente
const desvincularDoctorPaciente = async (req, res) => {
    try {
        const { doctor_id, paciente_id } = req.body;
        if (!doctor_id || !paciente_id) {
            return res.status(400).json({ message: 'doctor_id y paciente_id son requeridos.' });
        }
        const vinculoEliminado = await doctorPacienteModel.desvincularDoctorPaciente(doctor_id, paciente_id);
        return res.status(200).json({ message: 'Desvinculación exitosa.', vinculoEliminado });
    } catch (error) {
        return res.status(500).json({ message: 'Error al desvincular doctor y paciente.', error: error.message });
    }
};

// Controlador para obtener todas las vinculaciones
const obtenerTodasLasVinculaciones = async (req, res) => {
    try {
        const vinculaciones = await doctorPacienteModel.obtenerTodasLasVinculaciones();
        return res.status(200).json({ 
            message: 'Vinculaciones obtenidas exitosamente.', 
            vinculaciones,
            total: vinculaciones.length 
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener vinculaciones.', error: error.message });
    }
};

module.exports = {
    vincularDoctorPaciente,
    obtenerPacientesDeDoctor,
    obtenerDoctoresDePaciente,
    desvincularDoctorPaciente,
    obtenerTodasLasVinculaciones,
};
