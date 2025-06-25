const express = require('express');
const router = express.Router();
const controller = require('../controllers/resultadosEscrituraReordenamientoController');

router.post('/', controller.registrarResultado);
router.get('/:usuario_id', controller.obtenerResultadosPorUsuario);

module.exports = router;
