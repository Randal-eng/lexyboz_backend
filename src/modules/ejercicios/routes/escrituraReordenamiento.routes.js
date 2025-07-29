const express = require('express');
const router = express.Router();
const controller = require('../controllers/escrituraReordenamientoController');

/**
 * @swagger
 * /api/ejercicios/escritura-reordenamiento:
 *   post:
 *     summary: Crea un nuevo reactivo de escritura reordenamiento
 *     tags: [EscrituraReordenamiento]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oracion:
 *                 type: string
 *                 description: Oración a reordenar
 *     responses:
 *       201:
 *         description: Reactivo creado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', controller.crearReactivo);
/**
 * @swagger
 * /api/ejercicios/escritura-reordenamiento:
 *   get:
 *     summary: Obtiene todos los reactivos de escritura reordenamiento
 *     tags: [EscrituraReordenamiento]
 *     responses:
 *       200:
 *         description: Lista de reactivos
 *       400:
 *         description: Error en la solicitud
 */
router.get('/', controller.obtenerReactivos);

module.exports = router;
