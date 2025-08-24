const express = require('express');
const router = express.Router();
const doctorPacienteController = require('../controllers/doctorPacienteController');

/**
 * @swagger
 * /api/doctor-paciente/vincular:
 *   post:
 *     summary: Vincula un doctor con un paciente
 *     tags: [Doctor-Paciente]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctor_id
 *               - paciente_id
 *             properties:
 *               doctor_id:
 *                 type: string
 *                 description: ID del doctor
 *                 example: "7"
 *               paciente_id:
 *                 type: string
 *                 description: ID del paciente
 *                 example: "12"
 *     responses:
 *       201:
 *         description: Vinculación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vinculación exitosa."
 *                 vinculo:
 *                   type: object
 *                   properties:
 *                     doctor_id:
 *                       type: string
 *                     paciente_id:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Error en la solicitud (campos faltantes)
 *       500:
 *         description: Error del servidor (vinculación ya existe, IDs inválidos, etc.)
 */
router.post('/vincular', doctorPacienteController.vincularDoctorPaciente);

/**
 * @swagger
 * /api/doctor-paciente/vincular-usuario:
 *   post:
 *     summary: Vincula un doctor con un usuario (creando paciente) o paciente existente
 *     description: |
 *       Esta función permite dos tipos de vinculación:
 *       1. **Crear paciente desde usuario**: Proporciona `doctor_id` y `usuario_id`. Si el usuario no es paciente, se convierte automáticamente en paciente.
 *       2. **Vincular paciente existente**: Proporciona `doctor_id` y `paciente_id` para vincular un paciente ya existente con otro doctor.
 *     tags: [Doctor-Paciente]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required:
 *                   - doctor_id
 *                   - usuario_id
 *                 properties:
 *                   doctor_id:
 *                     type: integer
 *                     description: ID del doctor que va a tener el paciente
 *                     example: 7
 *                   usuario_id:
 *                     type: integer
 *                     description: ID del usuario que será convertido en paciente
 *                     example: 15
 *               - type: object
 *                 required:
 *                   - doctor_id
 *                   - paciente_id
 *                 properties:
 *                   doctor_id:
 *                     type: integer
 *                     description: ID del doctor
 *                     example: 7
 *                   paciente_id:
 *                     type: integer
 *                     description: ID del paciente existente a vincular
 *                     example: 12
 *           examples:
 *             crear_paciente:
 *               summary: Convertir usuario en paciente
 *               value:
 *                 doctor_id: 7
 *                 usuario_id: 15
 *             vincular_paciente:
 *               summary: Vincular paciente existente
 *               value:
 *                 doctor_id: 7
 *                 paciente_id: 12
 *     responses:
 *       201:
 *         description: Vinculación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario convertido en paciente y vinculado exitosamente al doctor."
 *                 vinculo:
 *                   type: object
 *                   properties:
 *                     doctor_id:
 *                       type: integer
 *                     paciente_id:
 *                       type: integer
 *                 paciente_id:
 *                   type: integer
 *                   description: ID del paciente resultante
 *                 fue_creado_paciente:
 *                   type: boolean
 *                   description: Indica si se creó un nuevo registro de paciente
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Debe proporcionar (usuario_id) para crear paciente, o (paciente_id) para vincular paciente existente."
 *                 ejemplos:
 *                   type: object
 *                   properties:
 *                     crear_paciente:
 *                       type: object
 *                       example: { doctor_id: 1, usuario_id: 5 }
 *                     vincular_paciente_existente:
 *                       type: object
 *                       example: { doctor_id: 1, paciente_id: 3 }
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.post('/vincular-usuario', doctorPacienteController.vincularDoctorConUsuario);

/**
 * @swagger
 * /api/doctor-paciente/doctor/{doctor_id}/pacientes:
 *   get:
 *     summary: Obtiene todos los pacientes de un doctor
 *     tags: [Doctor-Paciente]
 *     parameters:
 *       - in: path
 *         name: doctor_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del doctor
 *         example: "7"
 *     responses:
 *       200:
 *         description: Lista de pacientes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Pacientes obtenidos exitosamente."
 *                 pacientes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       usuario_id:
 *                         type: string
 *                       nombre:
 *                         type: string
 *                       correo:
 *                         type: string
 *                       fecha_de_nacimiento:
 *                         type: string
 *                         format: date
 *                       numero_telefono:
 *                         type: string
 *                       sexo:
 *                         type: string
 *                       escolaridad:
 *                         type: string
 *                       domicilio:
 *                         type: string
 *                       codigo_postal:
 *                         type: string
 *                       imagen_url:
 *                         type: string
 *                       fecha_vinculacion:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: number
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error del servidor
 */
