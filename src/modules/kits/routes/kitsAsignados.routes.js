const express = require('express');
const router = express.Router();
const kitsAsignadosController = require('../controllers/kitsAsignadosController');

/**
 * @swagger
 * /api/kits/asignados:
 *   post:
 *     summary: Asigna un kit a un usuario
 *     tags: [KitsAsignados]
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
 *               usuarioId:
 *                 type: string
 *                 description: ID del usuario
 *     responses:
 *       201:
 *         description: Kit asignado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', kitsAsignadosController.asignarKit);
/**
 * @swagger
 * /api/kits/asignados:
 *   get:
 *     summary: Obtiene todas las asignaciones de kits
 *     tags: [KitsAsignados]
 *     responses:
 *       200:
 *         description: Lista de asignaciones
 *       400:
 *         description: Error en la solicitud
 */
router.get('/', kitsAsignadosController.obtenerAsignaciones);
/**
 * @swagger
 * /api/kits/asignados/{id}:
 *   put:
 *     summary: Edita el estado de una asignación de kit
 *     tags: [KitsAsignados]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la asignación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 description: Nuevo estado de la asignación
 *     responses:
 *       200:
 *         description: Asignación editada exitosamente
 *       400:
 *         description: Error en la solicitud
 *       404:
 *         description: Asignación no encontrada
 */
router.put('/:id', kitsAsignadosController.editarEstadoAsignacion);
/**
 * @swagger
 * /api/kits/asignados/{id}:
 *   delete:
 *     summary: Elimina una asignación de kit
 *     tags: [KitsAsignados]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la asignación
 *     responses:
 *       200:
 *         description: Asignación eliminada exitosamente
 *       404:
 *         description: Asignación no encontrada
 */
router.delete('/:id', kitsAsignadosController.eliminarAsignacion);

module.exports = router;
