const express = require('express');
const router = express.Router();

// Importar rutas del módulo de reactivos
const reactivoRoutes = require('./routes/reactivo.routes');

// =====================================================
// CONFIGURACIÓN DE RUTAS DEL MÓDULO REACTIVOS
// =====================================================

// Rutas de reactivos
const reactivoPalabraRoutes = require('./routes/reactivoPalabra.routes');
router.use('/reactivos', reactivoRoutes);
router.use('/reactivos-palabra', reactivoPalabraRoutes);

module.exports = router;
