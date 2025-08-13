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
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample.token"
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
 *             examples:
 *               success:
 *                 summary: Ejemplo exitoso
 *                 value:
 *                   success: true
 *                   message: "Inicio de sesión exitoso."
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample.token"
 *                   user:
 *                     usuario_id: "123"
 *                     nombre: "Juan Pérez"
 *                     correo: "juan@ejemplo.com"
 *                     fecha_de_nacimiento: "1990-01-01"
 *                     numero_telefono: "5512345678"
 *                     sexo: "Masculino"
 *                     tipo: "Doctor"
 *                     imagen_url: "https://res.cloudinary.com/demo/image/upload/v1/usuarios/u123.jpg"
 *                     imagen_id: "usuarios/u123"
 *                     especialidad: "Cardiología"
 *                     domicilio: "Av. Principal 123, Col. Centro"
 *                     codigo_postal: "12345"
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
 *               correo:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *           example:
 *             correo: "usuario@ejemplo.com"
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
 *     summary: Lista todos los doctores (con paginación)
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
 *         description: Lista de doctores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedDoctorsResponse'
 *             examples:
 *               success:
 *                 summary: Página con resultados
 *                 value:
 *                   page: 1
 *                   limit: 10
 *                   total: 2
 *                   count: 2
 *                   doctors:
 *                     - usuario_id: "d1"
 *                       nombre: "Dra. Ana López"
 *                       correo: "ana@ejemplo.com"
 *                       fecha_de_nacimiento: "1985-03-22"
 *                       numero_telefono: "5512345678"
 *                       sexo: "Femenino"
 *                       tipo: "Doctor"
 *                       imagen_url: "https://res.cloudinary.com/demo/image/upload/v1/usuarios/d1.jpg"
 *                       imagen_id: "usuarios/d1"
 *                       especialidad: "Neurología"
 *                       domicilio: "Av. Reforma 100"
 *                       codigo_postal: "06000"
 *                     - usuario_id: "d2"
 *                       nombre: "Dr. Carlos Pérez"
 *                       correo: "carlos@ejemplo.com"
 *                       fecha_de_nacimiento: "1980-09-10"
 *                       numero_telefono: "5598765432"
 *                       sexo: "Masculino"
 *                       tipo: "Doctor"
 *                       imagen_url: null
 *                       imagen_id: null
 *                       especialidad: "Pediatría"
 *                       domicilio: "Insurgentes Sur 200"
 *                       codigo_postal: "03100"
 *               empty:
 *                 summary: Sin resultados
 *                 value:
 *                   page: 1
 *                   limit: 10
 *                   total: 0
 *                   count: 0
 *                   doctors: []
 *                   message: "No hay doctores registrados."
 */
router.get('/auth/doctors', verifyToken, directoryController.getDoctors);

/**
 * @swagger
 * /api/auth/patients:
 *   get:
 *     summary: Lista todos los pacientes (con paginación)
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
 *         description: Lista de pacientes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedPatientsResponse'
 *             examples:
 *               success:
 *                 summary: Página con resultados
 *                 value:
 *                   page: 1
 *                   limit: 10
 *                   total: 2
 *                   count: 2
 *                   patients:
 *                     - usuario_id: "p1"
 *                       nombre: "María Gómez"
 *                       correo: "maria@ejemplo.com"
 *                       fecha_de_nacimiento: "2010-05-14"
 *                       numero_telefono: "5588887777"
 *                       sexo: "Femenino"
 *                       tipo: "Paciente"
 *                       imagen_url: "https://res.cloudinary.com/demo/image/upload/v1/usuarios/p1.jpg"
 *                       imagen_id: "usuarios/p1"
 *                       escolaridad: "Primaria"
 *                       domicilio: "Calle 1 #123"
 *                       codigo_postal: "07700"
 *                     - usuario_id: "p2"
 *                       nombre: "Juan Ruiz"
 *                       correo: "juan@ejemplo.com"
 *                       fecha_de_nacimiento: "2008-11-02"
 *                       numero_telefono: "5577778888"
 *                       sexo: "Masculino"
 *                       tipo: "Paciente"
 *                       imagen_url: null
 *                       imagen_id: null
 *                       escolaridad: "Secundaria"
 *                       domicilio: "Calle 2 #456"
 *                       codigo_postal: "07800"
 *               empty:
 *                 summary: Sin resultados
 *                 value:
 *                   page: 1
 *                   limit: 10
 *                   total: 0
 *                   count: 0
 *                   patients: []
 *                   message: "No hay pacientes registrados."
 */
