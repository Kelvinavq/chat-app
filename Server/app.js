// Importar los módulos necesarios
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const chatController = require("./controllers/chatController");
const db = require("./Config/database");
const socket = require("./Config/socket");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Crear el servidor HTTP
const server = http.createServer(app);

// Configuración del WebSocket
const io = socket.init(server);

const isProduction = process.env.NODE_ENV === "production";

// Obtener orígenes permitidos de las variables de entorno
const getClientOrigins = () => {
  const origins = isProduction
    ? process.env.CLIENT_ORIGIN.split(",")
    : process.env.CLIENT_ORIGIN_LOCAL.split(",");

  return origins.map((origin) => origin.trim());
};

const allowedOrigins = getClientOrigins();

// Middleware para el análisis del cuerpo de las solicitudes JSON
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir solicitudes sin origen, por ejemplo, desde aplicaciones móviles o solicitudes curl
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "El origen CORS no está permitido.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
// Servir archivos estáticos desde la carpeta dist
app.use(express.static(path.join(__dirname, "..", "dist")));

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
const unreadCounts = {};

// Configuración del WebSocket
io.on("connection", (socket) => {
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
      sender: data.sender,
    };
    const chat_id = data.chatId;

    io.to("adminRoom").emit("newMessage", messageData);
    io.to(chat_id).emit("newMessage", messageData);

    if (data.image) {
      io.to("adminRoom").emit("newImageMessage", messageData);
      io.to(data.chatId).emit("newImageMessage", messageData);
    }

    // Actualizar contador de mensajes no leídos
    if (!unreadCounts[chat_id]) {
      unreadCounts[chat_id] = 0;
    }
    unreadCounts[chat_id]++;

    // Emitir el nuevo contador a los administradores
    io.to("adminRoom").emit("updateUnreadCount", {
      chatId: chat_id,
      unreadCount: unreadCounts[chat_id],
    });
  });

  socket.on("chatOpened", (chatId) => {
    console.log(`Chat ${chatId} opened`);
    io.emit("chatOpened", chatId);
  });

  // Emitir evento de chat cerrado
  socket.on("chatClosed", ({ chatId }) => {
    io.to(chatId).emit("chatClosed", { chatId });
  });

  socket.on("chatDeleted", ({ chatId }) => {
    io.emit("chatDeleted", { chatId });
  });

  socket.on("chatAccepted", ({ chatId, adminId }) => {
    io.emit("chatAccepted", { chatId, adminId });
  });

  // Manejar el evento de estado del cliente
  socket.on("clientStatus", ({ clientId, isOnline }) => {
    if (isOnline) {
      onlineClients[clientId] = socket.id;
    } else {
      delete onlineClients[clientId];
    }

    // Emitir el estado a todos los administradores conectados
    io.emit("updateUserStatus", { clientId, isOnline });
  });

  // Manejar la solicitud del estado de los clientes
  socket.on("requestClientStatuses", () => {
    const clientStatuses = Object.keys(onlineClients).reduce(
      (statuses, clientId) => {
        statuses[clientId] = true; // ya que están en onlineClients, están online
        return statuses;
      },
      {}
    );
    socket.emit("clientStatuses", clientStatuses);
  });

  // Manejar la desconexión del cliente
  socket.on("disconnect", () => {
    const clientId = Object.keys(onlineClients).find(
      (key) => onlineClients[key] === socket.id
    );
    if (clientId) {
      delete onlineClients[clientId];
      io.emit("updateUserStatus", { clientId, isOnline: false });
    }
  });
});

// Manejar solicitudes de Socket.IO
app.get("/socket.io/", (req, res) => {
  // Devolver una respuesta indicando que Socket.IO está disponible
  res.send("Socket.IO is running");
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "dist", "index.html"));
});

// Iniciar el servidor
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Exportar el servidor para que pueda ser utilizado en otras partes de la aplicación
module.exports = { server };
//
