// Exportar controladores
const citaController = require('./controllers/citaController');
const doctorPacienteController = require('./controllers/doctorPacienteController');
const solicitudVinculacionController = require('./controllers/solicitudVinculacionController');

// Exportar modelos
const Cita = require('./models/Cita');
const DoctorPaciente = require('./models/DoctorPaciente');
const SolicitudVinculacion = require('./models/SolicitudVinculacion');

module.exports = {
  // Controladores
  citaController,
  doctorPacienteController,
  solicitudVinculacionController,
  
  // Modelos
  Cita,
  DoctorPaciente,
  SolicitudVinculacion
};
