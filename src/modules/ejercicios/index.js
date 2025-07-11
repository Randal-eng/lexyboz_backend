// Exportar controladores
const ejercicioController = require('./controllers/ejercicioController');
const escritosController = require('./controllers/escritosController');
const escrituraReordenamientoController = require('./controllers/escrituraReordenamientoController');
const escrituraImagenPalabraController = require('./controllers/escrituraImagenPalabraController');
const visualesController = require('./controllers/visualesController');
const paresController = require('./controllers/paresController');
const igualDiferenteController = require('./controllers/igualDiferenteController');
const imagenCorrectoController = require('./controllers/imagenCorrectoController');
const imagenesController = require('./controllers/imagenesController');
const palabraMalEscritoController = require('./controllers/palabraMalEscritoController');

// Exportar modelos
const Ejercicio = require('./models/Ejercicio');
const Escrito = require('./models/Escrito');
const EscrituraReordenamiento = require('./models/EscrituraReordenamiento');
const EscrituraImagenPalabra = require('./models/EscrituraImagenPalabra');
const Visual = require('./models/Visual');
const Par = require('./models/Par');
const IgualDiferente = require('./models/IgualDiferente');
const ImagenCorrecta = require('./models/ImagenCorrecta');
const Imagen = require('./models/Imagen');
const PalabraMalEscrita = require('./models/PalabraMalEscrita');
const Densa = require('./models/Densa');
const Lectura = require('./models/Lectura');
const LecturaPalabra = require('./models/LecturaPalabra');
const LecturaPseudopalabra = require('./models/LecturaPseudopalabra');

module.exports = {
  // Controladores
  ejercicioController,
  escritosController,
  escrituraReordenamientoController,
  escrituraImagenPalabraController,
  visualesController,
  paresController,
  igualDiferenteController,
  imagenCorrectoController,
  imagenesController,
  palabraMalEscritoController,
  
  // Modelos
  Ejercicio,
  Escrito,
  EscrituraReordenamiento,
  EscrituraImagenPalabra,
  Visual,
  Par,
  IgualDiferente,
  ImagenCorrecta,
  Imagen,
  PalabraMalEscrita,
  Densa,
  Lectura,
  LecturaPalabra,
  LecturaPseudopalabra
};
