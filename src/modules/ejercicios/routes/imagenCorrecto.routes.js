const express = require('express');
const router = express.Router();
const imagenCorrectoController = require('../controllers/imagenCorrectoController');

/**
 * @swagger
 * /api/ejercicios/imagen-correcto:
 *   post:
 *     summary: Crea un nuevo reactivo imagen-correcto
 *     tags: [ImagenCorrecto]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imagen:
 *                 type: string
 *                 description: URL de la imagen
 *               respuesta:
 *                 type: string
 *                 description: Respuesta correcta
 *     responses:
 *       201:
 *         description: Reactivo creado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', imagenCorrectoController.crearReactivo);
/**
 * @swagger
 * /api/ejercicios/imagen-correcto:
 *   get:
 *     summary: Obtiene todos los reactivos imagen-correcto
 *     tags: [ImagenCorrecto]
 *     responses:
 *       200:
 *         description: Lista de reactivos
 *       400:
 *         description: Error en la solicitud
 */
router.get('/', imagenCorrectoController.obtenerReactivos);

module.exports = router;
