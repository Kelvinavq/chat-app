const socketio = require('socket.io');
const chatController = require("../controllers/chatController");

function configureSocket(server) {
  const io = socketio(server);

  io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    // Manejar evento de envío de mensaje desde el cliente a través de Socket.IO
    socket.on('sendMessage', async (data) => {
      try {
        // Llamar al controlador para manejar el mensaje
        await chatController.handleSocketMessage(data);
        
        // Emitir el mensaje a todos los sockets conectados (si es necesario)
        // io.emit('newMessage', data);
      } catch (error) {
        console.error("Error handling socket message:", error);
      }
    });
  });

  return io;
}

module.exports = configureSocket;
