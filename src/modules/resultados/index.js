// Exportar controladores
const resultadosEscrituraImagenPalabraController = require('./controllers/resultadosEscrituraImagenPalabraController');
const resultadosEscrituraReordenamientoController = require('./controllers/resultadosEscrituraReordenamientoController');

// Exportar modelos
const ResultadoEscrituraImagenPalabra = require('./models/ResultadoEscrituraImagenPalabra');
const ResultadoEscrituraReordenamiento = require('./models/ResultadoEscrituraReordenamiento');
const ResultadoFraseIncorrecta = require('./models/ResultadoFraseIncorrecta');
const ResultadoIgualDiferente = require('./models/ResultadoIgualDiferente');
const ResultadoImagenCorrecta = require('./models/ResultadoImagenCorrecta');
const ResultadoLectura = require('./models/ResultadoLectura');
const ResultadoLecturaPalabra = require('./models/ResultadoLecturaPalabra');
const ResultadoLecturaPseudopalabra = require('./models/ResultadoLecturaPseudopalabra');

module.exports = {
  // Controladores
  resultadosEscrituraImagenPalabraController,
  resultadosEscrituraReordenamientoController,
  
  // Modelos
  ResultadoEscrituraImagenPalabra,
  ResultadoEscrituraReordenamiento,
  ResultadoFraseIncorrecta,
  ResultadoIgualDiferente,
  ResultadoImagenCorrecta,
  ResultadoLectura,
  ResultadoLecturaPalabra,
  ResultadoLecturaPseudopalabra
};
