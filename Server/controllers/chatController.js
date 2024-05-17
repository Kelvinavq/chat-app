const db = require("../Config/database");
const socket = require("../Config/socket");
// Controlador para crear un nuevo chat y mensaje asociado

exports.createChat = async (req) => {
  try {
    const { clientId, option, team_id } = req.body;
    const io = socket.getIO();
    let chatId;

    // Iniciar una transacción para garantizar que ambas consultas se ejecuten de manera atómica
    await new Promise((resolve, reject) => {
      db.beginTransaction(async (err) => {
        if (err) return reject(err);

        try {
          // Crear el chat en la base de datos
          const chatQuery =
            "INSERT INTO chats (client_id, team_id) VALUES (?, ?)";
          await new Promise((resolve, reject) => {
            db.query(chatQuery, [clientId, team_id], (err, result) => {
              if (err) return db.rollback(() => reject(err));
              chatId = result.insertId;
              resolve(chatId);
            });
          });

          // Crear el mensaje asociado con el chat en la base de datos
          const messageQuery =
            "INSERT INTO messages (chat_id, sender_id, message, type) VALUES (?, ?, ?, 'text')";
          await new Promise((resolve, reject) => {
            db.query(messageQuery, [chatId, clientId, option], (err) => {
              if (err) return db.rollback(() => reject(err));

              resolve();
            });
          });

          // Obtener el username del cliente y el nombre del equipo
          const chatDataQuery = `
            SELECT clients.username AS username, teams.name AS team_name 
            FROM clients 
            INNER JOIN teams ON teams.id = ?
            WHERE clients.id = ?
          `;
          const chatData = await new Promise((resolve, reject) => {
            db.query(chatDataQuery, [team_id, clientId], (err, result) => {
              if (err) return db.rollback(() => reject(err));
              if (result.length > 0) {
                resolve(result[0]);
              } else {
                reject(new Error("No data found"));
              }
            });
          });

          db.commit((err) => {
            if (err) return db.rollback(() => reject(err));

            // Emitir el evento newChatNotification
            const newChatData = {
              id: chatId,
              username: chatData.username,
              team_name: chatData.team_name,
            };
            io.emit("newChatNotification", newChatData);

            resolve({
              message: "Chat and message created successfully",
              chatId: chatId,
            });
          });
        } catch (error) {
          db.rollback(() => reject(error));
        }
      });
    });
  } catch (error) {
    console.error("Error creating chat and message:", error);
    throw error;
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
    const { chatId, sender_id, message, type } = req.body;

    // Insertar el nuevo mensaje en la base de datos
    const messageQuery =
      "INSERT INTO messages (chat_id, sender_id, message, type) VALUES (?, ?, ?, ?)";
    db.query(messageQuery, [chatId, sender_id, message, type], (err, result) => {
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
    SELECT chats.*, clients.id as client_id, clients.registration_date as date, clients.username AS username, teams.id as team_id, teams.name AS team_name FROM chats INNER JOIN clients ON chats.client_id = clients.id INNER JOIN teams ON chats.team_id = teams.id ORDER BY chats.created_at DESC
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

exports.createMessageAdmin = async (req, res) => {
  try {
    const { chatId, sender_id, message } = req.body;

    // Insertar el nuevo mensaje en la base de datos
    const messageQuery =
      "INSERT INTO messages (chat_id, sender_id, message, type) VALUES (?, ?, ?, 'text')";
    db.query(
      messageQuery,
      [chatId, sender_id, message],
      (err, result) => {
        if (err) {
          console.error("Error creating message:", err);
          res.status(500).json({
            error: "An error occurred while creating message",
          });
        } else {
          // Obtener el ID del mensaje insertado
          const messageId = result.insertId;
          res.status(200).json({
            message: "Message created successfully",
            messageId: messageId,
          });
        }
      }
    );
  } catch (error) {
    console.error("Error creating message:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating message" });
  }
};