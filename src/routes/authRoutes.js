const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/auth/login', authController.loginUser);
router.post('/auth/register', authController.registerUser);

module.exports = router;

