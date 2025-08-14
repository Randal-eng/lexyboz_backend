const express = require('express');
const router = express.Router();

// Importar rutas del módulo de ejercicios
const ejercicioRoutes = require('./routes/ejercicio.routes');

// =====================================================
// CONFIGURACIÓN DE RUTAS DEL MÓDULO EJERCICIOS
// =====================================================

// Rutas de ejercicios
router.use('/ejercicios', ejercicioRoutes);

module.exports = router;
