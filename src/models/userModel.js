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

    especialidad: Joi.string().when('tipo', { is: 'Doctor', then: Joi.required() }),
    domicilio: Joi.string().when('tipo', { is: 'Doctor', then: Joi.required() }),
    doctor_id: Joi.number().integer().when('tipo', { is: 'Paciente', then: Joi.required() }),
    escolaridad: Joi.string().when('tipo', { is: 'Paciente', then: Joi.required() }),
});

const validateUser = (user) => {
    const { error } = userSchema.validate(user);
    if (error) {
        throw new Error(`Error de validación: ${error.details[0].message}`);
    }
};

const createUser = async (user) => {
    validateUser(user);

    const { nombre, correo, contraseña, fecha_de_nacimiento, numero_telefonico, sexo, tipo, especialidad, domicilio, doctor_id, escolaridad } = user;

    const userQuery = `
        INSERT INTO Usuario (nombre, correo, contraseña, fecha_de_nacimiento, numero_telefonico, sexo, tipo)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    const userValues = [nombre, correo, contraseña, fecha_de_nacimiento, numero_telefonico, sexo, tipo];
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

    if (tipo === 'Paciente') {
        const pacienteQuery = `
            INSERT INTO Paciente (usuario_ID, escolaridad)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const pacienteValues = [usuario.usuario_id, escolaridad];
        const pacienteResult = await pool.query(pacienteQuery, pacienteValues);
        const paciente = pacienteResult.rows[0];

        const doctorPacienteQuery = `
            INSERT INTO Doctor_Paciente (doctor_ID, paciente_ID)
            VALUES ($1, $2);
        `;
        const doctorPacienteValues = [doctor_id, paciente.paciente_id];
        await pool.query(doctorPacienteQuery, doctorPacienteValues);

        return { ...usuario, paciente };
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
