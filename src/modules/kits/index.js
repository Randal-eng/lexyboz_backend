// Exportar controladores
const kitController = require('./controllers/kitController');
const kitsAsignadosController = require('./controllers/kitsAsignadosController');
const ejerciciosKitsController = require('./controllers/ejerciciosKitsController');

// Exportar modelos
const Kit = require('./models/Kit');
const KitAsignado = require('./models/KitAsignado');
const EjercicioKit = require('./models/EjercicioKit');

module.exports = {
  // Controladores
  kitController,
  kitsAsignadosController,
  ejerciciosKitsController,
  
  // Modelos
  Kit,
  KitAsignado,
  EjercicioKit
};
