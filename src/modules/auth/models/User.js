const Joi = require('joi');
const pool = require('../../../db/connection');
const cloudinary = require('../../../config/cloudinary/cloudinaryConfig');
const bcrypt = require('bcrypt');

/**
 * Esquema de validación para usuarios usando Joi.
 * Define las reglas de validación para cada campo del usuario.
 */
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
    domicilio: Joi.string().required(),
    codigo_postal: Joi.string().pattern(/^\d{5}$/).required(),
});

/**
 * Valida los datos del usuario contra el esquema definido.
 * @param {Object} user - Objeto con los datos del usuario a validar
 * @throws {Error} Si la validación falla, lanza un error con el mensaje de validación
 */
const validateUser = (user) => {
    const { error } = userSchema.validate(user);
    if (error) {
        throw new Error(`Error de validación: ${error.details[0].message}`);
    }
};

/**
 * Genera un token aleatorio para el restablecimiento de contraseña.
 * @returns {string} Token hexadecimal de 64 caracteres
 */
const generateResetToken = () => {
    return require('crypto').randomBytes(32).toString('hex');
};

/**
 * Genera y guarda un token de restablecimiento de contraseña para un usuario.
 * @param {string} userId - ID del usuario
 * @returns {Promise<string>} Token generado
 * @throws {Error} Si el usuario no existe o hay un error al generar el token
 */
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

/**
 * Valida un token de restablecimiento de contraseña.
 * @param {string} token - Token de restablecimiento
 * @returns {Promise<Object|null>} Datos del usuario si el token es válido, null si no lo es
 * @throws {Error} Si el token es inválido o ha expirado
 */
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

/**
 * Actualiza la contraseña de un usuario.
 * @param {string} userId - ID del usuario
 * @param {string} newPassword - Nueva contraseña (debe estar encriptada antes de llamar a esta función)
 * @returns {Promise<Object>} Usuario actualizado
 * @throws {Error} Si hay un error al actualizar la contraseña
 */
