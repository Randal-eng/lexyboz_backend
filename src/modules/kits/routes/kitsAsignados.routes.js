const express = require('express');
const router = express.Router();
const kitsAsignadosController = require('../controllers/kitsAsignadosController');
const { verifyToken } = require('../../auth/middleware/authMiddleware');

/**
 * @swagger
 * /api/kits/asignados:
 *   post:
 *     summary: Asignar un kit a un paciente (ruta raíz)
 *     security:
 *       - bearerAuth: []
 *     tags: [KitsAsignados]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [kit_id, paciente_id, estado]
 *             properties:
 *               kit_id: { type: integer, description: ID del kit }
 *               paciente_id: { type: integer, description: ID del paciente }
 *               estado: { type: string, description: Estado inicial del kit }
 *           examples:
 *             ejemplo:
 *               value: { kit_id: 5, paciente_id: 42, estado: "en_progreso" }
 *     responses:
 *       201:
 *         description: Kit asignado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 asignacion_id: { type: integer }
 *                 kit_id: { type: integer }
 *                 paciente_id: { type: integer }
 *                 estado: { type: string }
 *                 fecha_asignacion: { type: string, format: date-time }
 *             examples:
 *               ejemplo:
 *                 value: { asignacion_id: 101, kit_id: 5, paciente_id: 42, estado: "en_progreso", fecha_asignacion: "2025-01-15T10:00:00.000Z" }
 *       400: { description: Error en la solicitud }
 */
router.post('/', verifyToken, kitsAsignadosController.asignarKit);

/**
 * @swagger
 * /api/kits/asignados/asignar:
 *   post:
 *     summary: Asignar un kit a un paciente
 *     security:
 *       - bearerAuth: []
 *     tags: [KitsAsignados]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [kit_id, paciente_id, estado]
 *             properties:
 *               kit_id: { type: integer, description: ID del kit }
 *               paciente_id: { type: integer, description: ID del paciente }
 *               estado: { type: string, description: Estado inicial del kit }
 *           examples:
 *             ejemplo:
 *               value: { kit_id: 5, paciente_id: 42, estado: "en_progreso" }
 *     responses:
 *       201:
 *         description: Kit asignado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 asignacion_id: { type: integer }
 *                 kit_id: { type: integer }
 *                 paciente_id: { type: integer }
 *                 estado: { type: string }
 *                 fecha_asignacion: { type: string, format: date-time }
 *             examples:
 *               ejemplo:
 *                 value: { asignacion_id: 101, kit_id: 5, paciente_id: 42, estado: "en_progreso", fecha_asignacion: "2025-01-15T10:00:00.000Z" }
 *       400:
 *         description: Error en la solicitud
 */
router.post('/asignar', verifyToken, kitsAsignadosController.asignarKit);

/**
 * @swagger
 * /api/kits/asignados:
 *   get:
 *     summary: Listar asignaciones de kits (ruta raíz)
 *     security:
 *       - bearerAuth: []
 *     tags: [KitsAsignados]
 *     parameters:
 *       - in: query
 *         name: kit_id
 *         schema: { type: integer }
 *         required: false
 *       - in: query
 *         name: paciente_id
 *         schema: { type: integer }
 *         required: false
 *     responses:
 *       200:
 *         description: Lista de asignaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   asignacion_id: { type: integer }
 *                   kit_id: { type: integer }
 *                   paciente_id: { type: integer }
 *                   estado: { type: string }
 *                   fecha_asignacion: { type: string, format: date-time }
 *             examples:
 *               ejemplo:
 *                 value: [ { asignacion_id: 101, kit_id: 5, paciente_id: 42, estado: "en_progreso", fecha_asignacion: "2025-01-15T10:00:00.000Z" } ]
 *       400: { description: Error en la solicitud }
 */
