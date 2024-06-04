let io;

module.exports = {
  init: (httpServer) => {
    io = require('socket.io')(httpServer, {
      cors: {
        origin: "https://463siemprepagachat.com",
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
