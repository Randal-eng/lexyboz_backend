const express = require('express');
const router = express.Router();
const kitController = require('../controllers/kitController');

router.post('/', kitController.crearKit);
router.get('/', kitController.obtenerKits);
router.get('/:id', kitController.obtenerKitPorId);
router.put('/:id', kitController.editarKit);
router.delete('/:id', kitController.eliminarKit);

module.exports = router;
