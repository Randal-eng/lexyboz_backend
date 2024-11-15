require('dotenv').config();
const { query, text } = require('express');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('error', (err) => {
    console.error('Error en el pool de conexion', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
