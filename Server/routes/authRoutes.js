const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// Ruta para el login
router.post('/login', AuthController.login);

module.exports = router;
