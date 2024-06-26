const db = require("../Config/database");
const socket = require("../Config/socket");
const path = require("path");
const fs = require("fs");

// Controlador para crear un nuevo chat y mensaje asociado

exports.createChat = async (req, res) => {
  try {
    const { clientId, option, team_id, autoMessages } = req.body;
    const io = socket.getIO();
    let chatId;

    // Iniciar una transacción para garantizar que ambas consultas se ejecuten de manera atómica
    await new Promise((resolve, reject) => {
      db.beginTransaction(async (err) => {
        if (err) return reject(err);

        try {
          // Crear el chat en la base de datos
          const chatQuery =
            "INSERT INTO chats (client_id, team_id,unread_messages_count) VALUES (?, ?, ?)";
          await new Promise((resolve, reject) => {
            db.query(chatQuery, [clientId, team_id, 1], (err, result) => {
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

          // Crear los mensajes automáticos asociados con el chat en la base de datos
          const autoMessagesQuery =
            "INSERT INTO messages (chat_id, sender_id, message, type) VALUES ?";
          const autoMessagesValues = autoMessages.map((message) => [
            chatId,
            message.sender_id,
            message.message,
            "text",
          ]);

          if (autoMessagesValues.length > 0) {
            await new Promise((resolve, reject) => {
              db.query(autoMessagesQuery, [autoMessagesValues], (err) => {
                if (err) return db.rollback(() => reject(err));
                resolve();
              });
            });
          }

          // Obtener el username del cliente y el nombre del equipo
          const chatDataQuery = `
          SELECT clients.id AS client_id, clients.username AS username, teams.name AS team_name, teams.id as team_id, chats.unread_messages_count
          FROM clients 
          INNER JOIN teams ON teams.id = ?
          INNER JOIN chats ON chats.id = ?
          WHERE clients.id = ?
        `;
          const chatData = await new Promise((resolve, reject) => {
            db.query(
              chatDataQuery,
              [team_id, chatId, clientId],
              (err, result) => {
                if (err) return db.rollback(() => reject(err));
                if (result.length > 0) {
                  resolve(result[0]);
                } else {
                  reject(new Error("No data found"));
                }
              }
            );
          });

          db.commit((err) => {
            if (err) return db.rollback(() => reject(err));

            // Emitir el evento newChatNotification
            const newChatData = {
              id: chatId,
              username: chatData.username,
              team_name: chatData.team_name,
              team_id: chatData.team_id,
              clientId: chatData.client_id,
              unread_messages_count: chatData.unread_messages_count,
            };
            io.emit("newChatNotification", newChatData);
            // Actualizar el estado online del cliente

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

    res.status(200).json({ chatId });
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
    const { chatId, sender_id, message, type, sender } = req.body;

    // Insertar el nuevo mensaje en la base de datos
    const messageQuery =
      "INSERT INTO messages (chat_id, sender_id, message, type, sender) VALUES (?, ?, ?, ?, ?)";
    db.query(
      messageQuery,
      [chatId, sender_id, message, type, sender],
      async (err, result) => {
        if (err) {
          console.error("Error creating message:", err);
          return res
            .status(500)
            .json({ error: "An error occurred while creating message" });
        }

        // Obtener el ID del mensaje insertado
        const messageId = result.insertId;

        // Actualizar la columna last_updated_at en la tabla chats
        const updateQuery =
          "UPDATE chats SET last_updated_at = CURRENT_TIMESTAMP, unread_messages_count = unread_messages_count + 1 WHERE id = ?";
        db.query(updateQuery, [chatId], (err) => {
          if (err) {
            console.error("Error updating last_updated_at:", err);
          }
        });

        // Obtener los datos del chat para emitir el evento newChatNotification
        const chatDataQuery = `
        SELECT 
          clients.id AS client_id, 
          clients.username AS username, 
          teams.name AS team_name, 
          teams.id AS team_id,
          chats.unread_messages_count AS unread_messages_count
        FROM chats
        INNER JOIN clients ON chats.client_id = clients.id
        INNER JOIN teams ON teams.id = chats.team_id
        WHERE chats.id = ?
      `;

        db.query(chatDataQuery, [chatId], (err, result) => {
          if (err) {
            console.error("Error fetching chat data:", err);
            return res
              .status(500)
              .json({ error: "An error occurred while fetching chat data" });
          }

          if (result.length > 0) {
            const chatData = result[0];

            // Emitir el evento newChatNotification
            const newChatData = {
              id: chatId,
              username: chatData.username,
              team_name: chatData.team_name,
              team_id: chatData.team_id,
              clientId: chatData.client_id,
              unread_messages_count: chatData.unread_messages_count,
            };
            const io = socket.getIO();
            io.emit("newChatNotification", newChatData);

            // Actualizar el estado online del cliente
            // if (chatData.client_id) {
            //   io.emit("updateUserStatus", {
            //     clientId: chatData.client_id,
            //     isOnline: true,
            //   });
            // }

            // Respondemos al cliente con éxito
            res.status(200).json({
              message: "Message created successfully",
              messageId: messageId,
            });
          } else {
            res.status(404).json({ error: "Chat not found" });
          }
        });
      }
    );
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "An error occurred while creating message" });
  }
};

// Controlador para obtener la lista de chats
exports.getChatList = async (req, res) => {
  try {
    const adminId = req.params.id;
    const userRole = req.query.role; // Suponiendo que el rol se pasa como un parámetro de consulta

    // Consultar los IDs de los equipos asociados al administrador desde la tabla user_teams
    const teamsQuery = `
      SELECT team_id FROM user_teams WHERE user_id = ?
    `;

    db.query(teamsQuery, [adminId], (err, teamResults) => {
      if (err) {
        console.error("Error fetching user's teams:", err);
        res
          .status(500)
          .json({ error: "An error occurred while fetching user's teams" });
      } else {
        const teamIds = teamResults.map((team) => team.team_id);

        // Construir la consulta según el rol del usuario
        let query = `
          SELECT chats.*, clients.id AS client_id, clients.registration_date AS date, clients.username AS username, clients.status AS statusClient, teams.id AS team_id, teams.name AS team_name 
          FROM chats 
          INNER JOIN clients ON chats.client_id = clients.id 
          INNER JOIN teams ON chats.team_id = teams.id 
          WHERE chats.archived = 'visible'
        `;

        if (userRole === "agent") {
          // Los agentes solo ven los chats asignados a ellos o no asignados a nadie
          query += ` AND (chats.admin_id = ? OR chats.admin_id IS NULL)`;
        }

        query += ` AND chats.team_id IN (?) ORDER BY chats.last_updated_at DESC`;

        const queryParams =
          userRole === "agent" ? [adminId, teamIds] : [teamIds];

        db.query(query, queryParams, (err, result) => {
          if (err) {
            console.error("Error fetching chat list:", err);
            res
              .status(500)
              .json({ error: "An error occurred while fetching chat list" });
          } else {
            res.status(200).json({ chats: result });
          }
        });
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
    const { chatId, sender_id, message, sender } = req.body;

    // Insertar el nuevo mensaje en la base de datos
    const messageQuery =
      "INSERT INTO messages (chat_id, sender_id, message, type, sender) VALUES (?, ?, ?, 'text', ?)";
    db.query(
      messageQuery,
      [chatId, sender_id, message, sender],
      (err, result) => {
        if (err) {
          console.error("Error creating message:", err);
          res.status(500).json({
            error: "An error occurred while creating message",
          });
        } else {
          // Obtener el ID del mensaje insertado
          const messageId = result.insertId;

          // Actualizar la columna last_updated_at en la tabla chats
          const updateQuery =
            "UPDATE chats SET last_updated_at = CURRENT_TIMESTAMP WHERE id = ?";
          db.query(updateQuery, [chatId], (err, result) => {
            if (err) {
              console.error("Error updating last_updated_at:", err);
            }
          });

          res.status(200).json({
            message: "Message created successfully",
            messageId: messageId,
          });
        }
      }
    );
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "An error occurred while creating message" });
  }
};

// controlador para archivar el chat
exports.archiveChat = async (req, res) => {
  try {
    const { chatId } = req.body;
    const io = socket.getIO();
    const messageQuery =
      "UPDATE chats SET archived = 'archived', status = 'closed' WHERE id = ?";
    db.query(messageQuery, [chatId], (err, result) => {
      if (err) {
        console.error("Error archiving chat:", err);
        res.status(500).json({
          error: "An error occurred while archiving chat",
        });
      } else {
        // Emitir evento de chat archivado
        io.emit("chatArchived", { chatId });
        res.status(200).json({
          message: "chat archived successfully",
        });
      }
    });
  } catch (error) {
    console.error("Error archiving chat:", error);
    res.status(500).json({ error: "An error occurred while archiving chat" });
  }
};

// Controlador para obtener la lista de chats suspendidos
exports.getChatListSuspended = async (req, res) => {
  try {
    // Consultar la lista de chats con la información del cliente asociado
    const query = `
    SELECT chats.*, clients.id as client_id, clients.registration_date as date, clients.username AS username, teams.id as team_id, teams.name AS team_name FROM chats INNER JOIN clients ON chats.client_id = clients.id INNER JOIN teams ON chats.team_id = teams.id WHERE chats.archived = 'archived' ORDER BY chats.created_at DESC
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

// controlador para archivar el chat
exports.markAsVisible = async (req, res) => {
  try {
    const { chatId } = req.body;
    const io = socket.getIO();
    const messageQuery = "UPDATE chats SET archived = 'visible' WHERE id = ?";
    db.query(messageQuery, [chatId], (err, result) => {
      if (err) {
        console.error("Error unarchive chat:", err);
        res.status(500).json({
          error: "An error occurred while unarchive chat",
        });
      } else {
        // Emitir evento de chat archivado
        io.emit("chatArchived", { chatId });
        res.status(200).json({
          message: "chat visible successfully",
        });
      }
    });
  } catch (error) {
    console.error("Error unarchive chat:", error);
    res.status(500).json({ error: "An error occurred while unarchive chat" });
  }
};

// Controlador para obtener la lista de mensajes de bienvenida
exports.getMessagesWelcome = async (req, res) => {
  try {
    const query = `SELECT * FROM auto_messages WHERE type = "welcome" ORDER BY id ASC`;
    db.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching messages list:", err);
        res
          .status(500)
          .json({ error: "An error occurred while fetching messages list" });
      } else {
        res.status(200).json({ messages_welcome: result });
      }
    });
  } catch (error) {
    console.error("Error fetching messages list:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching messages list" });
  }
};

// Controlador para obtener la lista de mensajes automáticos por team_id
exports.getMessagesTeam = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `SELECT * FROM auto_messages WHERE team_id = ? AND status = "active" ORDER BY id ASC`;
    db.query(query, [id], (err, result) => {
      if (err) {
        console.error("Error fetching messages list:", err);
        res
          .status(500)
          .json({ error: "An error occurred while fetching messages list" });
      } else {
        res.status(200).json({ messages_team: result });
      }
    });
  } catch (error) {
    console.error("Error fetching messages list:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching messages list" });
  }
};

// controlador para aceptar el chat
exports.acceptChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    // Verificar si el chat ya ha sido aceptado por otro usuario
    const checkQuery = "SELECT admin_id FROM chats WHERE id = ?";
    db.query(checkQuery, [id], (checkErr, checkResult) => {
      if (checkErr) {
        console.error("Error checking chat status:", checkErr);
        return res
          .status(500)
          .json({ error: "An error occurred while checking chat status" });
      }

      if (checkResult.length > 0 && checkResult[0].admin_id !== null) {
        return res.status(400).json({ error: "Chat already accepted" });
      }

      // Actualizar el chat para asignarle el admin_id
      const updateQuery = "UPDATE chats SET admin_id = ? WHERE id = ?";
      db.query(updateQuery, [adminId, id], (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error accepting chat:", updateErr);
          return res
            .status(500)
            .json({ error: "An error occurred while accepting chat" });
        } else {
          return res
            .status(200)
            .json({ message: "Chat accepted successfully" });
        }
      });
    });
  } catch (error) {
    console.error("Error accepting chat:", error);
    res.status(500).json({ error: "An error occurred while accepting chat" });
  }
};

// controlador para archivar el chat
exports.closeChat = async (req, res) => {
  try {
    const chat_id = req.params.id;

    const messageQuery = `UPDATE chats SET status = "closed" WHERE id = ?`;
    db.query(messageQuery, [chat_id], (err, result) => {
      if (err) {
        console.error("Error closing chat:", err);
        res.status(500).json({
          error: "An error occurred while closed chat",
        });
      } else {
        res.status(200).json({
          message: "chat closed successfully",
        });
      }
    });
  } catch (error) {
    console.error("Error unarchive chat:", error);
    res.status(500).json({ error: "An error occurred while closing chat" });
  }
};

// controlador para borrar el chat
exports.deleteChat = async (req, res) => {
  try {
    const { chat_id } = req.body;

    // Consulta para eliminar todos los mensajes del chat
    const deleteMessagesQuery = "DELETE FROM messages WHERE chat_id = ?";
    db.query(deleteMessagesQuery, [chat_id], (err, result) => {
      if (err) {
        console.error("Error deleting messages:", err);
        return res.status(500).json({
          error: "An error occurred while deleting messages",
        });
      }

      // Consulta para eliminar el chat
      const deleteChatQuery = "DELETE FROM chats WHERE id = ?";
      db.query(deleteChatQuery, [chat_id], (err, result) => {
        if (err) {
          console.error("Error deleting chat:", err);
          return res.status(500).json({
            error: "An error occurred while deleting chat",
          });
        }

        res.status(200).json({
          message: "Chat and its messages deleted successfully",
        });
      });
    });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ error: "An error occurred while deleting chat" });
  }
};

// controlador para enviar imágenes desde el administrador
exports.uploadMessageAdmin = async (req, res) => {
  try {
    const { chatId, sender_id, message, sender } = req.body;
    let filePath = null;
    const io = socket.getIO();

    if (req.file) {
      // Generar un nuevo nombre único para la imagen
      const newFileName = `${Date.now()}_${req.file.originalname}`;
      // Construir la ruta completa de la imagen
      filePath = `https://463siemprepagachat.com/server/public/assets/images/${newFileName}`;

      // Renombrar el archivo en el servidor
      fs.renameSync(
        req.file.path,
        path.join(req.file.destination, newFileName)
      );
    }

    // Insertar el nuevo mensaje en la base de datos
    const type = filePath ? "image" : "text";
    const image = filePath || null;

    const messageQuery =
      "INSERT INTO messages (chat_id, sender_id, message, type, image, sender) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(
      messageQuery,
      [chatId, sender_id, message || "", type, image, sender],
      (err, result) => {
        if (err) {
          console.error("Error creating message:", err);
          res.status(500).json({
            error: "An error occurred while creating message",
          });
        } else {
          // Obtener el ID del mensaje insertado
          const messageId = result.insertId;

          const updateQuery =
          "UPDATE chats SET last_updated_at = CURRENT_TIMESTAMP, unread_messages_count = unread_messages_count + 1 WHERE id = ?";
          db.query(updateQuery, [chatId], (err, result) => {
            if (err) {
              console.error("Error updating last_updated_at:", err);
            }
          });

          res.status(200).json({
            message: "Message created successfully",
            messageId: messageId,
            imageUrl: image,
          });

        }
      }
    );
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "An error occurred while creating message" });
  }
};

// Controlador para abrir un chat y restablecer el contador de mensajes no leídos
exports.openChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const io = socket.getIO();

    const query = "UPDATE chats SET unread_messages_count = 0 WHERE id = ?";
    db.query(query, [chatId], (err, result) => {
      if (err) {
        console.error("Error resetting unread messages count:", err);
        res.status(500).json({ error: "An error occurred while opening chat" });
      } else {
        // io.emit('chatOpened', chatId);

        res.status(200).json({ message: "Chat opened successfully" });
      }
    });
  } catch (error) {
    console.error("Error opening chat:", error);
    res.status(500).json({ error: "An error occurred while opening chat" });
  }
};

exports.getChatStatus = async (req, res) => {
  const chatId = req.params.id;

  try {
    const query = `SELECT admin_id, status FROM chats WHERE id = ?`;
    db.query(query, [chatId], (err, result) => {
      if (err) {
        console.error('Error fetching chat status:', err);
        return res.status(500).json({ error: 'An error occurred while fetching chat status' });
      } 
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Chat not found' });
      }
      
      const isActive = result[0].status === 'active';
      res.status(200).json({ status: isActive, admin_id: result[0].admin_id });
    });
  } catch (error) {
    console.error('Error fetching chat status:', error);
    res.status(500).json({ error: 'An error occurred while fetching chat status' });
  }
};


exports.updateStatusClient = async (req, res) => {
  try {
    const { deviceId, status } = req.body;
    // Buscar el clientID en la tabla devices
    const deviceQuery = "SELECT client_id FROM devices WHERE device_fingerprint = ?";
    db.query(deviceQuery, [deviceId], (err, result) => {
      if (err) {
        console.error("Error finding client ID:", err);
        return res.status(500).json({
          error: "An error occurred while finding client ID",
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          error: `Device with ID ${deviceId} not found`,
        });
      }

      const clientID = result[0].client_id;

      console.log(status);

      // Actualizar el estado del cliente en la tabla clients
      const query = "UPDATE clients SET status =? WHERE id =?";
      db.query(query, [status, clientID], (err, result) => {
        if (err) {
          console.error("Error updating status:", err);
          return res.status(500).json({
            error: "An error occurred while updating status",
          });
        }

        // Verificar si se actualizó correctamente
        if (result.affectedRows === 0) {
          return res.status(404).json({
            error: `Client with ID ${clientID} not found`,
          });
        }

        // Envía una respuesta de éxito
        res.status(200).json({
          message: "Client status updated successfully",
        });
      });
    });

  } catch (error) {
    console.error("Error updating client status:", error);
    res.status(500).json({ error: "An error occurred while updating client status" });
  }
};