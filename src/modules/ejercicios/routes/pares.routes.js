const express = require('express');
const router = express.Router();
const paresController = require('../controllers/paresController');

/**
 * @swagger
 * /api/ejercicios/pares:
 *   post:
 *     summary: Crea un nuevo par
 *     tags: [Pares]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               elementoA:
 *                 type: string
 *                 description: Primer elemento del par
 *               elementoB:
 *                 type: string
 *                 description: Segundo elemento del par
 *     responses:
 *       201:
 *         description: Par creado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', paresController.crearPar);
/**
 * @swagger
 * /api/ejercicios/pares:
 *   get:
 *     summary: Obtiene todos los pares
 *     tags: [Pares]
 *     responses:
 *       200:
 *         description: Lista de pares
 *       400:
 *         description: Error en la solicitud
 */
router.get('/', paresController.obtenerPares);

module.exports = router;
