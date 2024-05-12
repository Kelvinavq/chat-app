// Importar los módulos necesarios
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const PORT = process.env.PORT || 4000;

// Crear el servidor HTTP
const server = http.createServer(app);

const io = socketio(server);

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
    // Aquí puedes manejar eventos de Socket.IO
  });
  
  // Manejar solicitudes de Socket.IO
  app.get("/socket.io/", (req, res) => {
    // Devolver una respuesta indicando que Socket.IO está disponible
    res.send("Socket.IO is running");
  });

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Exporta el servidor para que pueda ser utilizado en otras partes de la aplicación
module.exports = { server };

