const express = require('express');
const router = express.Router();
const fs = require('fs');
const authController = require('../controllers/authController');
const upload = require('../../../../middleware');

// Registrarse e Iniciar sesiones

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
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       400:
 *         description: Error en la solicitud
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del usuario
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error en la solicitud
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
router.post('/auth/reset-password', authController.resetPassword);



module.exports = router;