router.get('/auth/patients', verifyToken, directoryController.getPatients);

/**
 * @swagger
 * /api/auth/doctor-patient-links:
 *   get:
 *     summary: Lista vínculos doctor-paciente (con paginación)
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
 *         description: Lista de vínculos con información básica de doctor y paciente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedLinksResponse'
 *             examples:
 *               success:
 *                 summary: Página con resultados
 *                 value:
 *                   page: 1
 *                   limit: 10
 *                   total: 2
 *                   count: 2
 *                   links:
 *                     - doctor_id: "d1"
 *                       paciente_id: "p1"
 *                       doctor_nombre: "Dra. Ana López"
 *                       doctor_correo: "ana@ejemplo.com"
 *                       doctor_imagen_url: "https://res.cloudinary.com/demo/image/upload/v1/usuarios/d1.jpg"
 *                       doctor_especialidad: "Neurología"
 *                       paciente_nombre: "María Gómez"
 *                       paciente_correo: "maria@ejemplo.com"
 *                       paciente_imagen_url: "https://res.cloudinary.com/demo/image/upload/v1/usuarios/p1.jpg"
 *                       paciente_escolaridad: "Primaria"
 *                     - doctor_id: "d2"
 *                       paciente_id: "p2"
 *                       doctor_nombre: "Dr. Carlos Pérez"
 *                       doctor_correo: "carlos@ejemplo.com"
 *                       doctor_imagen_url: null
 *                       doctor_especialidad: "Pediatría"
 *                       paciente_nombre: "Juan Ruiz"
 *                       paciente_correo: "juan@ejemplo.com"
 *                       paciente_imagen_url: null
 *                       paciente_escolaridad: "Secundaria"
 *               empty:
 *                 summary: Sin resultados
 *                 value:
 *                   page: 1
 *                   limit: 10
 *                   total: 0
 *                   count: 0
 *                   links: []
 *                   message: "No hay vínculos doctor-paciente registrados."
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedUsersResponse'
 *             examples:
 *               success:
 *                 summary: Página con resultados
 *                 value:
 *                   page: 1
 *                   limit: 10
 *                   total: 2
 *                   count: 2
 *                   users:
 *                     - usuario_id: "d1"
 *                       nombre: "Dra. Ana López"
 *                       correo: "ana@ejemplo.com"
 *                       fecha_de_nacimiento: "1985-03-22"
 *                       numero_telefono: "5512345678"
 *                       sexo: "Femenino"
 *                       tipo: "Doctor"
 *                       imagen_url: "https://res.cloudinary.com/demo/image/upload/v1/usuarios/d1.jpg"
 *                       imagen_id: "usuarios/d1"
 *                       doctor_especialidad: "Neurología"
 *                       domicilio: "Av. Reforma 100"
 *                       codigo_postal: "06000"
 *                     - usuario_id: "p1"
 *                       nombre: "María Gómez"
 *                       correo: "maria@ejemplo.com"
 *                       fecha_de_nacimiento: "2010-05-14"
 *                       numero_telefono: "5588887777"
 *                       sexo: "Femenino"
 *                       tipo: "Paciente"
 *                       imagen_url: "https://res.cloudinary.com/demo/image/upload/v1/usuarios/p1.jpg"
 *                       imagen_id: "usuarios/p1"
 *                       paciente_escolaridad: "Primaria"
 *                       domicilio: "Calle 1 #123"
 *                       codigo_postal: "07700"
 *               empty:
 *                 summary: Sin resultados
 *                 value:
 *                   page: 1
 *                   limit: 10
 *                   total: 0
 *                   count: 0
 *                   users: []
 *                   message: "No hay usuarios registrados."
 */
router.get('/auth/users', verifyToken, directoryController.getAllUsers);



module.exports = router;