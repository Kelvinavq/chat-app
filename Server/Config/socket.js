let io;

module.exports = {
  init: (httpServer) => {
    io = require('socket.io')(httpServer, {
      cors: {
        origin: "https://chat-app-28pv.onrender.com",
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