const updatePassword = async (userId, newPassword) => {
    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const query = `
        UPDATE Usuario 
        SET contrasenia = $1, reset_token = NULL, reset_token_expiry = NULL
        WHERE usuario_id = $2
        RETURNING *;
    `;

    try {
        const result = await pool.query(query, [hashedPassword, userId]);
        if (result.rows.length === 0) {
            throw new Error('Usuario no encontrado');
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        throw new Error('Error al actualizar la contraseña');
    }
};

/**
 * Crea un nuevo usuario en el sistema.
 * @param {Object} user - Datos del usuario a crear
 * @param {string} user.nombre - Nombre completo del usuario
 * @param {string} user.correo - Correo electrónico del usuario
 * @param {string} user.contrasenia - Contraseña del usuario (será encriptada antes de almacenarse)
 * @param {string} user.fecha_de_nacimiento - Fecha de nacimiento en formato ISO
 * @param {string} user.numero_telefono - Número telefónico de 10 dígitos
 * @param {string} user.sexo - Género del usuario ('Masculino', 'Femenino', 'Otro')
 * @param {string} user.tipo - Tipo de usuario ('Usuario', 'Doctor', 'Paciente')
 * @param {string} [user.especialidad] - Especialidad (requerido para Doctores)
 * @param {string} [user.escolaridad] - Escolaridad (requerido para Pacientes)
 * @param {string} [user.domicilio] - Dirección (requerido para Doctores y Pacientes)
 * @param {string} [user.codigo_postal] - Código postal (requerido para Doctores y Pacientes)
 * @param {Object} [imagen] - Archivo de imagen para el avatar del usuario
 * @returns {Promise<Object>} Usuario creado con sus datos e imagen (si se proporcionó)
 * @throws {Error} Si la validación falla o hay problemas con la subida de la imagen
 */
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

    // Encriptamos la contraseña antes de guardarla
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasenia, salt);

    const userQuery = `
    INSERT INTO Usuario (nombre, correo, contrasenia, fecha_de_nacimiento, numero_telefono, sexo, tipo, imagen_url, imagen_id, domicilio, codigo_postal)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
`;
    const userValues = [
        nombre, correo, hashedPassword, fecha_de_nacimiento,
        numero_telefono, sexo, tipo, imagen_url, imagen_id, domicilio, codigo_postal
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

/**
 * Busca un usuario por su correo electrónico.
 * @param {string} correo - Correo electrónico del usuario
 * @returns {Promise<Object|null>} Datos del usuario o null si no se encuentra
 */
const findUserByEmail = async (correo) => {
    const query = `SELECT * FROM Usuario WHERE correo = $1;`;
    const result = await pool.query(query, [correo]);
    return result.rows[0];
};

/**
 * Busca un usuario por su correo y obtiene todos sus datos, incluyendo información específica
 * según su tipo (Doctor o Paciente).
 * @param {string} correo - Correo electrónico del usuario
 * @returns {Promise<Object|null>} Datos completos del usuario o null si no se encuentra
 * @property {string} usuario_id - ID del usuario
 * @property {string} nombre - Nombre del usuario
 * @property {string} correo - Correo electrónico
 * @property {string} contrasenia - Contraseña encriptada
 * @property {string} fecha_de_nacimiento - Fecha de nacimiento
 * @property {string} numero_telefono - Número de teléfono
 * @property {string} sexo - Género del usuario
 * @property {string} tipo - Tipo de usuario
 * @property {string} [imagen_url] - URL de la imagen de perfil
 * @property {string} [imagen_id] - ID de la imagen en Cloudinary
 * @property {string} [especialidad] - Solo para doctores
 * @property {string} [escolaridad] - Solo para pacientes
 * @property {string} [domicilio] - Para doctores y pacientes
 * @property {string} [codigo_postal] - Para doctores y pacientes
 */
const loginUserMethod = async (correo) => {
    // Primero obtenemos los datos básicos del usuario
    const userQuery = `
        SELECT 
            usuario_id,
            nombre,
            correo,
            contrasenia,
            fecha_de_nacimiento,
            numero_telefono,
            sexo,
            tipo,
            imagen_url,
            imagen_id,
            domicilio,
            codigo_postal
        FROM Usuario 
        WHERE correo = $1;
    `;
    const userResult = await pool.query(userQuery, [correo]);
    const usuario = userResult.rows[0];

    if (!usuario) return null;

    // Si es doctor o paciente, obtenemos sus datos adicionales e ID
    if (usuario.tipo === 'Doctor') {
        const doctorQuery = `
            SELECT doctor_id, especialidad, domicilio, codigo_postal
            FROM doctor
            WHERE usuario_id = $1;
        `;
        const doctorResult = await pool.query(doctorQuery, [usuario.usuario_id]);
        if (doctorResult.rows[0]) {
            return { ...usuario, ...doctorResult.rows[0] };
        }
    }

    if (usuario.tipo === 'Paciente') {
        const pacienteQuery = `
            SELECT paciente_id, escolaridad, domicilio, codigo_postal
            FROM paciente
            WHERE usuario_id = $1;
        `;
        const pacienteResult = await pool.query(pacienteQuery, [usuario.usuario_id]);
        if (pacienteResult.rows[0]) {
            return { ...usuario, ...pacienteResult.rows[0] };
        }
    }

    return usuario;
};

/**
 * Actualiza los datos del usuario, incluyendo imagen si se proporciona
 */
const updateUser = async (userId, userData, file = null) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        let updateData = { ...userData };
        
        // Si hay archivo de imagen, subir a Cloudinary
        if (file) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'users',
                public_id: `user_${userId}_${Date.now()}`,
                transformation: [
                    { width: 300, height: 300, crop: 'fill' },
                    { quality: 'auto', fetch_format: 'auto' }
                ]
            });
            
            updateData.imagen_url = result.secure_url;
            updateData.imagen_id = result.public_id;
        }
        
        // Construir query dinámico
        const fields = Object.keys(updateData);
        const values = Object.values(updateData);
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        
        const query = `
            UPDATE Usuario 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE usuario_id = $1
            RETURNING usuario_id, nombre, correo, fecha_de_nacimiento, numero_telefono, sexo, tipo, imagen_url, imagen_id, domicilio, codigo_postal
        `;
        
        const result = await client.query(query, [userId, ...values]);
        
        await client.query('COMMIT');
        return result.rows[0];
        
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    createUser,
    findUserByEmail,
    loginUserMethod,
    setResetToken,
    validateResetToken,
    updatePassword,
    updateUser,
    /**
     * Obtiene todos los doctores con sus datos de usuario y detalle de Doctor.
     * @returns {Promise<Array>} Lista de doctores
     */
    getAllDoctors: async ({ limit, offset }) => {
        const query = `
            SELECT 
                u.usuario_id,
                d.doctor_id,
                u.nombre,
                u.correo,
                u.fecha_de_nacimiento,
                u.numero_telefono,
                u.sexo,
                u.tipo,
                u.imagen_url,
                u.imagen_id,
                d.especialidad,
                d.domicilio,
                d.codigo_postal,
                COUNT(*) OVER() AS total_count
            FROM Usuario u
            INNER JOIN Doctor d ON d.usuario_id = u.usuario_id
            ORDER BY u.nombre ASC
            LIMIT $1 OFFSET $2;
        `;
        const result = await pool.query(query, [limit, offset]);
        const rows = result.rows;
        const total = rows[0] ? Number(rows[0].total_count) : 0;
        return { rows: rows.map(({ total_count, ...r }) => r), total };
    },
    /**
     * Obtiene todos los pacientes con sus datos de usuario y detalle de Paciente.
     * @returns {Promise<Array>} Lista de pacientes
     */
    getAllPatients: async ({ limit, offset }) => {
        const query = `
            SELECT 
                u.usuario_id,
                u.nombre,
                u.correo,
                u.fecha_de_nacimiento,
                u.numero_telefono,
                u.sexo,
                u.tipo,
                u.imagen_url,
                u.imagen_id,
                p.escolaridad,
                p.domicilio,
                p.codigo_postal,
                COUNT(*) OVER() AS total_count
            FROM Usuario u
            INNER JOIN Paciente p ON p.usuario_id = u.usuario_id
            ORDER BY u.nombre ASC
            LIMIT $1 OFFSET $2;
        `;
        const result = await pool.query(query, [limit, offset]);
        const rows = result.rows;
        const total = rows[0] ? Number(rows[0].total_count) : 0;
        return { rows: rows.map(({ total_count, ...r }) => r), total };
    },
    /**
     * Obtiene relaciones doctor-paciente con info de ambos usuarios.
     * @returns {Promise<Array>} Listado de vínculos doctor-paciente
     */
    getDoctorPatientLinks: async ({ limit, offset }) => {
        const query = `
            SELECT 
                dp.doctor_id,
                dp.paciente_id,
                du.nombre  AS doctor_nombre,
                du.correo  AS doctor_correo,
                du.imagen_url AS doctor_imagen_url,
                d.especialidad AS doctor_especialidad,
                pu.nombre  AS paciente_nombre,
                pu.correo  AS paciente_correo,
                pu.imagen_url AS paciente_imagen_url,
                p.escolaridad AS paciente_escolaridad,
                COUNT(*) OVER() AS total_count
            FROM doctor_paciente dp
            INNER JOIN Usuario du ON du.usuario_id = dp.doctor_id
            INNER JOIN Doctor d   ON d.usuario_id   = dp.doctor_id
            INNER JOIN Usuario pu ON pu.usuario_id = dp.paciente_id
            INNER JOIN Paciente p ON p.usuario_id   = dp.paciente_id
            ORDER BY doctor_nombre ASC, paciente_nombre ASC
            LIMIT $1 OFFSET $2;
        `;
        const result = await pool.query(query, [limit, offset]);
        const rows = result.rows;
        const total = rows[0] ? Number(rows[0].total_count) : 0;
        return { rows: rows.map(({ total_count, ...r }) => r), total };
    },
    /**
     * Obtiene todos los usuarios con datos básicos y detalles si aplican, con paginación.
     */
    getAllUsers: async ({ limit, offset }) => {
        const query = `
            SELECT 
                u.usuario_id,
                u.nombre,
                u.correo,
                u.fecha_de_nacimiento,
                u.numero_telefono,
                u.sexo,
                u.tipo,
                u.imagen_url,
                u.imagen_id,
                d.especialidad AS doctor_especialidad,
                p.escolaridad  AS paciente_escolaridad,
                COALESCE(d.domicilio, p.domicilio) AS domicilio,
                COALESCE(d.codigo_postal, p.codigo_postal) AS codigo_postal,
                COUNT(*) OVER() AS total_count
            FROM Usuario u
            LEFT JOIN Doctor d ON d.usuario_id = u.usuario_id
            LEFT JOIN Paciente p ON p.usuario_id = u.usuario_id
            ORDER BY u.nombre ASC
            LIMIT $1 OFFSET $2;
        `;
        const result = await pool.query(query, [limit, offset]);
        const rows = result.rows;
        const total = rows[0] ? Number(rows[0].total_count) : 0;
        return { rows: rows.map(({ total_count, ...r }) => r), total };
    }
};