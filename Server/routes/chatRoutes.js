const express = require('express');
const router = express.Router();

// Importar el controlador de chats
const chatController = require('../controllers/chatController');

// Ruta para registrar chats
router.post('/create-chat', chatController.createChat);

// Exportar las rutas
module.exports = router;
