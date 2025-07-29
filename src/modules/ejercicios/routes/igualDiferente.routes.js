const express = require('express');
const router = express.Router();
const igualDiferenteController = require('../controllers/igualDiferenteController');

/**
 * @swagger
 * /api/ejercicios/igual-diferente:
 *   post:
 *     summary: Crea un nuevo reactivo igual-diferente
 *     tags: [IgualDiferente]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pregunta:
 *                 type: string
 *                 description: Pregunta del reactivo
 *               opciones:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Opciones de respuesta
 *     responses:
 *       201:
 *         description: Reactivo creado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', igualDiferenteController.crearReactivo);
/**
 * @swagger
 * /api/ejercicios/igual-diferente:
 *   get:
 *     summary: Obtiene todos los reactivos igual-diferente
 *     tags: [IgualDiferente]
 *     responses:
 *       200:
 *         description: Lista de reactivos
 *       400:
 *         description: Error en la solicitud
 */
router.get('/', igualDiferenteController.obtenerReactivos);

module.exports = router;
