const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Ruta para registrar al cliente
router.post('/register', userController.register);

// Ruta para verificar el estado de registro del cliente
router.get('/check-registration', userController.checkRegistration);


// Ruta para verificar la huella digital del cliente
router.get('/check-last-chat', userController.checkLastChatStatus);


// Ruta para obtener la informacion del cliente
router.get('/client-info', userController.getClientInfo);

module.exports = router;
