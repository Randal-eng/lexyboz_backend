// Exportar controladores
const citaController = require('./controllers/citaController');
const doctorPacienteController = require('./controllers/doctorPacienteController');

// Exportar modelos
const Cita = require('./models/Cita');
const DoctorPaciente = require('./models/DoctorPaciente');

module.exports = {
  // Controladores
  citaController,
  doctorPacienteController,
  
  // Modelos
  Cita,
  DoctorPaciente
};