router.get('/', verifyToken, kitsAsignadosController.obtenerAsignaciones);
/**
 * @swagger
 * /api/kits/asignados/listado:
 *   get:
 *     summary: Listar asignaciones de kits (filtrable por kit_id y paciente_id)
 *     security:
 *       - bearerAuth: []
 *     tags: [KitsAsignados]
 *     parameters:
 *       - in: query
 *         name: kit_id
 *         schema: { type: integer }
 *         required: false
 *       - in: query
 *         name: paciente_id
 *         schema: { type: integer }
 *         required: false
 *     responses:
 *       200:
 *         description: Lista de asignaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   asignacion_id: { type: integer }
 *                   kit_id: { type: integer }
 *                   paciente_id: { type: integer }
 *                   estado: { type: string }
 *                   fecha_asignacion: { type: string, format: date-time }
 *             examples:
 *               ejemplo:
 *                 value: [ { asignacion_id: 101, kit_id: 5, paciente_id: 42, estado: "en_progreso", fecha_asignacion: "2025-01-15T10:00:00.000Z" } ]
 *       400:
 *         description: Error en la solicitud
 */
router.get('/listado', verifyToken, kitsAsignadosController.obtenerAsignaciones);

/**
 * @swagger
 * /api/kits/asignados/{id}:
 *   put:
 *     summary: Actualizar estado de una asignación de kit (ruta raíz)
 *     security:
 *       - bearerAuth: []
 *     tags: [KitsAsignados]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado: { type: string, description: Nuevo estado (ej. en_progreso, completado) }
 *           examples:
 *             ejemplo:
 *               value: { estado: "completado" }
 *     responses:
 *       200:
 *         description: Asignación editada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 asignacion_id: { type: integer }
 *                 kit_id: { type: integer }
 *                 paciente_id: { type: integer }
 *                 estado: { type: string }
 *                 fecha_asignacion: { type: string, format: date-time }
 *             examples:
 *               ejemplo:
 *                 value: { asignacion_id: 101, kit_id: 5, paciente_id: 42, estado: "completado", fecha_asignacion: "2025-01-15T10:00:00.000Z" }
 *       400: { description: Error en la solicitud }
 *       404: { description: Asignación no encontrada }
 */
router.put('/:id', verifyToken, kitsAsignadosController.editarEstadoAsignacion);
/**
 * @swagger
 * /api/kits/asignados/{id}/estado:
 *   put:
 *     summary: Actualizar estado de una asignación de kit
 *     security:
 *       - bearerAuth: []
 *     tags: [KitsAsignados]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado: { type: string, description: Nuevo estado (ej. en_progreso, completado) }
 *           examples:
 *             ejemplo:
 *               value: { estado: "completado" }
 *     responses:
 *       200: { description: Asignación editada exitosamente }
 *       400: { description: Error en la solicitud }
 *       404: { description: Asignación no encontrada }
 */
router.put('/:id/estado', verifyToken, kitsAsignadosController.editarEstadoAsignacion);

/**
 * @swagger
 * /api/kits/asignados/{id}:
 *   delete:
 *     summary: Eliminar una asignación de kit (ruta raíz)
 *     security:
 *       - bearerAuth: []
 *     tags: [KitsAsignados]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       200:
 *         description: Asignación eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 asignacion:
 *                   type: object
 *                   properties:
 *                     asignacion_id: { type: integer }
 *                     kit_id: { type: integer }
 *                     paciente_id: { type: integer }
 *                     estado: { type: string }
 *                     fecha_asignacion: { type: string, format: date-time }
 *             examples:
 *               ejemplo:
 *                 value: { message: "Asignación eliminada.", asignacion: { asignacion_id: 101, kit_id: 5, paciente_id: 42, estado: "completado", fecha_asignacion: "2025-01-15T10:00:00.000Z" } }
 *       404: { description: Asignación no encontrada }
 */
