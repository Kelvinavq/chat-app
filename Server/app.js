// Importar los módulos necesarios
const express = require("express");
const cors = require("cors");
const http = require("http");
// const socketio = require("socket.io");
const chatController = require("./controllers/chatController");
const db = require("./Config/database");
const socket = require('./Config/socket');

const app = express();
const PORT = process.env.PORT || 4000;

// Crear el servidor HTTP
const server = http.createServer(app);

// Configuración del WebSocket
const io = socket.init(server);


// Middleware para el análisis del cuerpo de las solicitudes JSON
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Definir las rutas de la API
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");

// Rutas de la API
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Configuración del WebSocket
io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("disconnect", () => {
    if (socket.clientId) {
      console.log(`Client ${socket.clientId} disconnected`);
      io.emit("updateUserStatus", { clientId: socket.clientId, isOnline: false });
    } else {
      console.log("Client disconnected");
    }
  });

  socket.on("clientOnline", (clientId) => {
    socket.clientId = clientId; 
    console.log(`Client ${clientId} is online`);
    io.emit("updateUserStatus", { clientId, isOnline: true });
  });

  socket.on("sendMessage", async (data) => {
    console.log("New message:", data);

  });
});

// Manejar solicitudes de Socket.IO
app.get("/socket.io/", (req, res) => {
  // Devolver una respuesta indicando que Socket.IO está disponible
  res.send("Socket.IO is running");
});

// Iniciar el servidor
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Exportar el servidor para que pueda ser utilizado en otras partes de la aplicación
module.exports = { server };
