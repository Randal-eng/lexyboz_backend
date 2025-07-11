const userModel = require('../models/User');

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

module.exports = {
  registerUser,
  loginUser,
};
