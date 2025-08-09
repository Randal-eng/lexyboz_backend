const express = require('express');
const router = express.Router();
const kitController = require('../controllers/kitController');

/**
 * @swagger
 * /api/kits:
 *   post:
 *     summary: Crea un nuevo kit
 *     tags: [Kits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, creado_por]
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del kit
 *               descripcion:
 *                 type: string
 *                 description: Descripción del kit
 *               creado_por:
 *                 type: string
 *                 description: Usuario que crea el kit (ej. "admin")
 *           examples:
 *             ejemplo:
 *               value: { nombre: "Kit Lectura Básico", descripcion: "Ejercicios introductorios", creado_por: "admin" }
 *     responses:
 *       201:
 *         description: Kit creado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', kitController.crearKit);
/**
 * @swagger
 * /api/kits:
 *   get:
 *     summary: Obtiene todos los kits
 *     tags: [Kits]
 *     responses:
 *       200:
 *         description: Lista de kits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   kit_id: { type: integer }
 *                   nombre: { type: string }
 *                   descripcion: { type: string }
 *                   creado_por: { type: string }
 *                   fecha_creacion: { type: string, format: date-time }
 *             examples:
 *               ejemplo:
 *                 value: [ { kit_id: 5, nombre: "Kit Lectura Básico", descripcion: "Ejercicios introductorios", creado_por: "admin", fecha_creacion: "2025-01-10T12:00:00.000Z" } ]
 *       400:
 *         description: Error en la solicitud
 */
router.get('/', kitController.obtenerKits);
/**
 * @swagger
 * /api/kits/{id}:
 *   get:
 *     summary: Obtiene un kit por ID
 *     tags: [Kits]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del kit
 *     responses:
 *       200:
 *         description: Kit encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 kit_id: { type: integer }
 *                 nombre: { type: string }
 *                 descripcion: { type: string }
 *                 creado_por: { type: string }
 *                 fecha_creacion: { type: string, format: date-time }
 *             examples:
 *               ejemplo:
 *                 value: { kit_id: 5, nombre: "Kit Lectura Básico", descripcion: "Ejercicios introductorios", creado_por: "admin", fecha_creacion: "2025-01-10T12:00:00.000Z" }
 *       404:
 *         description: Kit no encontrado
 */
router.get('/:id', kitController.obtenerKitPorId);
/**
 * @swagger
 * /api/kits/{id}:
 *   put:
 *     summary: Edita un kit existente
 *     tags: [Kits]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del kit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre del kit
 *               descripcion:
 *                 type: string
 *                 description: Nueva descripción del kit
 *           examples:
 *             ejemplo:
 *               value: { nombre: "Kit Lectura Básico - v2", descripcion: "Ejercicios introductorios actualizados" }
 *     responses:
 *       200:
 *         description: Kit editado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 kit_id: { type: integer }
 *                 nombre: { type: string }
 *                 descripcion: { type: string }
 *                 creado_por: { type: string }
 *                 fecha_creacion: { type: string, format: date-time }
 *             examples:
 *               ejemplo:
 *                 value: { kit_id: 5, nombre: "Kit Lectura Básico - v2", descripcion: "Ejercicios introductorios actualizados", creado_por: "admin", fecha_creacion: "2025-01-10T12:00:00.000Z" }
 *       400:
 *         description: Error en la solicitud
 *       404:
 *         description: Kit no encontrado
 */
router.put('/:id', kitController.editarKit);
/**
 * @swagger
 * /api/kits/{id}:
 *   delete:
 *     summary: Elimina un kit
 *     tags: [Kits]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del kit
 *     responses:
 *       200:
 *         description: Kit eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 kit:
 *                   type: object
 *                   properties:
 *                     kit_id: { type: integer }
 *                     nombre: { type: string }
 *                     descripcion: { type: string }
 *                     creado_por: { type: string }
 *                     fecha_creacion: { type: string, format: date-time }
 *             examples:
 *               ejemplo:
 *                 value: { message: "Kit eliminado.", kit: { kit_id: 5, nombre: "Kit Lectura Básico", descripcion: "Ejercicios introductorios", creado_por: "admin", fecha_creacion: "2025-01-10T12:00:00.000Z" } }
 *       404:
 *         description: Kit no encontrado
 */
router.delete('/:id', kitController.eliminarKit);

module.exports = router;
