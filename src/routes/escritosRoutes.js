const express = require('express');
const router = express.Router();
const escritosController = require('../controllers/escritosController');

router.post('/', escritosController.crearEscrito);
router.get('/', escritosController.obtenerEscritos);

module.exports = router;
