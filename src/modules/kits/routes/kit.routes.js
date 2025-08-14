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
 *     summary: Crear kit básico
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Kit'
 *     responses:
 *       201:
 *         description: Kit creado
 */
router.post('/', verifyToken, kitController.crearKit);

/**
 * @swagger
 * /api/kits/con-ejercicios:
 *   post:
 *     summary: Crear kit con ejercicios
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/KitConEjercicios'
 *     responses:
 *       201:
 *         description: Kit creado con ejercicios
 *         content:
 *           application/json:
 *             example:
 *               message: "Kit creado exitosamente con ejercicios"
 *               kit:
 *                 kit_id: 1
 *                 name: "Kit de Lectura Completo"
 *                 descripcion: "Kit integral para evaluación de lectura"
 *                 creado_por: 1
 *                 activo: true
 *                 total_ejercicios: 3
 *               ejercicios_agregados:
 *                 - kit_id: 1
 *                   ejercicio_id: 1
 *                   orden_en_kit: 1
 *                   activo: true
 *                 - kit_id: 1
 *                   ejercicio_id: 2
 *                   orden_en_kit: 2
 *                   activo: true
 *               total_ejercicios: 3
 */
router.post('/con-ejercicios', verifyToken, kitController.crearKitConEjercicios);

/**
 * @swagger
 * /api/kits:
 *   get:
 *     summary: Obtener kits
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Lista de kits
 *         content:
 *           application/json:
 *             example:
 *               message: "Kits obtenidos exitosamente"
 *               kits:
 *                 - kit_id: 1
 *                   name: "Kit de Lectura Básica"
 *                   descripcion: "Kit para evaluar habilidades básicas"
 *                   creado_por: 1
 *                   activo: true
 *                   total_ejercicios: 3
 *               pagination:
 *                 current_page: 1
 *                 total_pages: 1
 *                 total_items: 1
 */
router.get('/', verifyToken, kitController.obtenerKits);

/**
 * @swagger
 * /api/kits/{id}:
 *   get:
 *     summary: Obtener kit por ID
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Kit encontrado
 */
router.get('/:id', verifyToken, kitController.obtenerKitPorId);

/**
 * @swagger
 * /api/kits/{id}:
 *   put:
 *     summary: Actualizar kit
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Kit'
 *     responses:
 *       200:
 *         description: Kit actualizado
 */
router.put('/:id', verifyToken, kitController.actualizarKit);

/**
 * @swagger
 * /api/kits/{id}:
 *   delete:
 *     summary: Eliminar kit
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Kit eliminado
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
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Ejercicios del kit
 *         content:
 *           application/json:
 *             example:
 *               message: "Ejercicios del kit obtenidos exitosamente"
 *               ejercicios:
 *                 - ejercicio_id: 1
 *                   titulo: "Ejercicio de Pseudopalabras"
 *                   descripcion: "Ejercicio para evaluar lectura"
 *                   orden_en_kit: 1
 *                   activo_en_kit: true
 *               total: 1
 */
router.get('/:id/ejercicios', verifyToken, kitController.obtenerEjerciciosDeKit);

/**
 * @swagger
 * /api/kits/{id}/ejercicios:
 *   post:
 *     summary: Agregar ejercicios a kit
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AgregarEjercicios'
 *     responses:
 *       201:
 *         description: Ejercicios agregados
 *         content:
 *           application/json:
 *             example:
 *               message: "Ejercicios agregados al kit exitosamente"
 *               resultado:
 *                 kit_id: 1
 *                 ejercicios_agregados:
 *                   - kit_id: 1
 *                     ejercicio_id: 4
 *                     orden_en_kit: 1
 *                     activo: true
 *                 total_ejercicios: 1
 */
router.post('/:id/ejercicios', verifyToken, kitController.agregarEjerciciosAKit);

/**
 * @swagger
 * /api/kits/{id}/ejercicios:
 *   delete:
 *     summary: Remover ejercicios de kit
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             ejercicios_ids: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Ejercicios removidos
 */
router.delete('/:id/ejercicios', verifyToken, kitController.removerEjerciciosDeKit);

module.exports = router;