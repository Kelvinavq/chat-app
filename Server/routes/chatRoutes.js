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

// Ruta para crear un nuevo mensaje en un chat existente
router.post("/messages/create-admin", chatController.createMessageAdmin);

// Ruta archivar chat
router.put('/archive-chat/:id', chatController.archiveChat);

// Ruta para obtener la lista de chats suspendidos
router.get("/chats-archiveds", chatController.getChatListSuspended);

// Ruta archivar chat
router.put('/mark-chat-visible/:id', chatController.markAsVisible);

// Exportar las rutas
module.exports = router;
