// Exportar controladores
const ejercicioController = require('./controllers/ejercicioController');
const tipoController = require('./controllers/tipoController');
const subTipoController = require('./controllers/subTipoController');

// Exportar modelos
const Ejercicio = require('./models/Ejercicio');
const Tipo = require('./models/Tipo');
const SubTipo = require('./models/SubTipo');

module.exports = {
  // Controladores
  ejercicioController,
  tipoController,
  subTipoController,
  
  // Modelos
  Ejercicio,
  Tipo,
  SubTipo
};
