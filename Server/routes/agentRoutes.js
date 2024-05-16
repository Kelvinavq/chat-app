const express = require("express");
const router = express.Router();

// Importar el controlador de chats
const AgentController = require("../controllers/agentController");

// Ruta para registrar usuarios
router.post("/register", AgentController.registerAgent);

// Ruta para obtener usuario
router.get("/get-all-users", AgentController.getAllAgents);

// Ruta para obtener los detalles del usuario
router.get('/details/:id', AgentController.getAgentInfoById);

// Ruta para inhabilitar el usuario
router.put("/:id/disable", AgentController.disableAgent);

// Ruta para habilitar el usuario
router.put("/:id/enable", AgentController.enableAgent);

module.exports = router;
