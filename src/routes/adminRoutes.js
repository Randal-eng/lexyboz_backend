const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/auth/registrar-admin', adminController.registrarAdmin);

module.exports = router;
