const userModel = require('../models/User');
const { sendResetEmail } = require('../utils/emailService');
const bcrypt = require('bcrypt');

//CONTROLADOR PARA REGISTRARSE
const registerUser = async (req, res) => {
  try {
    const nuevoUsuario = await userModel.createUser(req.body);
    return res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    return res.status(400).json({ message: error.message });
  }
};

//CONTROLADOR PARA INICIAR SESION
const loginUser = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;
    const user = await userModel.loginUserMethod(correo);

    if (!user || user.contraseña !== contraseña) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    }

    const { contraseña: _, ...userWithoutPassword } = user;

    res.status(200).json({ message: 'Inicio de sesión exitoso.', user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión.', error: error.message });
  }
};

// Solicitar restablecimiento de contraseña
const requestPasswordReset = async (req, res) => {
  try {
    const { correo } = req.body;
    const user = await userModel.loginUserMethod(correo);

    if (!user) {
      // Por seguridad, no revelar si el correo existe o no
      return res.status(200).json({ 
        message: 'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.' 
      });
    }

    const resetToken = await userModel.setResetToken(user.id);
    await sendResetEmail(correo, resetToken);

    res.status(200).json({ 
      message: 'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.' 
    });
  } catch (error) {
    console.error('Error al solicitar restablecimiento de contraseña:', error);
    res.status(500).json({ 
      message: 'Error al procesar la solicitud de restablecimiento de contraseña.' 
    });
  }
};

// Validar token y restablecer contraseña
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await userModel.validateResetToken(token);

    if (!user) {
      return res.status(400).json({ 
        message: 'El token de restablecimiento es inválido o ha expirado.' 
      });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(user.id, hashedPassword);

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
