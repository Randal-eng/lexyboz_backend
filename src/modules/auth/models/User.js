const Joi = require('joi');
const pool = require('../../../db/connection');
const cloudinary = require('../../../config/cloudinary/cloudinaryConfig');

const userSchema = Joi.object({
    nombre: Joi.string().min(3).max(100).required(),
    correo: Joi.string().email().required(),
    contrasenia: Joi.string().min(6).max(100).required(),
    fecha_de_nacimiento: Joi.date().iso().required(),
    numero_telefono: Joi.string().pattern(/^\d{10}$/).required(),
    sexo: Joi.string().valid('Masculino', 'Femenino', 'Otro').required(),
    tipo: Joi.string().valid('Usuario', 'Doctor', 'Paciente').required(),
    imagen_url: Joi.string().uri().allow(null, ''),
    imagen_id: Joi.string().allow(null, ''),
    escolaridad: Joi.string().allow(null, '').when('tipo', { is: 'Paciente', then: Joi.required() }),
    especialidad: Joi.string().allow(null, '').when('tipo', { is: 'Doctor', then: Joi.required() }),
    domicilio: Joi.string().allow(null, '').when('tipo', {
        is: Joi.valid('Doctor', 'Paciente'),
        then: Joi.required()
    }),
    codigo_postal: Joi.string().pattern(/^\d{5}$/).allow(null, '').when('tipo', {
        is: Joi.valid('Doctor', 'Paciente'),
        then: Joi.required()
    }),
});

const validateUser = (user) => {
    const { error } = userSchema.validate(user);
    if (error) {
        throw new Error(`Error de validación: ${error.details[0].message}`);
    }
};

const generateResetToken = () => {
    return require('crypto').randomBytes(32).toString('hex');
};

const setResetToken = async (userId) => {
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // Token válido por 1 hora

    const query = `
        UPDATE Usuario 
        SET reset_token = $1, reset_token_expiry = $2
        WHERE usuario_id = $3
        RETURNING *;
    `;

    try {
        const result = await pool.query(query, [resetToken, resetTokenExpiry, userId]);
        if (result.rows.length === 0) {
            throw new Error('Usuario no encontrado');
        }
        return resetToken;
    } catch (error) {
        console.error('Error en setResetToken:', error);
        throw new Error('Error al generar el token de restablecimiento');
    }
};

const validateResetToken = async (token) => {
    const query = `
        SELECT usuario_id FROM Usuario 
        WHERE reset_token = $1 
        AND reset_token_expiry > NOW()
        LIMIT 1;
    `;

    try {
        const result = await pool.query(query, [token]);
        return result.rows[0];
    } catch (error) {
        throw new Error('Token inválido o expirado');
    }
};

const updatePassword = async (userId, newPassword) => {
    const query = `
        UPDATE Usuario 
        SET contraseña = $1, reset_token = NULL, reset_token_expiry = NULL
        WHERE usuario_id = $2
        RETURNING *;
    `;

    try {
        const result = await pool.query(query, [newPassword, userId]);
        return result.rows[0];
    } catch (error) {
        throw new Error('Error al actualizar la contraseña');
    }
};

const createUser = async (user, imagen) => {
    if (!user.tipo) {
        user.tipo = "Usuario";
    }
    validateUser(user);

    let imagen_url = null;
    let imagen_id = null;

    if (imagen) {
        try {
            console.log('Intentando subir imagen:', {
                tieneBuffer: !!imagen.buffer,
                mimetype: imagen.mimetype,
                size: imagen.size
            });

            // Crear una promesa para manejar upload_stream
            const uploadPromise = new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'usuarios',
                        width: 300,
                        crop: "scale"
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );

                // Crear un buffer desde el archivo
                const buffer = imagen.buffer;
                uploadStream.end(buffer);
            });

            // Esperar a que se complete la subida
            const resultado = await uploadPromise;
            imagen_url = resultado.secure_url;
            imagen_id = resultado.public_id;

            console.log('Resultado de Cloudinary:', {
                url: imagen_url,
                id: imagen_id
            });
        } catch (error) {
            console.error('Error detallado de Cloudinary:', error);
            throw new Error('Error al subir la imagen: ' + error.message);
        }
    }

    const {
        nombre,
        correo,
        contrasenia,
        fecha_de_nacimiento,
        numero_telefono,
        sexo,
        tipo = 'Usuario',
        especialidad,
        domicilio,
        codigo_postal,
        escolaridad
    } = user;

    const userQuery = `
    INSERT INTO Usuario (nombre, correo, contrasenia, fecha_de_nacimiento, numero_telefono, sexo, tipo, imagen_url, imagen_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
`;
    const userValues = [
        nombre, correo, contrasenia, fecha_de_nacimiento,
        numero_telefono, sexo, tipo, imagen_url, imagen_id
    ];
    const userResult = await pool.query(userQuery, userValues);
    const usuario = userResult.rows[0];

    if (tipo === 'Doctor') {
        const doctorQuery = `
            INSERT INTO Doctor (usuario_ID, especialidad, domicilio, codigo_postal)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const doctorValues = [usuario.usuario_id, especialidad, domicilio, codigo_postal];
        const doctorResult = await pool.query(doctorQuery, doctorValues);
        return { ...usuario, doctor: doctorResult.rows[0] };
    }

    if (tipo === 'Paciente') {
        const pacienteQuery = `
            INSERT INTO Paciente (usuario_ID, escolaridad, domicilio, codigo_postal)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const pacienteValues = [usuario.usuario_id, escolaridad, domicilio, codigo_postal];
        const pacienteResult = await pool.query(pacienteQuery, pacienteValues);
        return { ...usuario, paciente: pacienteResult.rows[0] };
    }

    return usuario;
};

const findUserByEmail = async (correo) => {
    const query = `SELECT * FROM Usuario WHERE correo = $1;`;
    const result = await pool.query(query, [correo]);
    return result.rows[0];
};

const loginUserMethod = async (correo) => {
    const query = 'SELECT correo, contrasenia, tipo FROM Usuario WHERE correo = $1;';
    const result = await pool.query(query, [correo]);

    return result.rows[0];
};

module.exports = {
    createUser,
    findUserByEmail,
    loginUserMethod,
    setResetToken,
    validateResetToken,
    updatePassword
};