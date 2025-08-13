const express = require('express');
const router = express.Router();
const ReactivoController = require('../controllers/reactivoController');
const { verifyToken } = require('../../auth/middleware/authMiddleware');

// Middleware de autenticación para todas las rutas
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Reactivos
 *   description: API para gestión de reactivos de lectura de pseudopalabras
 */

// Crear reactivo
router.post('/crear', ReactivoController.crearReactivo);

// Obtener listado de reactivos con filtros
router.get('/listado', ReactivoController.obtenerReactivos);

// Obtener reactivo por ID
router.get('/obtener/:id', ReactivoController.obtenerReactivoPorId);

// Actualizar reactivo
router.put('/actualizar/:id', ReactivoController.actualizarReactivo);

// Eliminar reactivo
router.delete('/eliminar/:id', ReactivoController.eliminarReactivo);

// Buscar reactivos por pseudopalabra
router.get('/buscar', ReactivoController.buscarReactivos);

// Obtener reactivos aleatorios para ejercicios
router.get('/aleatorios', ReactivoController.obtenerReactivosAleatorios);

// Obtener estadísticas de reactivos
router.get('/estadisticas', ReactivoController.obtenerEstadisticas);

module.exports = router;
