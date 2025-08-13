// Exportar controladores
const ejercicioController = require('./controllers/ejercicioController');
const tipoController = require('./controllers/tipoController');
const subTipoController = require('./controllers/subTipoController');
const reactivoController = require('./controllers/reactivoController');

// Exportar modelos
const Ejercicio = require('./models/Ejercicio');
const Tipo = require('./models/Tipo');
const SubTipo = require('./models/SubTipo');
const ReactivoLecturaPseudopalabra = require('./models/ReactivoLecturaPseudopalabra');

module.exports = {
  // Controladores
  ejercicioController,
  tipoController,
  subTipoController,
  reactivoController,
  
  // Modelos
  Ejercicio,
  Tipo,
  SubTipo,
  ReactivoLecturaPseudopalabra
};
