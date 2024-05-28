const express = require("express");
const router = express.Router();
const { upload, processImage } = require("../Config/uploadConfig");

// Importar el controlador de chats
const chatController = require("../controllers/chatController");

// Ruta para registrar chats
router.post("/create-chat", chatController.createChat);

// Ruta para obtener todos los mensajes de un chat activo
router.get("/:chatId/messages", chatController.getChatMessages);

// Ruta para crear un nuevo mensaje en un chat existente
router.post("/messages/create", chatController.createMessage);

// Ruta para obtener la lista de chats
router.get("/list/:id", chatController.getChatList);

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

// Ruta cerrar chat
router.put("/close/:id", chatController.closeChat);

// Ruta borrar chat
router.delete("/delete/:id", chatController.deleteChat);

// Ruta para cargar un mensaje (texto o imagen) desde un administrador
router.post(
  "/messages/upload-admin-chat",
  upload.single("image"),
  processImage,
  chatController.uploadMessageAdmin
);

// ruta para marcar chat abierto
router.put("/open-chat/:chatId", chatController.openChat);


// Exportar las rutas
module.exports = router;
