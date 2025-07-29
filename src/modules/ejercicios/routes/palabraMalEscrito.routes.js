const express = require('express');
const router = express.Router();
const palabraMalEscritoController = require('../controllers/palabraMalEscritoController');

/**
 * @swagger
 * /api/ejercicios/palabra-mal-escrito:
 *   post:
 *     summary: Crea un nuevo reactivo palabra-mal-escrito
 *     tags: [PalabraMalEscrito]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               palabra:
 *                 type: string
 *                 description: Palabra mal escrita
 *               correccion:
 *                 type: string
 *                 description: Palabra corregida
 *     responses:
 *       201:
 *         description: Reactivo creado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', palabraMalEscritoController.crearReactivo);
/**
 * @swagger
 * /api/ejercicios/palabra-mal-escrito:
 *   get:
 *     summary: Obtiene todos los reactivos palabra-mal-escrito
 *     tags: [PalabraMalEscrito]
 *     responses:
 *       200:
 *         description: Lista de reactivos
 *       400:
 *         description: Error en la solicitud
 */
router.get('/', palabraMalEscritoController.obtenerReactivos);

module.exports = router;
