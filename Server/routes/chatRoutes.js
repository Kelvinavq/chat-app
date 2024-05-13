const express = require("express");
const router = express.Router();

// Importar el controlador de chats
const chatController = require("../controllers/chatController");



// Ruta para registrar chats
router.post("/create-chat", chatController.createChat);

// Ruta para obtener todos los mensajes de un chat activo
router.get("/:chatId/messages", chatController.getChatMessages);

// Ruta para crear un nuevo mensaje en un chat existente
router.post("/messages/create", chatController.createMessage);


// Ruta para obtener la lista de chats
router.get("/list", chatController.getChatList);

// Ruta para obtener la lista de equipos
router.get("/list-team", chatController.getTeamList);


// Exportar las rutas
module.exports = router;
