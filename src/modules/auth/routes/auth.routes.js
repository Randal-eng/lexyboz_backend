const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// Registrarse e Iniciar sesiones
router.post('/auth/login', authController.loginUser);
router.post('/auth/register', authController.registerUser);
router.post('/auth/forgot-password', authController.requestPasswordReset);
router.post('/auth/reset-password', authController.resetPassword);



module.exports = router;