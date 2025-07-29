const express = require('express');
const router = express.Router();
const visualesController = require('../controllers/visualesController');

/**
 * @swagger
 * /api/ejercicios/visuales:
 *   post:
 *     summary: Crea un nuevo reactivo visual
 *     tags: [Visuales]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *                 description: Descripción del reactivo visual
 *     responses:
 *       201:
 *         description: Reactivo visual creado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', visualesController.crearVisual);
/**
 * @swagger
 * /api/ejercicios/visuales:
 *   get:
 *     summary: Obtiene todos los reactivos visuales
 *     tags: [Visuales]
 *     responses:
 *       200:
 *         description: Lista de reactivos visuales
 *       400:
 *         description: Error en la solicitud
 */
router.get('/', visualesController.obtenerVisuales);

module.exports = router;
