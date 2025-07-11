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

module.exports = {
    vincularDoctorPaciente,
};
