const userModel = require('../models/User');
const { sendResetEmail } = require('../utils/emailService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Registra un nuevo usuario en el sistema.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} req.body - El cuerpo de la solicitud, que contiene los datos del nuevo usuario.
 * @param {object} res - El objeto de respuesta de Express.
 * @returns {object} Retorna el objeto del nuevo usuario creado o un mensaje de error.
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
 * Autentica un usuario en el sistema.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} req.body - El cuerpo de la solicitud.
 * @param {string} req.body.correo - Correo electrónico del usuario.
 * @param {string} req.body.contrasenia - Contraseña del usuario.
 * @param {object} res - El objeto de respuesta de Express.
 * @returns {object} Retorna los datos del usuario (sin contraseña) y el estado de la autenticación.
 */
const loginUser = async (req, res) => {
  try {
    const { correo, contrasenia } = req.body;
    const user = await userModel.loginUserMethod(correo);

    if (!user) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    }

    const validPassword = await bcrypt.compare(contrasenia, user.contrasenia);
    if (!validPassword) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    }

    // Removemos la contraseña del objeto de usuario
    const { contrasenia: _, ...userWithoutPassword } = user;

    // Generamos el token JWT
    const token = jwt.sign(
      { 
        id: user.usuario_id,
        email: user.correo,
        role: user.rol // Si tienes roles en tu sistema
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      success: true,
      message: 'Inicio de sesión exitoso.',
      token,
      user: userWithoutPassword 
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
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} req.body - El cuerpo de la solicitud.
 * @param {string} req.body.correo - Correo electrónico del usuario.
 * @param {object} res - El objeto de respuesta de Express.
 * @returns {object} Mensaje genérico por seguridad, no indica si el correo existe.
 * @description En modo desarrollo, retorna el token y URL de restablecimiento.
 *              En producción, envía un correo electrónico al usuario.
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
          resetUrl: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
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
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} req.body - El cuerpo de la solicitud.
 * @param {string} req.body.token - Token de restablecimiento.
 * @param {string} req.body.newPassword - Nueva contraseña del usuario.
 * @param {object} res - El objeto de respuesta de Express.
 * @returns {object} Mensaje de éxito o error en el restablecimiento.
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

module.exports = {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword
};