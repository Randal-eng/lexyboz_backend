const Joi = require('joi');
const pool = require('../../../db/connection');

const adminSchema = Joi.object({
    nombre: Joi.string().min(3).max(100).required(),
    correo: Joi.string().email().required(),
    contraseña: Joi.string().min(6).max(100).required(),
    nombre_usuario: Joi.string().min(3).max(50).required(),
});

const validateAdmin = (admin) => {
    const { error } = adminSchema.validate(admin);
    if (error) {
        throw new Error(`Error de validación: ${error.details[0].message}`);
    }
};

const createAdmin = async (admin) => {
    validateAdmin(admin); 
    const { nombre, correo, contraseña, nombre_usuario } = admin;
    const query = `
        INSERT INTO administrador (nombre, correo, contraseña, nombre_usuario)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [nombre, correo, contraseña, nombre_usuario];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const findAdminByEmail = async (correo) => {
    const query = `SELECT * FROM administrador WHERE correo = $1;`;
    const result = await pool.query(query, [correo]);
    return result.rows[0];
};

module.exports = {
    createAdmin,
    findAdminByEmail,
};
