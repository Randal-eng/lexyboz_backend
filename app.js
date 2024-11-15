const express = require('express');
const app = express();
const port = 3000;
const { Pool } = require('pg');
require('dotenv').config();



app.get('/', (req, res) => {
    res.send('PROYECTO LEXYBOZ BACKEND');
})

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
})

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

pool.connect((err, client, release) => {
    if (err) {
      console.error('Error al conectar con la base de datos:', err.stack);
    } else {
      console.log('Conexión exitosa con la base de datos');
    }
    release(); // Liberar el cliente de la conexión
  });