const express = require('express');
const router = express.Router();
const escritosController = require('../controllers/escritosController');

/**
 * @swagger
 * /api/ejercicios/escritos:
 *   post:
 *     summary: Crea un nuevo escrito
 *     tags: [Escritos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               texto:
 *                 type: string
 *                 description: Texto del escrito
 *     responses:
 *       201:
 *         description: Escrito creado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', escritosController.crearEscrito);
/**
 * @swagger
 * /api/ejercicios/escritos:
 *   get:
 *     summary: Obtiene todos los escritos
 *     tags: [Escritos]
 *     responses:
 *       200:
 *         description: Lista de escritos
 *       400:
 *         description: Error en la solicitud
 */
router.get('/', escritosController.obtenerEscritos);

module.exports = router;
