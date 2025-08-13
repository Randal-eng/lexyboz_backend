const express = require('express');
const EjercicioController = require('../controllers/ejercicioController');
const { verifyToken } = require('../../auth/middleware/authMiddleware');

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Ejercicios
 *   description: Gestión de ejercicios con reactivos específicos
 */

// Rutas básicas de ejercicios
router.post('/crear', EjercicioController.crearEjercicio);
router.get('/listado', EjercicioController.obtenerEjercicios);
router.get('/obtener/:id', EjercicioController.obtenerEjercicioPorId);
router.put('/actualizar/:id', EjercicioController.actualizarEjercicio);
router.delete('/eliminar/:id', EjercicioController.eliminarEjercicio);

// Rutas de búsqueda y filtrado
router.get('/buscar', EjercicioController.buscarEjercicios);
router.get('/tipo/:tipo_reactivo', EjercicioController.obtenerEjerciciosPorTipo);
router.get('/estadisticas', EjercicioController.obtenerEstadisticas);

// Rutas de gestión de reactivos en ejercicios
router.get('/:id/reactivos', EjercicioController.obtenerReactivosEjercicio);
router.get('/:id/reactivos/aleatorios', EjercicioController.obtenerReactivosAleatorios);

module.exports = router;
