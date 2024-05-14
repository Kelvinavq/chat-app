const db = require("../Config/database");
const socket = require("../Config/socket");
// Controlador para crear un nuevo chat y mensaje asociado

exports.createChat = async (req, res) => {
  console.log("Request body:", req.body);
  try {
    const { clientId, option, team_id } = req.body;
    const io = socket.getIO();
    let chatId;

    console.log("cliente: " + clientId)

    // Iniciar una transacción para garantizar que ambas consultas se ejecuten de manera atómica
    db.beginTransaction(async (err) => {
      if (err) throw err;

      // Crear el chat en la base de datos
      const chatQuery = "INSERT INTO chats (client_id, team_id) VALUES (?, ?)";
      await new Promise((resolve, reject) => {
        db.query(chatQuery, [clientId, team_id], (err, result) => {
          if (err) {
            db.rollback(() => {
              reject(err);
            });
          } else {
            // Obtener el ID del chat creado
            chatId = result.insertId;
            resolve(chatId);
          }
        });
      });

      // Crear el mensaje asociado con el chat en la base de datos
      const messageQuery =
        "INSERT INTO messages (chat_id, sender_id, message, type) VALUES (?, ?, ?, 'text')";
      await new Promise((resolve, reject) => {
        db.query(messageQuery, [chatId, clientId, option], (err, result) => {
          if (err) {
            db.rollback(() => {
              reject(err);
            });
          } else {
            // Commit la transacción si ambas consultas se ejecutan correctamente
            db.commit((err) => {
              if (err) {
                db.rollback(() => {
                  reject(err);
                });
              }
              resolve();
            });
          }
        });
      });

      io.emit("sendMessage", {
        chatId: chatId,
        senderId: clientId,
        message: option,
      });

      res.status(200).json({
        message: "Chat and message created successfully",
        chatId: chatId,
      });
    });
  } catch (error) {
    console.error("Error creating chat and message:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating chat and message" });
  }
};

// Controlador para obtener todos los mensajes de un chat activo
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messageQuery = "SELECT * FROM messages WHERE chat_id = ?";
    db.query(messageQuery, [chatId], (err, result) => {
      if (err) {
        console.error("Error fetching chat messages:", err);
        res
          .status(500)
          .json({ error: "An error occurred while fetching chat messages" });
      } else {
        res.status(200).json({ messages: result });
      }
    });
  } catch (error) {
    console.error("Error getting chat messages:", error);
    res
      .status(500)
      .json({ error: "An error occurred while getting chat messages" });
  }
};

// Controlador para crear un nuevo mensaje en un chat existente
exports.createMessage = async (req, res) => {
  try {
    const { chatId, senderId, message, type } = req.body;

    // Insertar el nuevo mensaje en la base de datos
    const messageQuery =
      "INSERT INTO messages (chat_id, sender_id, message, type) VALUES (?, ?, ?, ?)";
    db.query(messageQuery, [chatId, senderId, message, type], (err, result) => {
      if (err) {
        console.error("Error creating message:", err);
        res
          .status(500)
          .json({ error: "An error occurred while creating message" });
      } else {
        res.status(200).json({
          message: "Message created successfully",
          messageId: result.insertId,
        });
      }
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "An error occurred while creating message" });
  }
};

// Controlador para obtener la lista de chats
exports.getChatList = async (req, res) => {
  try {
    // Consultar la lista de chats con la información del cliente asociado
    const query = `
    SELECT chats.*, clients.username AS username, teams.id as team_id, teams.name AS team_name FROM chats INNER JOIN clients ON chats.client_id = clients.id INNER JOIN teams ON chats.team_id = teams.id ORDER BY chats.created_at DESC
    `;
    db.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching chat list:", err);
        res
          .status(500)
          .json({ error: "An error occurred while fetching chat list" });
      } else {
        res.status(200).json({ chats: result });
      }
    });
  } catch (error) {
    console.error("Error fetching chat list:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching chat list" });
  }
};

// Controlador para obtener la lista de equipos
exports.getTeamList = async (req, res) => {
  try {
    // Consultar la lista de equipos
    const query = `SELECT * FROM teams WHERE status = "active" ORDER BY id DESC`;
    db.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching team list:", err);
        res
          .status(500)
          .json({ error: "An error occurred while fetching team list" });
      } else {
        res.status(200).json({ teams: result });
      }
    });
  } catch (error) {
    console.error("Error fetching team list:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching team list" });
  }
};
