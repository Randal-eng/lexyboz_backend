const express = require('express');
const router = express.Router();
const visualesController = require('../controllers/visualesController');

router.post('/', visualesController.crearVisual);
router.get('/', visualesController.obtenerVisuales);

module.exports = router;
