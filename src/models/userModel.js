const Joi = require('joi');
const pool = require('../db/connection');

const userSchema = Joi.object({
    nombre: Joi.string().min(3).max(100).required(),
    correo: Joi.string().email().required(),
    contraseña: Joi.string().min(6).max(100).required(),
    fecha_de_nacimiento: Joi.date().iso().required(),
    numero_telefonico: Joi.string().pattern(/^\d{10}$/).required(),
    sexo: Joi.string().valid('Masculino', 'Femenino', 'Otro').required(),
    tipo: Joi.string().valid('Usuario', 'Doctor', 'Paciente').required(),
    apellido_paterno: Joi.string().min(2).max(50).optional(),
    apellido_materno: Joi.string().min(2).max(50).optional(),
    escolaridad: Joi.string().allow(null, '').when('tipo', { is: 'Paciente', then: Joi.required() }),
    // doctor_id: Joi.number().integer().allow(null).when('tipo', { is: 'Paciente', then: Joi.required() }),
    especialidad: Joi.string().allow(null, '').when('tipo', { is: 'Doctor', then: Joi.required() }),
    domicilio: Joi.string().allow(null, '').when('tipo', { is: 'Doctor', then: Joi.required() }),

});

const validateUser = (user) => {
    const { error } = userSchema.validate(user);
    if (error) {
        throw new Error(`Error de validación: ${error.details[0].message}`);
    }
};

const createUser = async (user) => {
    validateUser(user);

    const {
        nombre,
        correo,
        contraseña,
        fecha_de_nacimiento,
        numero_telefonico,
        sexo,
        tipo,
        especialidad,
        domicilio,
        doctor_id,
        escolaridad,
        apellido_paterno,
        apellido_materno
    } = user;

    const userQuery = `
    INSERT INTO Usuario (nombre, correo, contraseña, fecha_de_nacimiento, numero_telefonico, sexo, tipo, apellido_paterno, apellido_materno)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
`;
    const userValues = [nombre, correo, contraseña, fecha_de_nacimiento, numero_telefonico, sexo, tipo, apellido_paterno, apellido_materno];
    const userResult = await pool.query(userQuery, userValues);
    const usuario = userResult.rows[0];

    if (tipo === 'Doctor') {
        const doctorQuery = `
            INSERT INTO Doctor (usuario_ID, especialidad, domicilio)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const doctorValues = [usuario.usuario_id, especialidad, domicilio];
        const doctorResult = await pool.query(doctorQuery, doctorValues);
        return { ...usuario, doctor: doctorResult.rows[0] };
    }

    return usuario;
};

const findUserByEmail = async (correo) => {
    const query = `SELECT * FROM Usuario WHERE correo = $1;`;
    const result = await pool.query(query, [correo]);
    return result.rows[0];
};

module.exports = {
    createUser,
    findUserByEmail,
};