router.delete('/:id', verifyToken, kitsAsignadosController.eliminarAsignacion);
/**
 * @swagger
 * /api/kits/asignados/{id}/eliminar:
 *   delete:
 *     summary: Eliminar una asignación de kit
 *     security:
 *       - bearerAuth: []
 *     tags: [KitsAsignados]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       200:
 *         description: Asignación eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 asignacion:
 *                   type: object
 *                   properties:
 *                     asignacion_id: { type: integer }
 *                     kit_id: { type: integer }
 *                     paciente_id: { type: integer }
 *                     estado: { type: string }
 *                     fecha_asignacion: { type: string, format: date-time }
 *             examples:
 *               ejemplo:
 *                 value: { message: "Asignación eliminada.", asignacion: { asignacion_id: 101, kit_id: 5, paciente_id: 42, estado: "completado", fecha_asignacion: "2025-01-15T10:00:00.000Z" } }
 *       404: { description: Asignación no encontrada }
 */
router.delete('/:id/eliminar', verifyToken, kitsAsignadosController.eliminarAsignacion);

/**
 * @swagger
 * /api/kits/asignados/historial/{paciente_id}:
 *   get:
 *     summary: Historial de kits asignados de un paciente (paginado)
 *     security:
 *       - bearerAuth: []
 *     tags: [KitsAsignados]
 *     parameters:
 *       - in: path
 *         name: paciente_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del paciente
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Tamaño de página
 *     responses:
 *       200:
 *         description: Historial paginado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page: { type: integer }
 *                 limit: { type: integer }
 *                 total: { type: integer }
 *                 count: { type: integer }
 *                 historial:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       asignacion_id: { type: integer }
 *                       estado: { type: string }
 *                       fecha_asignacion: { type: string, format: date-time }
 *                       kit_id: { type: integer }
 *                       nombre: { type: string }
 *                       descripcion: { type: string }
 *                       creado_por: { type: string }
 *             examples:
 *               success:
 *                 value:
 *                   page: 1
 *                   limit: 10
 *                   total: 2
 *                   count: 2
 *                   historial:
 *                     - asignacion_id: 101
 *                       estado: "completado"
 *                       fecha_asignacion: "2025-01-15T10:00:00.000Z"
 *                       kit_id: 5
 *                       nombre: "Kit Lectura Basico"
 *                       descripcion: "Ejercicios introductorios de lectura"
 *                       creado_por: "admin"
 *                     - asignacion_id: 95
 *                       estado: "en_progreso"
 *                       fecha_asignacion: "2024-12-10T09:30:00.000Z"
 *                       kit_id: 3
 *                       nombre: "Kit Escritura Nivel 1"
 *                       descripcion: "Trazos y palabras simples"
 *                       creado_por: "admin"
 *               empty:
 *                 value:
 *                   page: 1
 *                   limit: 10
 *                   total: 0
 *                   count: 0
 *                   historial: []
 *                   message: "No hay historial de kits para este paciente."
 */
router.get('/historial/:paciente_id', verifyToken, kitsAsignadosController.obtenerHistorialPorPaciente);

/**
 * @swagger
 * /api/kits/asignados/pacientes/{paciente_id}/historial:
 *   get:
 *     summary: Historial de kits asignados de un paciente (paginado)
 *     security:
 *       - bearerAuth: []
 *     tags: [KitsAsignados]
 *     parameters:
 *       - in: path
 *         name: paciente_id
 *         schema: { type: integer }
 *         required: true
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Historial paginado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page: { type: integer }
 *                 limit: { type: integer }
 *                 total: { type: integer }
 *                 count: { type: integer }
 *                 historial:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       asignacion_id: { type: integer }
 *                       estado: { type: string }
 *                       fecha_asignacion: { type: string, format: date-time }
 *                       kit_id: { type: integer }
 *                       nombre: { type: string }
 *                       descripcion: { type: string }
 *                       creado_por: { type: string }
 *             examples:
 *               ejemplo:
 *                 value: { page: 1, limit: 10, total: 1, count: 1, historial: [ { asignacion_id: 101, estado: "completado", fecha_asignacion: "2025-01-15T10:00:00.000Z", kit_id: 5, nombre: "Kit Lectura Basico", descripcion: "Ejercicios introductorios de lectura", creado_por: "admin" } ] }
 */
router.get('/pacientes/:paciente_id/historial', verifyToken, kitsAsignadosController.obtenerHistorialPorPaciente);

module.exports = router;
