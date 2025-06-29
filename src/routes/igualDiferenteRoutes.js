const express = require('express');
const router = express.Router();
const igualDiferenteController = require('../controllers/igualDiferenteController');

router.post('/', igualDiferenteController.crearReactivo);
router.get('/', igualDiferenteController.obtenerReactivos);

module.exports = router;
