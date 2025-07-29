const express = require('express');
const router = express.Router();
const controller = require('../controllers/escrituraImagenPalabraController');

/**
 * @swagger
 * /api/ejercicios/escritura-imagen-palabra:
 *   post:
 *     summary: Crea un nuevo reactivo de escritura imagen-palabra
 *     tags: [EscrituraImagenPalabra]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               palabra:
 *                 type: string
 *                 description: Palabra a escribir
 *               imagen:
 *                 type: string
 *                 description: URL de la imagen
 *     responses:
 *       201:
 *         description: Reactivo creado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', controller.crearReactivo);
/**
 * @swagger
 * /api/ejercicios/escritura-imagen-palabra:
 *   get:
 *     summary: Obtiene todos los reactivos de escritura imagen-palabra
 *     tags: [EscrituraImagenPalabra]
 *     responses:
 *       200:
 *         description: Lista de reactivos
 *       400:
 *         description: Error en la solicitud
 */
router.get('/', controller.obtenerReactivos);

module.exports = router;
