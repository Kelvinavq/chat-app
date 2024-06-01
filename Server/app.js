// Importar los módulos necesarios
const express = require("express");
const cors = require("cors");
const http = require("http");
const chatController = require("./controllers/chatController");
const db = require("./Config/database");
const socket = require("./Config/socket");

const app = express();
const PORT = process.env.PORT || 4000;

// Crear el servidor HTTP
const server = http.createServer(app);

// Configuración del WebSocket
const io = socket.init(server);

// Middleware para el análisis del cuerpo de las solicitudes JSON
app.use(express.json());
app.use(cors({ origin:"http://localhost:5173", credentials: true }));


// Definir las rutas de la API
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const agentRoutes = require("./routes/agentRoutes");
const teamRoutes = require("./routes/teamRoutes");
const authRoutes = require("./routes/authRoutes");
const settingRoutes = require("./routes/settingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const clientRoutes = require("./routes/clientRoutes");

const protectedRoutes = require("./routes/protectedRoutes");

// Rutas de la API
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api", teamRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/clients", clientRoutes);

// Rutas protegidas
app.use("/api/protected", protectedRoutes);

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const onlineClients = {};

// Configuración del WebSocket
io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("disconnect", () => {
    if (socket.clientId) {
      console.log(`Client ${socket.clientId} disconnected`);
      delete onlineClients[socket.clientId];
      io.emit("updateUserStatus", {
        clientId: socket.clientId,
        isOnline: false,
      });
    } else {
      console.log("Client disconnected");
    }
  });

  socket.on("clientOnline", (clientId) => {
    socket.clientId = clientId;
    onlineClients[clientId] = true;
    console.log(`Client ${clientId} is online`);
    io.emit("updateUserStatus", { clientId, isOnline: true });
  });

  socket.on("adminOnline", (adminId) => {
    socket.adminId = adminId;
    socket.join("adminRoom");
    console.log(`Admin ${adminId} is online`);
  });

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  socket.on("leaveChat", (chatId) => {
    socket.leave(chatId);
    console.log(`User left chat: ${chatId}`);
  });

  socket.on("sendMessage", async (data) => {
    const messageData = {
      chatId: data.chatId,
      sender_id: data.sender_id,
      message: data.message,
      image: data.image,
      created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
    };
    console.log("New message:", messageData);
    const chat_id = data.chatId;

    // Emitir el mensaje a todos los clientes
    // io.to(data.chatId).emit("newMessage", messageData);
    // io.emit("newMessage", messageData)

    io.to("adminRoom").emit("newMessage", messageData);
    io.to(chat_id).emit("newMessage", messageData);

    if (data.image) {
      // io.to(data.chatId).emit("newImageMessage", messageData);
      // io.emit("newImageMessage", messageData)

      io.to("adminRoom").emit("newImageMessage", messageData);
      io.to(data.chatId).emit("newImageMessage", messageData);
    }
  });
  socket.on("chatOpened", (chatId) => {
    console.log(`Chat ${chatId} opened`);
    io.emit("chatOpened", chatId);
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
