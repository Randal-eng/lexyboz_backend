/**
 * Archivo principal de configuración y arranque de la aplicación Express.
 * 
 * - Configura middlewares globales (CORS, JSON, etc.)
 * - Inicializa la documentación Swagger en /api-docs
 * - Importa y monta todas las rutas de la API
 * - Maneja errores globales
 * - Exporta la app para ser utilizada por el servidor HTTP
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Importar rutas de autenticación
const authRoutes = require('./src/modules/auth/routes/auth.routes');
const adminRoutes = require('./src/modules/auth/routes/admin.routes');

// Importar rutas de citas
const citaRoutes = require('./src/modules/citas/routes/cita.routes');
const doctorPacienteRoutes = require('./src/modules/citas/routes/doctorPaciente.routes');

// Importar rutas de kits
const kitRoutes = require('./src/modules/kits/routes/kit.routes');
const kitsAsignadosRoutes = require('./src/modules/kits/routes/kitsAsignados.routes');
const ejerciciosKitsRoutes = require('./src/modules/kits/routes/ejerciciosKits.routes');

// Importar rutas de ejercicios
const ejercicioRoutes = require('./src/modules/ejercicios/routes/ejercicio.routes');
const escritosRoutes = require('./src/modules/ejercicios/routes/escritos.routes');
const escrituraReordenamientoRoutes = require('./src/modules/ejercicios/routes/escrituraReordenamiento.routes');
const escrituraImagenPalabraRoutes = require('./src/modules/ejercicios/routes/escrituraImagenPalabra.routes');
const visualesRoutes = require('./src/modules/ejercicios/routes/visuales.routes');
const paresRoutes = require('./src/modules/ejercicios/routes/pares.routes');
const igualDiferenteRoutes = require('./src/modules/ejercicios/routes/igualDiferente.routes');
const imagenCorrectoRoutes = require('./src/modules/ejercicios/routes/imagenCorrecto.routes');
const imagenesRoutes = require('./src/modules/ejercicios/routes/imagenes.routes');
const palabraMalEscritoRoutes = require('./src/modules/ejercicios/routes/palabraMalEscrito.routes');

// Importar rutas de resultados
const resultadosEscrituraReordenamientoRoutes = require('./src/modules/resultados/routes/resultadosEscrituraReordenamiento.routes');
const resultadosEscrituraImagenPalabraRoutes = require('./src/modules/resultados/routes/resultadosEscrituraImagenPalabra.routes');

require('dotenv').config();

const app = express();

// Swagger Options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Lexyboz API',
      version: '1.0.0',
      description: 'API para el proyecto Lexyboz',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3500}`,
      },
    ],
  },
  apis: ['./src/modules/**/*.routes.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api', adminRoutes);
app.use('/api', authRoutes);
app.use('/api/doctor-paciente', doctorPacienteRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/kits', kitRoutes);
app.use('/api/ejercicios', ejercicioRoutes);
app.use('/api/ejercicios-kits', ejerciciosKitsRoutes);
app.use('/api/kits-asignados', kitsAsignadosRoutes);
app.use('/api/escritos', escritosRoutes);
app.use('/api/escritura-reordenamiento', escrituraReordenamientoRoutes);
app.use('/api/escritura-imagen-palabra', escrituraImagenPalabraRoutes);
app.use('/api/resultados-escritura-reordenamiento', resultadosEscrituraReordenamientoRoutes);
app.use('/api/resultados-escritura-imagen-palabra', resultadosEscrituraImagenPalabraRoutes);
app.use('/api/visuales', visualesRoutes);
app.use('/api/pares', paresRoutes);
app.use('/api/igual-diferente', igualDiferenteRoutes);
app.use('/api/imagen-correcto', imagenCorrectoRoutes);
app.use('/api/imagenes', imagenesRoutes);
app.use('/api/palabra-mal-escrito', palabraMalEscritoRoutes);

// Endpoint para mensaje de producción
app.get('/api/hola-produccion', (req, res) => {
  res.send('Hola desde produccion');
});

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});