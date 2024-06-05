let io;
require("dotenv").config();
const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  init: (httpServer) => {
    io = require('socket.io')(httpServer, {
      cors: {
        origin:  isProduction
        ? process.env.CLIENT_ORIGIN
        : process.env.CLIENT_ORIGIN_LOCAL,
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
