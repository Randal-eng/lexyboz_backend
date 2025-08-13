// Exportar controladores
const resultadoController = require('./controllers/resultadoController');

// Exportar modelos
const ResultadoLecturaPalabra = require('./models/ResultadoLecturaPalabra');
const ResultadoLecturaPseudopalabra = require('./models/ResultadoLecturaPseudopalabra');

module.exports = {
  // Controladores
  resultadoController,
  
  // Modelos
  ResultadoLecturaPalabra,
  ResultadoLecturaPseudopalabra
};
