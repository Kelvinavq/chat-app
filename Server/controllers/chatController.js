const db = require("../Config/database");

// Controlador para crear un nuevo chat y mensaje asociado
exports.createChat = async (req, res) => {
  try {
    const { clientId, option } = req.body;

    let chatId;
    
    // Iniciar una transacción para garantizar que ambas consultas se ejecuten de manera atómica
    db.beginTransaction(async (err) => {
      if (err) throw err;

      // Crear el chat en la base de datos
      const chatQuery = "INSERT INTO chats (client_id) VALUES (?)";
      await new Promise((resolve, reject) => {
        db.query(chatQuery, [clientId], (err, result) => {
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
      const messageQuery = "INSERT INTO messages (chat_id, sender_id, message, type) VALUES (?, ?, ?, 'text')";
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

      res.status(200).json({ message: "Chat and message created successfully", chatId: chatId });
    });
  } catch (error) {
    console.error("Error creating chat and message:", error);
    res.status(500).json({ error: "An error occurred while creating chat and message" });
  }
};
