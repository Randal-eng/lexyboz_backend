const express = require('express');
const router = express.Router();
const controller = require('../controllers/resultadosEscrituraImagenPalabraController');

/**
 * @swagger
 * /api/resultados/escritura-imagen-palabra:
 *   post:
 *     summary: Registra un nuevo resultado de escritura imagen-palabra
 *     tags: [ResultadosEscrituraImagenPalabra]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuarioId:
 *                 type: string
 *                 description: ID del usuario
 *               resultado:
 *                 type: object
 *                 description: Datos del resultado
 *     responses:
 *       201:
 *         description: Resultado registrado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', controller.registrarResultado);
/**
 * @swagger
 * /api/resultados/escritura-imagen-palabra/{usuario_id}:
 *   get:
 *     summary: Obtiene los resultados de escritura imagen-palabra de un usuario
 *     tags: [ResultadosEscrituraImagenPalabra]
 *     parameters:
 *       - in: path
 *         name: usuario_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de resultados
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:usuario_id', controller.obtenerResultadosPorUsuario);
/**
 * @swagger
 * /api/resultados/escritura-imagen-palabra/con-usuario/{usuario_id}:
 *   get:
 *     summary: Obtiene los resultados de escritura imagen-palabra de un usuario con información de usuario
 *     tags: [ResultadosEscrituraImagenPalabra]
 *     parameters:
 *       - in: path
 *         name: usuario_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de resultados con información de usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/con-usuario/:usuario_id', controller.obtenerResultadosConUsuario);

module.exports = router;
