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
router.put("/archive-chat/:id", chatController.archiveChat);

// Ruta para obtener la lista de chats suspendidos
router.get("/chats-archiveds", chatController.getChatListSuspended);

// Ruta archivar chat
router.put("/mark-chat-visible/:id", chatController.markAsVisible);

// Ruta para obtener la lista de mensajes de bienvenida
router.get("/get-welcome", chatController.getMessagesWelcome);

// Ruta para obtener la lista de mensajes dependiendo del equipo
router.get("/get-message-team/:id", chatController.getMessagesTeam);

// Ruta para obtener aceptar chat
router.put("/accept-chat/:id", chatController.acceptChat);

// Exportar las rutas
module.exports = router;
