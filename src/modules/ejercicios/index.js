// Exportar controladores
const ejercicioController = require('./controllers/ejercicioController');

// Exportar modelos
const Ejercicio = require('./models/Ejercicio');
const Tipo = require('./models/Tipo');
const SubTipo = require('./models/SubTipo');

module.exports = {
  // Controladores
  ejercicioController,
  
  // Modelos
  Ejercicio,
  Tipo,
  SubTipo
};
