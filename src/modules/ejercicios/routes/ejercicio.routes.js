const express = require('express');
const router = express.Router();
const ejercicioController = require('../controllers/ejercicioController');

/**
 * @swagger
 * /api/ejercicios:
 *   post:
 *     summary: Crea un nuevo ejercicio
 *     tags: [Ejercicios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del ejercicio
 *               descripcion:
 *                 type: string
 *                 description: Descripción del ejercicio
 *     responses:
 *       201:
 *         description: Ejercicio creado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', ejercicioController.crearEjercicio);
/**
 * @swagger
 * /api/ejercicios:
 *   get:
 *     summary: Obtiene todos los ejercicios
 *     tags: [Ejercicios]
 *     responses:
 *       200:
 *         description: Lista de ejercicios
 *       400:
 *         description: Error en la solicitud
 */
router.get('/', ejercicioController.obtenerEjercicios);
/**
 * @swagger
 * /api/ejercicios/{id}:
 *   get:
 *     summary: Obtiene un ejercicio por ID
 *     tags: [Ejercicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del ejercicio
 *     responses:
 *       200:
 *         description: Ejercicio encontrado
 *       404:
 *         description: Ejercicio no encontrado
 */
router.get('/:id', ejercicioController.obtenerEjercicioPorId);
/**
 * @swagger
 * /api/ejercicios/{id}:
 *   put:
 *     summary: Edita un ejercicio existente
 *     tags: [Ejercicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del ejercicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre del ejercicio
 *               descripcion:
 *                 type: string
 *                 description: Nueva descripción del ejercicio
 *     responses:
 *       200:
 *         description: Ejercicio editado exitosamente
 *       400:
 *         description: Error en la solicitud
 *       404:
 *         description: Ejercicio no encontrado
 */
router.put('/:id', ejercicioController.editarEjercicio);
/**
 * @swagger
 * /api/ejercicios/{id}:
 *   delete:
 *     summary: Elimina un ejercicio
 *     tags: [Ejercicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del ejercicio
 *     responses:
 *       200:
 *         description: Ejercicio eliminado exitosamente
 *       404:
 *         description: Ejercicio no encontrado
 */
router.delete('/:id', ejercicioController.eliminarEjercicio);

module.exports = router;
