const pool = require('../config/database');

const createUser = async (user) => {
  const { nombre, correo, contraseña, fecha_de_nacimiento, numero_telefonico, sexo, tipo_de_usuario } = user;
  const query = `
    INSERT INTO Usuario (nombre, correo, contraseña, fecha_de_nacimiento, numero_telefonico, sexo, tipo_de_usuario)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [nombre, correo, contraseña, fecha_de_nacimiento, numero_telefonico, sexo, tipo_de_usuario];
  const result = await pool.query(query, values);
  return result.rows[0];
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