router.get('/doctor/:doctor_id/pacientes', doctorPacienteController.obtenerPacientesDeDoctor);

/**
 * @swagger
 * /api/doctor-paciente/paciente/{paciente_id}/doctores:
 *   get:
 *     summary: Obtiene todos los doctores de un paciente
 *     tags: [Doctor-Paciente]
 *     parameters:
 *       - in: path
 *         name: paciente_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del paciente
 *         example: "12"
 *     responses:
 *       200:
 *         description: Lista de doctores obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Doctores obtenidos exitosamente."
 *                 doctores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       usuario_id:
 *                         type: string
 *                       nombre:
 *                         type: string
 *                       correo:
 *                         type: string
 *                       fecha_de_nacimiento:
 *                         type: string
 *                         format: date
 *                       numero_telefono:
 *                         type: string
 *                       sexo:
 *                         type: string
 *                       especialidad:
 *                         type: string
 *                       domicilio:
 *                         type: string
 *                       codigo_postal:
 *                         type: string
 *                       imagen_url:
 *                         type: string
 *                       fecha_vinculacion:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: number
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error del servidor
 */
router.get('/paciente/:paciente_id/doctores', doctorPacienteController.obtenerDoctoresDePaciente);

/**
 * @swagger
 * /api/doctor-paciente/desvincular:
 *   delete:
 *     summary: Desvincula un doctor de un paciente
 *     tags: [Doctor-Paciente]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctor_id
 *               - paciente_id
 *             properties:
 *               doctor_id:
 *                 type: string
 *                 description: ID del doctor
 *                 example: "7"
 *               paciente_id:
 *                 type: string
 *                 description: ID del paciente
 *                 example: "12"
 *     responses:
 *       200:
 *         description: Desvinculación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Desvinculación exitosa."
 *                 vinculoEliminado:
 *                   type: object
 *                   properties:
 *                     doctor_id:
 *                       type: string
 *                     paciente_id:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Error en la solicitud (campos faltantes)
 *       500:
 *         description: Error del servidor (vinculación no existe)
 */
router.delete('/desvincular', doctorPacienteController.desvincularDoctorPaciente);

/**
 * @swagger
 * /api/doctor-paciente/vinculaciones:
 *   get:
 *     summary: Obtiene todas las vinculaciones doctor-paciente
 *     tags: [Doctor-Paciente]
 *     responses:
 *       200:
 *         description: Lista de todas las vinculaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vinculaciones obtenidas exitosamente."
 *                 vinculaciones:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       doctor_id:
 *                         type: string
 *                       paciente_id:
 *                         type: string
 *                       fecha_vinculacion:
 *                         type: string
 *                         format: date-time
 *                       doctor_nombre:
 *                         type: string
 *                       especialidad:
 *                         type: string
 *                       paciente_nombre:
 *                         type: string
 *                       escolaridad:
 *                         type: string
 *                 total:
 *                   type: number
 *       500:
 *         description: Error del servidor
 */
router.get('/vinculaciones', doctorPacienteController.obtenerTodasLasVinculaciones);

module.exports = router;
