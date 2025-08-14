// Exportar todos los módulos
const auth = require('./auth');
const citas = require('./citas');
const kits = require('./kits');
const ejercicios = require('./ejercicios');
const reactivos = require('./reactivos');
const resultados = require('./resultados');

module.exports = {
  auth,
  citas,
  kits,
  ejercicios,
  reactivos,
  resultados
};
