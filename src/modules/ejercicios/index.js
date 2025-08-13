// Exportar controladores
const ejercicioController = require('./controllers/ejercicioController');

// Exportar modelos
const Ejercicio = require('./models/Ejercicio');

module.exports = {
  // Controladores
  ejercicioController,
  
  // Modelos
  Ejercicio
};
