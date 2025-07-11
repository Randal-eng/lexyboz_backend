const express = require('express');
const router = express.Router();
const controller = require('../controllers/resultadosEscrituraReordenamientoController');

router.post('/', controller.registrarResultado);
router.get('/:usuario_id', controller.obtenerResultadosPorUsuario);
router.get('/con-usuario/:usuario_id', controller.obtenerResultadosConUsuario);

module.exports = router;
