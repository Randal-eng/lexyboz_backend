const express = require('express');
const router = express.Router();
const fs = require('fs');
const authController = require('../controllers/authController');
const directoryController = require('../controllers/directoryController');
const upload = require('../../../../middleware');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * Rutas de autenticación
 * @module routes/auth
 */

/**
 * Endpoints de autenticación y gestión de usuarios
 * @namespace AuthRoutes
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión de un usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - contrasenia
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "usuario@ejemplo.com"
 *               contrasenia:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Inicio de sesión exitoso"
 *                 user:
 *                   type: object
 *                   properties:
 *                     usuario_id:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                     correo:
 *                       type: string
 *                     fecha_de_nacimiento:
 *                       type: string
 *                       format: date
 *                     numero_telefono:
 *                       type: string
 *                     sexo:
 *                       type: string
 *                     tipo:
 *                       type: string
 *                     imagen_url:
 *                       type: string
 *                     imagen_id:
 *                       type: string
 *                     especialidad:
 *                       type: string
 *                       description: Solo para doctores
 *                     escolaridad:
 *                       type: string
 *                       description: Solo para pacientes
 *                     domicilio:
 *                       type: string
 *                       description: Para doctores y pacientes
 *                     codigo_postal:
 *                       type: string
 *                       description: Para doctores y pacientes
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error del servidor
 */
/**
 * Ruta para iniciar sesión
 * @name POST /auth/login
 * @function
 * @memberof AuthRoutes
 * @param {string} req.body.correo - Correo electrónico del usuario
 * @param {string} req.body.contrasenia - Contraseña del usuario (se comparará con la versión encriptada)
 * @returns {object} Datos del usuario autenticado (excluyendo la contraseña) y token de sesión
 */
router.post('/auth/login', authController.loginUser);
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - correo
 *               - contrasenia
 *               - fecha_de_nacimiento
 *               - numero_telefono
 *               - sexo
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre completo del usuario
 *                 example: "Juan Pérez"
 *               correo:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "juan@ejemplo.com"
 *               contrasenia:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario (será encriptada)
 *                 minLength: 6
 *               fecha_de_nacimiento:
 *                 type: string
 *                 format: date
 *                 description: Fecha de nacimiento (formato ISO)
 *                 example: "1990-01-01"
 *               numero_telefono:
 *                 type: string
 *                 pattern: ^[0-9]{10}$
 *                 description: Número telefónico (10 dígitos)
 *                 example: "1234567890"
 *               sexo:
 *                 type: string
 *                 enum: [Masculino, Femenino, Otro]
 *                 description: Género del usuario
 *               tipo:
 *                 type: string
 *                 enum: [Usuario, Doctor, Paciente]
 *                 default: Usuario
 *                 description: Tipo de usuario
 *               especialidad:
 *                 type: string
 *                 description: Especialidad médica (requerido si tipo es Doctor)
 *               escolaridad:
 *                 type: string
 *                 description: Nivel de escolaridad (requerido si tipo es Paciente)
 *               domicilio:
 *                 type: string
 *                 description: Dirección completa (requerido para Doctor y Paciente)
 *               codigo_postal:
 *                 type: string
 *                 pattern: ^[0-9]{5}$
 *                 description: Código postal (requerido para Doctor y Paciente)
 *               imagen:
 *                 type: string
 *                 format: binary
 *                 description: Imagen de perfil del usuario (JPEG, PNG o GIF, máx. 5MB)
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     usuario_id:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                     correo:
 *                       type: string
 *                     imagen_url:
 *                       type: string
 *                     tipo:
 *                       type: string
 *       400:
 *         description: Error de validación o datos incorrectos
 *       500:
 *         description: Error del servidor
 */
/**
 * Ruta para registrar un nuevo usuario
 * @name POST /auth/register
 * @function
 * @memberof AuthRoutes
 * @param {object} req.body - Datos del usuario
 * @param {string} req.body.nombre - Nombre completo del usuario
 * @param {string} req.body.correo - Correo electrónico
 * @param {string} req.body.contrasenia - Contraseña (será encriptada antes de almacenarse)
 * @param {string} req.body.fecha_de_nacimiento - Fecha de nacimiento (formato ISO)
 * @param {string} req.body.numero_telefono - Número telefónico (10 dígitos)
 * @param {string} req.body.sexo - Género ('Masculino', 'Femenino', 'Otro')
 * @param {string} req.body.tipo - Tipo de usuario ('Usuario', 'Doctor', 'Paciente')
 * @param {string} [req.body.especialidad] - Especialidad (requerido para Doctores)
 * @param {string} [req.body.escolaridad] - Escolaridad (requerido para Pacientes)
 * @param {string} [req.body.domicilio] - Dirección (para Doctores y Pacientes)
 * @param {string} [req.body.codigo_postal] - Código postal (para Doctores y Pacientes)
 * @param {File} [req.file] - Imagen de perfil (procesada por multer)
 * @returns {object} Usuario creado con sus datos (excluyendo la contraseña)
 */
router.post('/auth/register', upload.single('imagen'), async (req, res) => {
    try {
        if (req.fileValidationError) {
            return res.status(400).json({ message: req.fileValidationError });
        }

        const nuevoUsuario = await authController.registerUser(req, res);
        return nuevoUsuario;
    } catch (error) {
        return res.status(500).json({
            message: 'Error en el servidor',
            error: error.message
        });
    }
});
/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicita restablecimiento de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *     responses:
 *       200:
 *         description: Solicitud de restablecimiento enviada
 *       400:
 *         description: Error en la solicitud
 */
/**
 * Ruta para solicitar restablecimiento de contraseña
 * @name POST /auth/forgot-password
 * @function
 * @memberof AuthRoutes
 * @param {object} req.body - Datos de la solicitud
 * @param {string} req.body.correo - Correo electrónico del usuario
 * @returns {object} Mensaje genérico por seguridad
 * @description En desarrollo retorna el token directamente, en producción envía un correo
 */
router.post('/auth/forgot-password', authController.requestPasswordReset);
/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Restablece la contraseña del usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de restablecimiento
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *       400:
 *         description: Error en la solicitud
 */
/**
 * Ruta para restablecer la contraseña
 * @name POST /auth/reset-password
 * @function
 * @memberof AuthRoutes
 * @param {object} req.body - Datos para el restablecimiento
 * @param {string} req.body.token - Token de restablecimiento válido
 * @param {string} req.body.newPassword - Nueva contraseña (será encriptada)
 * @returns {object} Mensaje de éxito o error
 */
router.post('/auth/reset-password', authController.resetPassword);

/**
 * @swagger
 * /api/auth/doctors:
 *   get:
 *     summary: Lista todos los doctores
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de doctores
 */
router.get('/auth/doctors', verifyToken, directoryController.getDoctors);

/**
 * @swagger
 * /api/auth/patients:
 *   get:
 *     summary: Lista todos los pacientes
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pacientes
 */
router.get('/auth/patients', verifyToken, directoryController.getPatients);

/**
 * @swagger
 * /api/auth/doctor-patient-links:
 *   get:
 *     summary: Lista vínculos doctor-paciente
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vínculos con información básica de doctor y paciente
 */
router.get('/auth/doctor-patient-links', verifyToken, directoryController.getDoctorPatientLinks);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Lista todos los usuarios (con paginación)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Página a retornar (por defecto 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Tamaño de página (por defecto 10, máx 100)
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/auth/users', verifyToken, directoryController.getAllUsers);



module.exports = router;