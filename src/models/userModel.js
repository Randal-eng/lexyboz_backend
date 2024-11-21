const Joi = require('joi');
const pool = require('../db/connection');

// Validación con Joi
const userSchema = Joi.object({
    nombre: Joi.string().min(3).max(100).required(),
    correo: Joi.string().email().required(),
    contraseña: Joi.string().min(6).max(100).required(),
    fecha_de_nacimiento: Joi.date().iso().required(),
    numero_telefonico: Joi.string().pattern(/^\d{10}$/).required(),
    sexo: Joi.string().valid('Masculino', 'Femenino', 'Otro').required(),
});

const validateUser = (user) => {
    const { error } = userSchema.validate(user);
    if (error) {
        throw new Error(`Error de validación: ${error.details[0].message}`);
    }
};

// Función para crear usuarios
const createUser = async (user) => {
    validateUser(user); // Validación antes de interactuar con la BD
    const { nombre, correo, contraseña, fecha_de_nacimiento, numero_telefonico, sexo } = user;
    const query = `
        INSERT INTO Usuario (nombre, correo, contraseña, fecha_de_nacimiento, numero_telefonico, sexo)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    const values = [nombre, correo, contraseña, fecha_de_nacimiento, numero_telefonico, sexo];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Función para buscar usuario por correo
const findUserByEmail = async (correo) => {
    const query = `SELECT * FROM Usuario WHERE correo = $1;`;
    const result = await pool.query(query, [correo]);
    return result.rows[0];
};

module.exports = {
    createUser,
    findUserByEmail,
};
