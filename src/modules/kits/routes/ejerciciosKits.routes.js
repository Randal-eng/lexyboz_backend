const express = require('express');
const router = express.Router();
const ejerciciosKitsController = require('../controllers/ejerciciosKitsController');

/**
 * @swagger
 * /api/kits/ejercicios/agregar:
 *   post:
 *     summary: Agrega un ejercicio a un kit
 *     tags: [EjerciciosKits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               kitId:
 *                 type: string
 *                 description: ID del kit
 *               ejercicioId:
 *                 type: string
 *                 description: ID del ejercicio
 *     responses:
 *       201:
 *         description: Ejercicio agregado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/agregar', ejerciciosKitsController.agregarEjercicioAKit);
/**
 * @swagger
 * /api/kits/ejercicios/eliminar:
 *   delete:
 *     summary: Elimina un ejercicio de un kit
 *     tags: [EjerciciosKits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               kitId:
 *                 type: string
 *                 description: ID del kit
 *               ejercicioId:
 *                 type: string
 *                 description: ID del ejercicio
 *     responses:
 *       200:
 *         description: Ejercicio eliminado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.delete('/eliminar', ejerciciosKitsController.eliminarEjercicioDeKit);
/**
 * @swagger
 * /api/kits/ejercicios/kit/{kit_id}:
 *   get:
 *     summary: Obtiene todos los ejercicios de un kit
 *     tags: [EjerciciosKits]
 *     parameters:
 *       - in: path
 *         name: kit_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del kit
 *     responses:
 *       200:
 *         description: Lista de ejercicios del kit
 *       404:
 *         description: Kit no encontrado
 */
router.get('/kit/:kit_id', ejerciciosKitsController.obtenerEjerciciosPorKit);

module.exports = router;
