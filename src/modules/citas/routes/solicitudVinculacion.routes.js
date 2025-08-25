const express = require('express');
const router = express.Router();
const solicitudVinculacionController = require('../controllers/solicitudVinculacionController');
const { verifyToken } = require('../../auth/middleware/authMiddleware');

/**
 * @swagger
 * /api/solicitudes/enviar:
 *   post:
 *     summary: Usuario envía solicitud para ser paciente de un doctor
 *     description: Permite a un usuario enviar una solicitud a un doctor para convertirse en su paciente
 *     tags: [Solicitudes de Vinculación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctor_id
 *             properties:
 *               doctor_id:
 *                 type: integer
 *                 description: ID del doctor al que se envía la solicitud
 *                 example: 7
 *               mensaje:
 *                 type: string
 *                 description: Mensaje opcional para el doctor
 *                 example: "Hola Dr. García, me gustaría ser su paciente para tratamiento de ansiedad."
 *           examples:
 *             solicitud_simple:
 *               summary: Solicitud básica
 *               value:
 *                 doctor_id: 7
 *             solicitud_con_mensaje:
 *               summary: Solicitud con mensaje
 *               value:
 *                 doctor_id: 7
 *                 mensaje: "Hola Dr. García, me gustaría ser su paciente."
 *     responses:
 *       201:
 *         description: Solicitud enviada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Solicitud enviada exitosamente al Dr. García"
 *                 solicitud:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     usuario_id:
 *                       type: integer
 *                     doctor_id:
 *                       type: integer
 *                     mensaje:
 *                       type: string
 *                     estado:
 *                       type: string
 *                       example: "pendiente"
 *                     fecha_solicitud:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ya tienes una solicitud pendiente con este doctor"
 *                 error:
 *                   type: string
 *       401:
 *         description: Usuario no autenticado
 */
router.post('/enviar', verifyToken, solicitudVinculacionController.enviarSolicitud);

/**
 * @swagger
 * /api/solicitudes/doctor/{doctor_id}/pendientes:
 *   get:
 *     summary: Obtener solicitudes pendientes para un doctor
 *     description: Retorna todas las solicitudes pendientes que ha recibido el doctor
 *     tags: [Solicitudes de Vinculación]
 *     parameters:
 *       - in: path
 *         name: doctor_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del doctor
 *         example: 7
 *     responses:
 *       200:
 *         description: Solicitudes obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Solicitudes obtenidas exitosamente."
 *                 solicitudes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       usuario_id:
 *                         type: integer
 *                       mensaje:
 *                         type: string
 *                       fecha_solicitud:
 *                         type: string
 *                         format: date-time
 *                       usuario_nombre:
 *                         type: string
 *                       usuario_correo:
 *                         type: string
 *                       usuario_imagen:
 *                         type: string
 *                 total:
 *                   type: integer
 *                   example: 3
 *       400:
 *         description: Error en los parámetros
 *       500:
 *         description: Error del servidor
 */
router.get('/doctor/:doctor_id/pendientes', verifyToken, solicitudVinculacionController.obtenerSolicitudesPendientes);

/**
 * @swagger
 * /api/solicitudes/mis-solicitudes:
 *   get:
 *     summary: Obtener solicitudes enviadas por el usuario
 *     description: Retorna todas las solicitudes que el usuario ha enviado a doctores
 *     tags: [Solicitudes de Vinculación]
 *     responses:
 *       200:
 *         description: Solicitudes obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Solicitudes obtenidas exitosamente."
 *                 solicitudes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       doctor_id:
 *                         type: integer
 *                       mensaje:
 *                         type: string
 *                       estado:
 *                         type: string
 *                         example: "pendiente"
 *                       fecha_solicitud:
 *                         type: string
 *                         format: date-time
 *                       fecha_respuesta:
 *                         type: string
 *                         format: date-time
 *                       doctor_nombre:
 *                         type: string
 *                       doctor_especialidad:
 *                         type: string
 *                 total:
 *                   type: integer
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/mis-solicitudes', verifyToken, solicitudVinculacionController.obtenerMisSolicitudes);

/**
 * @swagger
 * /api/solicitudes/{solicitud_id}/responder:
 *   post:
 *     summary: Doctor responde a una solicitud de vinculación
 *     description: Permite al doctor aceptar o rechazar una solicitud. Si acepta, automáticamente crea la vinculación.
 *     tags: [Solicitudes de Vinculación]
 *     parameters:
 *       - in: path
 *         name: solicitud_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud
 *         example: 15
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - respuesta
 *             properties:
 *               respuesta:
 *                 type: string
 *                 enum: [aceptada, rechazada]
 *                 description: Respuesta del doctor
 *                 example: "aceptada"
 *           examples:
 *             aceptar:
 *               summary: Aceptar solicitud
 *               value:
 *                 respuesta: "aceptada"
 *             rechazar:
 *               summary: Rechazar solicitud
 *               value:
 *                 respuesta: "rechazada"
 *     responses:
 *       200:
 *         description: Solicitud respondida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Solicitud aceptada. Juan Pérez es ahora tu paciente."
 *                 solicitud:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     estado:
 *                       type: string
 *                     fecha_respuesta:
 *                       type: string
 *                       format: date-time
 *                 vinculacion:
 *                   type: object
 *                   description: Datos de la vinculación creada (solo si fue aceptada)
 *                   nullable: true
 *       400:
 *         description: Error en la solicitud
 *       401:
 *         description: Doctor no autenticado
 */
router.post('/:solicitud_id/responder', verifyToken, solicitudVinculacionController.responderSolicitud);

/**
 * @swagger
 * /api/solicitudes/doctor/{doctor_id}/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de solicitudes del doctor
 *     description: Retorna un resumen de todas las solicitudes recibidas por el doctor
 *     tags: [Solicitudes de Vinculación]
 *     parameters:
 *       - in: path
 *         name: doctor_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del doctor
 *         example: 7
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Estadísticas obtenidas exitosamente."
 *                 estadisticas:
 *                   type: object
 *                   properties:
 *                     pendientes:
 *                       type: integer
 *                       example: 5
 *                     aceptadas:
 *                       type: integer
 *                       example: 12
 *                     rechazadas:
 *                       type: integer
 *                       example: 3
 *                     total:
 *                       type: integer
 *                       example: 20
 *       400:
 *         description: Error en los parámetros
 *       500:
 *         description: Error del servidor
 */
router.get('/doctor/:doctor_id/estadisticas', verifyToken, solicitudVinculacionController.obtenerEstadisticas);

module.exports = router;
