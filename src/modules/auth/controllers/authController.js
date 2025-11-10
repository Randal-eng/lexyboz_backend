const userModel = require('../models/User');
const { sendResetEmail } = require('../utils/emailService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * @fileoverview Controlador de autenticación y gestión de usuarios
 * @module AuthController
 * @requires '../models/User'
 * @requires '../utils/emailService'
 * @requires 'bcrypt'
 * @requires 'jsonwebtoken'
 */

/**
 * Registra un nuevo usuario en el sistema.
 * @async
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} req.body - El cuerpo de la solicitud con los datos del usuario.
 * @param {string} req.body.nombre - Nombre completo del usuario.
 * @param {string} req.body.correo - Correo electrónico del usuario.
 * @param {string} req.body.contrasenia - Contraseña del usuario (será encriptada).
 * @param {string} req.body.fecha_de_nacimiento - Fecha de nacimiento (YYYY-MM-DD).
 * @param {string} req.body.numero_telefono - Número telefónico.
 * @param {string} req.body.sexo - Género del usuario.
 * @param {object} [req.file] - Archivo de imagen del usuario (opcional).
 * @param {object} res - El objeto de respuesta de Express.
 * @returns {Promise<object>} Objeto con los datos del usuario creado.
 * @throws {Error} Si hay un error en la validación o creación del usuario.
 */
const registerUser = async (req, res) => {
    try {
        console.log('Datos recibidos en el controlador:', req.body);
        const nuevoUsuario = await userModel.createUser(req.body, req.file);
        return res.status(201).json(nuevoUsuario);
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Autentica un usuario y genera un token JWT.
 * @async
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} req.body - El cuerpo de la solicitud.
 * @param {string} req.body.correo - Correo electrónico del usuario.
 * @param {string} req.body.contrasenia - Contraseña del usuario.
 * @param {object} res - El objeto de respuesta de Express.
 * @returns {Promise<object>} Objeto con el token JWT y datos del usuario.
 * @throws {Error} Si las credenciales son inválidas o hay un error en el servidor.
 * @example
 * // Respuesta exitosa:
 * {
 *   success: true,
 *   message: 'Inicio de sesión exitoso.',
 *   token: 'eyJhbGciOiJIUzI1NiIs...', // Token JWT válido por 24 horas
 *   user: {
 *     usuario_id: '123',
 *     correo: 'usuario@ejemplo.com',
 *     rol: 'usuario',
 *     // otros datos del usuario sin la contraseña
 *   }
 * }
 * 
 * // Respuesta de error:
 * {
 *   success: false,
 *   message: 'Correo o contraseña incorrectos.'
 * }
 */
const loginUser = async (req, res) => {
  try {
    const { correo, contrasenia } = req.body;
    
    // Primero intentar login como usuario normal
    let user = await userModel.loginUserMethod(correo);
    let isAdmin = false;
    
    // Si no se encuentra como usuario, intentar como administrador
    if (!user) {
      const adminModel = require('../models/Admin');
      const admin = await adminModel.findAdminByEmail(correo);
      if (admin) {
        user = admin;
        isAdmin = true;
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    }

    // Para admins, la contraseña no está encriptada, para usuarios sí
    let validPassword;
    if (isAdmin) {
      validPassword = contrasenia === user.contraseña;
    } else {
      validPassword = await bcrypt.compare(contrasenia, user.contrasenia);
    }
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    }

    // Removemos la contraseña del objeto
    const { contrasenia: _, contraseña: __, ...userWithoutPassword } = user;

    // Generamos el token JWT
    const tokenPayload = isAdmin ? {
      id: user.id,
      email: user.correo,
      role: 'admin',
      nombre_usuario: user.nombre_usuario
    } : {
      id: user.usuario_id,
      email: user.correo,
      role: user.tipo
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Respuesta diferente para admin y usuario
    const responseData = isAdmin ? {
      ...userWithoutPassword,
      admin_id: user.id,
      tipo: 'admin'
    } : {
      ...userWithoutPassword,
      usuario_id: user.usuario_id,
      tipo_id: user.doctor_id || user.paciente_id || null
    };

    res.status(200).json({ 
      success: true,
      message: 'Inicio de sesión exitoso.',
      token,
      user: responseData
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al iniciar sesión.', 
      error: error.message 
    });
  }
};
/**
 * Inicia el proceso de restablecimiento de contraseña.
 * @async
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} req.body - El cuerpo de la solicitud.
 * @param {string} req.body.correo - Correo electrónico del usuario.
 * @param {object} res - El objeto de respuesta de Express.
 * @returns {Promise<object>} Mensaje de confirmación y detalles adicionales en modo desarrollo.
 * @throws {Error} Si hay un error al enviar el correo o procesar la solicitud.
 * @example
 * // Respuesta en producción:
 * {
 *   message: 'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.'
 * }
 * 
 * // Respuesta en desarrollo:
 * {
 *   message: 'Se ha enviado un correo con las instrucciones. (Modo desarrollo)',
 *   resetToken: 'token123...',
 *   resetUrl: 'http://localhost:3500/reset-password/token123...'
 * }
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { correo } = req.body;
    // Usamos findUserByEmail en lugar de loginUserMethod para obtener el ID
    const user = await userModel.findUserByEmail(correo);

    if (!user) {
      // Por seguridad, no revelar si el correo existe o no
      return res.status(200).json({
        message: 'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.'
      });
    }

    // Usamos usuario_id en lugar de id
    const resetToken = await userModel.setResetToken(user.usuario_id);

    console.log('Intentando enviar correo de restablecimiento...');

    try {
      // Intentar enviar el correo
      await sendResetEmail(correo, resetToken);
      
      // En desarrollo, incluimos el token en la respuesta
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        console.log('Modo desarrollo: Token generado -', resetToken);
        return res.status(200).json({
          message: 'Se ha enviado un correo con las instrucciones. (Modo desarrollo)',
          resetToken: resetToken,
          resetUrl: `${process.env.FRONTEND_ORIGIN}/reset-password/${resetToken}`
        });
      }

      // En producción, solo confirmamos el envío
      return res.status(200).json({
        message: 'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.'
      });
    } catch (emailError) {
      console.error('Error detallado al enviar el correo:', emailError);
      
      // En desarrollo, mostramos más detalles del error
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        return res.status(500).json({
          message: 'Error al enviar el correo',
          error: emailError.message,
          resetToken: resetToken // Incluimos el token para pruebas
        });
      }

      // En producción, mensaje genérico
      return res.status(200).json({
        message: 'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.'
      });
    }
  } catch (error) {
    console.error('Error al solicitar restablecimiento de contraseña:', error);
    res.status(500).json({
      message: 'Error al procesar la solicitud de restablecimiento de contraseña.'
    });
  }
};

/**
 * Restablece la contraseña del usuario usando un token válido.
 * @async
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} req.body - El cuerpo de la solicitud.
 * @param {string} req.body.token - Token de restablecimiento generado previamente.
 * @param {string} req.body.newPassword - Nueva contraseña del usuario.
 * @param {object} res - El objeto de respuesta de Express.
 * @returns {Promise<object>} Mensaje de confirmación del cambio de contraseña.
 * @throws {Error} Si el token es inválido o ha expirado.
 * @example
 * // Respuesta exitosa:
 * {
 *   message: 'Contraseña actualizada exitosamente.'
 * }
 * 
 * // Respuesta de error:
 * {
 *   message: 'El token de restablecimiento es inválido o ha expirado.'
 * }
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await userModel.validateResetToken(token);

    if (!user) {
      return res.status(400).json({
        message: 'El token de restablecimiento es inválido o ha expirado.'
      });
    }

    // Guardamos la contraseña directamente sin encriptar
    await userModel.updatePassword(user.usuario_id, newPassword);

    res.status(200).json({
      message: 'Contraseña actualizada exitosamente.'
    });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({
      message: 'Error al restablecer la contraseña.'
    });
  }
};

/**
 * Actualiza los datos del usuario, incluyendo foto de perfil
 */
const updateUserProfile = async (req, res) => {
  try {
    // Helper function para obtener el ID del usuario (funciona tanto para usuarios como admins)
    const getUserId = (user) => {
        return user.role === 'admin' ? user.id : user.usuario_id;
    };
    
    const userId = req.params.id || getUserId(req.user);
    const updateData = req.body;
    
    // Solo admin puede actualizar otros usuarios
    if (req.user.role !== 'admin' && req.params.id && parseInt(req.params.id) !== getUserId(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar este usuario'
      });
    }
    
    const updatedUser = await userModel.updateUser(userId, updateData, req.file);
    
    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    console.error('Datos recibidos:', req.body);
    console.error('Usuario ID:', req.params.id);
    console.error('Usuario del token:', req.user);
    
    res.status(400).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  requestPasswordReset,
  resetPassword
};