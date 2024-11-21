const adminModel = require('../models/adminModel');

const registrarAdmin = async (req, res) => {
    try {
        const { nombre, correo, contraseña, nombre_usuario } = req.body;

        // Verifica si el correo ya está registrado
        const usuarioExistente = await adminModel.findAdminByEmail(correo);
        if (usuarioExistente) {
            return res.status(409).json({ message: 'El correo ya está registrado.' });
        }

        // Crear administrador
        const nuevoAdmin = await adminModel.createAdmin({ nombre, correo, contraseña, nombre_usuario });
        return res.status(201).json(nuevoAdmin);
    } catch (error) {
        console.error('Error al registrar el administrador:', error.message);
        return res.status(500).json({ message: 'Error al registrar el administrador.', error: error.message });
    }
};

module.exports = { registrarAdmin };
