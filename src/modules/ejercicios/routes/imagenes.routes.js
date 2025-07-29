const express = require('express');
const router = express.Router();
const imagenesController = require('../controllers/imagenesController');

/**
 * @swagger
 * /api/ejercicios/imagenes:
 *   post:
 *     summary: Crea una nueva imagen para un reactivo
 *     tags: [Imagenes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reactivoId:
 *                 type: string
 *                 description: ID del reactivo
 *               url:
 *                 type: string
 *                 description: URL de la imagen
 *     responses:
 *       201:
 *         description: Imagen creada exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', imagenesController.crearImagen);
/**
 * @swagger
 * /api/ejercicios/imagenes/{reactivo_id}:
 *   get:
 *     summary: Obtiene todas las imágenes de un reactivo
 *     tags: [Imagenes]
 *     parameters:
 *       - in: path
 *         name: reactivo_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del reactivo
 *     responses:
 *       200:
 *         description: Lista de imágenes
 *       404:
 *         description: Reactivo no encontrado
 */
router.get('/:reactivo_id', imagenesController.obtenerImagenesPorReactivo);

module.exports = router;
