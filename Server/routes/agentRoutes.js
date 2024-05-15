const express = require("express");
const router = express.Router();

// Importar el controlador de chats
const AgentController = require("../controllers/agentController");

// Ruta para registrar usuarios
router.post('/register', AgentController.registerAgent);

// Ruta para obtener usuario
router.post('/get-all-users', AgentController.getAllAgents);


module.exports = router;