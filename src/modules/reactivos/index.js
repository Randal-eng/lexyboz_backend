const express = require('express');
const router = express.Router();

// Importar rutas del módulo de reactivos
const reactivoRoutes = require('./routes/reactivo.routes');

// =====================================================
// CONFIGURACIÓN DE RUTAS DEL MÓDULO REACTIVOS
// =====================================================

// Rutas de reactivos
router.use('/reactivos', reactivoRoutes);

module.exports = router;
