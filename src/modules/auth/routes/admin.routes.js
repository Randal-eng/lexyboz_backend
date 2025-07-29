const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

/**
 * @swagger
 * /api/auth/registrar-admin:
 *   post:
 *     summary: Registra un nuevo administrador
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del administrador
 *               email:
 *                 type: string
 *                 description: Correo electrónico del administrador
 *               password:
 *                 type: string
 *                 description: Contraseña del administrador
 *     responses:
 *       201:
 *         description: Administrador registrado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/auth/registrar-admin', adminController.registrarAdmin);

module.exports = router;
