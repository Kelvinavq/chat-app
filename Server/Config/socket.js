let io;
require("dotenv").config();
const isProduction = process.env.NODE_ENV === "production";

const getClientOrigins = () => {
  const origins = isProduction 
    ? process.env.CLIENT_ORIGIN 
    : process.env.CLIENT_ORIGIN_LOCAL;

  if (!origins) {
    throw new Error('CLIENT_ORIGIN o CLIENT_ORIGIN_LOCAL no están definidas en el archivo .env');
  }

  return origins.split(',').map(origin => origin.trim());
};

const allowedOrigins = getClientOrigins();

module.exports = {
  init: (httpServer) => {
    io = require('socket.io')(httpServer, {
      cors: {
        origin: (origin, callback) => {
          // Permitir solicitudes sin origen, por ejemplo, desde aplicaciones móviles o solicitudes curl
          if (!origin) return callback(null, true);
          if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'El origen CORS no está permitido.';
            return callback(new Error(msg), false);
          }
          return callback(null, true);
        },
        methods: ["GET", "POST", "OPTIONS"],
        credentials: true
      },
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
}
