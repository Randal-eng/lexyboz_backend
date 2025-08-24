const doctorPacienteModel = require('../models/DoctorPaciente');

// Controlador para vincular doctor y paciente (función original - mantener compatibilidad)
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

// Nuevo controlador: Vincular doctor con usuario (creando paciente) o paciente existente
const vincularDoctorConUsuario = async (req, res) => {
    try {
        const { doctor_id, usuario_id, paciente_id, tipo } = req.body;
        
        // Validar que se proporcione doctor_id
        if (!doctor_id) {
            return res.status(400).json({ message: 'doctor_id es requerido.' });
        }

        let id_vinculacion, tipo_vinculacion;

        // Determinar el tipo de vinculación
        if (usuario_id && !paciente_id) {
            // Caso 1: Vincular con usuario (crear paciente si es necesario)
            id_vinculacion = usuario_id;
            tipo_vinculacion = 'usuario';
        } else if (paciente_id && !usuario_id) {
            // Caso 2: Vincular con paciente existente
            id_vinculacion = paciente_id;
            tipo_vinculacion = 'paciente';
        } else if (tipo === 'usuario' && usuario_id) {
            // Caso 3: Especificar explícitamente que es usuario
            id_vinculacion = usuario_id;
            tipo_vinculacion = 'usuario';
        } else if (tipo === 'paciente' && paciente_id) {
            // Caso 4: Especificar explícitamente que es paciente
            id_vinculacion = paciente_id;
            tipo_vinculacion = 'paciente';
        } else {
            return res.status(400).json({ 
                message: 'Debe proporcionar (usuario_id) para crear paciente, o (paciente_id) para vincular paciente existente.',
                ejemplos: {
                    crear_paciente: { doctor_id: 1, usuario_id: 5 },
                    vincular_paciente_existente: { doctor_id: 1, paciente_id: 3 }
                }
            });
        }

        const resultado = await doctorPacienteModel.vincularDoctorConUsuarioOPaciente(
            doctor_id, 
            id_vinculacion, 
            tipo_vinculacion
        );

        return res.status(201).json({ 
            message: resultado.fue_creado_paciente 
                ? 'Usuario convertido en paciente y vinculado exitosamente al doctor.' 
                : 'Paciente vinculado exitosamente al doctor.',
            vinculo: resultado.vinculacion,
            paciente_id: resultado.paciente_id,
            fue_creado_paciente: resultado.fue_creado_paciente
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error al vincular doctor con usuario/paciente.', error: error.message });
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
    vincularDoctorPaciente, // Función original para compatibilidad
    vincularDoctorConUsuario, // Nueva función principal
    obtenerPacientesDeDoctor,
    obtenerDoctoresDePaciente,
    desvincularDoctorPaciente,
    obtenerTodasLasVinculaciones,
};
