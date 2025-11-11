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
const solicitudVinculacionRoutes = require('./src/modules/citas/routes/solicitudVinculacion.routes');

// Importar rutas de kits
const kitRoutes = require('./src/modules/kits/routes/kit.routes');

// Importar rutas de kits asignados
const kitsAsignadosRoutes = require('./src/modules/kitsAsignados/routes/kitAsignado.routes');

// Importar rutas de tipos y subtipos
const tipoRoutes = require('./src/modules/tipos/routes/tipo.routes');
const subTipoRoutes = require('./src/modules/subtipos/routes/subTipo.routes');

// Importar rutas de ejercicios
const ejercicioRoutes = require('./src/modules/ejercicios/routes/ejercicio.routes');

// Importar rutas de reactivos
const reactivoRoutes = require('./src/modules/reactivos/routes/reactivo.routes');

// Importar rutas de resultados
// const resultadoRoutes = require('./src/modules/resultados/routes/resultado.routes');

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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Doctor: {
          type: 'object',
          properties: {
            usuario_id: { type: 'string' },
            nombre: { type: 'string' },
            correo: { type: 'string' },
            fecha_de_nacimiento: { type: 'string', format: 'date' },
            numero_telefono: { type: 'string' },
            sexo: { type: 'string' },
            tipo: { type: 'string', example: 'Doctor' },
            imagen_url: { type: 'string', nullable: true },
            imagen_id: { type: 'string', nullable: true },
            especialidad: { type: 'string' },
            domicilio: { type: 'string' },
            codigo_postal: { type: 'string' }
          }
        },
        Patient: {
          type: 'object',
          properties: {
            usuario_id: { type: 'string' },
            nombre: { type: 'string' },
            correo: { type: 'string' },
            fecha_de_nacimiento: { type: 'string', format: 'date' },
            numero_telefono: { type: 'string' },
            sexo: { type: 'string' },
            tipo: { type: 'string', example: 'Paciente' },
            imagen_url: { type: 'string', nullable: true },
            imagen_id: { type: 'string', nullable: true },
            escolaridad: { type: 'string' },
            domicilio: { type: 'string' },
            codigo_postal: { type: 'string' }
          }
        },
        LinkDoctorPaciente: {
          type: 'object',
          properties: {
            doctor_id: { type: 'string' },
            paciente_id: { type: 'string' },
            doctor_nombre: { type: 'string' },
            doctor_correo: { type: 'string' },
            doctor_imagen_url: { type: 'string', nullable: true },
            doctor_especialidad: { type: 'string' },
            paciente_nombre: { type: 'string' },
            paciente_correo: { type: 'string' },
            paciente_imagen_url: { type: 'string', nullable: true },
            paciente_escolaridad: { type: 'string' }
          }
        },
        User: {
          type: 'object',
          properties: {
            usuario_id: { type: 'string' },
            nombre: { type: 'string' },
            correo: { type: 'string' },
            fecha_de_nacimiento: { type: 'string', format: 'date' },
            numero_telefono: { type: 'string' },
            sexo: { type: 'string' },
            tipo: { type: 'string', enum: ['Usuario', 'Doctor', 'Paciente'] },
            imagen_url: { type: 'string', nullable: true },
            imagen_id: { type: 'string', nullable: true },
            doctor_especialidad: { type: 'string', nullable: true },
            paciente_escolaridad: { type: 'string', nullable: true },
            domicilio: { type: 'string', nullable: true },
            codigo_postal: { type: 'string', nullable: true }
          }
        },
        PaginatedDoctorsResponse: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 25 },
            count: { type: 'integer', example: 10 },
            doctors: { type: 'array', items: { $ref: '#/components/schemas/Doctor' } },
            message: { type: 'string', nullable: true }
          }
        },
        PaginatedPatientsResponse: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 25 },
            count: { type: 'integer', example: 10 },
            patients: { type: 'array', items: { $ref: '#/components/schemas/Patient' } },
            message: { type: 'string', nullable: true }
          }
        },
        PaginatedLinksResponse: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 25 },
            count: { type: 'integer', example: 10 },
            links: { type: 'array', items: { $ref: '#/components/schemas/LinkDoctorPaciente' } },
            message: { type: 'string', nullable: true }
          }
        },
        PaginatedUsersResponse: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 25 },
            count: { type: 'integer', example: 10 },
            users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
            message: { type: 'string', nullable: true }
          }
        }
      }
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

// Middleware para manejar errores de parseo JSON
app.use(express.json());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Error de JSON inválido:', err.message);
    console.error('Body recibido:', req.body);
    return res.status(400).json({
      success: false,
      message: 'JSON inválido en el cuerpo de la petición',
      error: err.message,
      ayuda: 'Verifica que el JSON esté correctamente formateado (sin comas finales, comillas bien cerradas, etc.)'
    });
  }
  next();
});

// CORS robusto con múltiples orígenes permitidos (separados por comas en FRONTEND_ORIGIN)
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir herramientas como Postman/Thunder Client (sin origin)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS_NOT_ALLOWED'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
// Manejo de preflight para todas las rutas
app.options('*', cors(corsOptions));

// Manejador de errores de CORS para responder en JSON
app.use((err, req, res, next) => {
  if (err && err.message === 'CORS_NOT_ALLOWED') {
    return res.status(403).json({
      message: 'Origen no permitido por CORS',
      origin: req.headers.origin || null,
      allowedOrigins
    });
  }
  return next(err);
});

app.use('/api', adminRoutes);
app.use('/api', authRoutes);
app.use('/api/doctor-paciente', doctorPacienteRoutes);
app.use('/api/solicitudes', solicitudVinculacionRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/kits', kitRoutes);
app.use('/api/kits-asignados', kitsAsignadosRoutes);
app.use('/api/tipos', tipoRoutes);
app.use('/api/subtipos', subTipoRoutes);
app.use('/api/ejercicios', ejercicioRoutes);
app.use('/api/reactivos', reactivoRoutes);
// app.use('/api/ejercicios-kits', ejerciciosKitsRoutes); // TODO: Crear estas rutas
// app.use('/api/resultados', resultadoRoutes);

// Endpoint para mensaje de producción
app.get('/api/hola-produccion', (req, res) => {
  res.send('Hola desde produccion');
});

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});