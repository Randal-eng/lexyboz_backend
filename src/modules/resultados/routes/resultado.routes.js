const express = require('express');
const router = express.Router();
const ResultadoController = require('../controllers/resultadoController');
const { verifyToken } = require('../../auth/middleware/authMiddleware');

// Middleware de autenticación para todas las rutas
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Resultados
 *   description: API para gestión de resultados de ejercicios de lectura de pseudopalabras
 */

// Registrar nuevo resultado
router.post('/registrar', ResultadoController.registrarResultado);

// Obtener listado de resultados con filtros
router.get('/listado', ResultadoController.obtenerResultados);

// Obtener resultado por ID
router.get('/obtener/:id', ResultadoController.obtenerResultadoPorId);

// Obtener resultados de un usuario específico
router.get('/usuario/:usuario_ID', ResultadoController.obtenerResultadosUsuario);

// Actualizar resultado
router.put('/actualizar/:id', ResultadoController.actualizarResultado);

// Eliminar resultado
router.delete('/eliminar/:id', ResultadoController.eliminarResultado);

// Obtener estadísticas de un usuario
router.get('/estadisticas/usuario/:usuario_ID', ResultadoController.obtenerEstadisticasUsuario);

// Obtener estadísticas de un reactivo
router.get('/estadisticas/reactivo/:id_reactivo', ResultadoController.obtenerEstadisticasReactivo);

// Obtener ranking de usuarios
router.get('/ranking/usuarios', ResultadoController.obtenerRankingUsuarios);

// Obtener reactivos más difíciles
router.get('/reactivos/mas-dificiles', ResultadoController.obtenerReactivosMasDificiles);

module.exports = router;
