const express = require('express');
const router = express.Router();
const kitController = require('../controllers/kitController');
const { verifyToken } = require('../../auth/middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Kit:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Kit de Lectura Básica"
 *         descripcion:
 *           type: string
 *           example: "Kit para evaluar habilidades básicas de lectura"
 *         creado_por:
 *           type: integer
 *           example: 1
 *     
 *     KitConEjercicios:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Kit de Lectura Completo"
 *         descripcion:
 *           type: string
 *           example: "Kit integral para evaluación de lectura"
 *         creado_por:
 *           type: integer
 *           example: 1
 *         ejercicios:
 *           type: array
 *           example:
 *             - ejercicio_id: 1
 *               orden: 1
 *             - ejercicio_id: 2
 *               orden: 2
 *             - ejercicio_id: 3
 *               orden: 3
 *     
 *     AgregarEjercicios:
 *       type: object
 *       properties:
 *         ejercicios:
 *           type: array
 *           example:
 *             - ejercicio_id: 4
 *               orden: 1
 *             - ejercicio_id: 5
 *               orden: 2
 */

/**
 * @swagger
 * /api/kits:
 *   post:
 *     summary: Crear un kit básico
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Kit'
 *     responses:
 *       201:
 *         description: Kit creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', verifyToken, kitController.crearKit);

/**
 * @swagger
 * /api/kits/con-ejercicios:
 *   post:
 *     summary: Crear un kit con ejercicios
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/KitConEjercicios'
 *           example:
 *             name: "Kit de Lectura Completo"
 *             descripcion: "Kit integral para evaluación de lectura"
 *             creado_por: 1
 *             ejercicios:
 *               - ejercicio_id: 1
 *                 orden: 1
 *               - ejercicio_id: 2
 *                 orden: 2
 *     responses:
 *       201:
 *         description: Kit creado exitosamente con ejercicios
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/con-ejercicios', verifyToken, kitController.crearKitConEjercicios);

/**
 * @swagger
 * /api/kits:
 *   get:
 *     summary: Obtener todos los kits
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Kits obtenidos exitosamente
 *       401:
 *         description: No autorizado
 */
router.get('/', verifyToken, kitController.obtenerKits);

/**
 * @swagger
 * /api/kits/{id}:
 *   get:
 *     summary: Obtener un kit específico
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kit obtenido exitosamente
 *       404:
 *         description: Kit no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/:id', verifyToken, kitController.obtenerKitPorId);

/**
 * @swagger
 * /api/kits/{id}:
 *   put:
 *     summary: Actualizar un kit
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Kit'
 *     responses:
 *       200:
 *         description: Kit actualizado exitosamente
 *       404:
 *         description: Kit no encontrado
 *       401:
 *         description: No autorizado
 */
router.put('/:id', verifyToken, kitController.actualizarKit);

/**
 * @swagger
 * /api/kits/{id}:
 *   delete:
 *     summary: Eliminar un kit (soft delete)
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kit eliminado exitosamente
 *       404:
 *         description: Kit no encontrado
 *       401:
 *         description: No autorizado
 */
router.delete('/:id', verifyToken, kitController.eliminarKit);

/**
 * @swagger
 * /api/kits/{id}/ejercicios:
 *   get:
 *     summary: Obtener ejercicios de un kit
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Ejercicios del kit obtenidos exitosamente
 *       404:
 *         description: Kit no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/:id/ejercicios', verifyToken, kitController.obtenerEjerciciosDeKit);

/**
 * @swagger
 * /api/kits/{id}/ejercicios:
 *   post:
 *     summary: Agregar ejercicios a un kit
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AgregarEjercicios'
 *           example:
 *             ejercicios:
 *               - ejercicio_id: 4
 *                 orden: 1
 *               - ejercicio_id: 5
 *                 orden: 2
 *     responses:
 *       201:
 *         description: Ejercicios agregados exitosamente
 *       404:
 *         description: Kit no encontrado
 *       401:
 *         description: No autorizado
 */
router.post('/:id/ejercicios', verifyToken, kitController.agregarEjerciciosAKit);

/**
 * @swagger
 * /api/kits/{id}/ejercicios:
 *   delete:
 *     summary: Remover ejercicios de un kit
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ejercicios_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *           example:
 *             ejercicios_ids: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Ejercicios removidos exitosamente
 *       404:
 *         description: Kit no encontrado
 *       401:
 *         description: No autorizado
 */
router.delete('/:id/ejercicios', verifyToken, kitController.removerEjerciciosDeKit);

module.exports = router;