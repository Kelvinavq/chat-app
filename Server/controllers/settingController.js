const db = require("../Config/database");

exports.addMessage = async (req, res) => {
  const { name, type, team, message } = req.body;

  try {
    const messageInsert = `
        INSERT INTO auto_messages (name, type, team_id, message)
        VALUES (?, ?, ?, ?)
      `;
    const messageInsertResult = await new Promise((resolve, reject) => {
      db.query(messageInsert, [name, type, team, message], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    // Envíar una respuesta exitosa
    res.status(200).json({ message: "auto message registered successfully" });
  } catch (error) {
    console.error("Error registering auto message:", error);
    res
      .status(500)
      .json({ error: "An error occurred while registering auto message" });
  }
};

// Controlador para obtener todos los mensajes
exports.getAllMessages = async (req, res) => {
  try {
    const query = `
    SELECT * FROM auto_messages ORDER BY id DESC
    `;
    db.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching message list:", err);
        res
          .status(500)
          .json({ error: "An error occurred while fetching message list" });
      } else {
        res.status(200).json({ auto_messages: result });
      }
    });
  } catch (error) {
    console.error("Error fetching message list:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching message list" });
  }
};

// Controlador para inhabilitar un mensaje
exports.disableMessage = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      UPDATE auto_messages
      SET status = 'inactive'
      WHERE id = ?
    `;
    const result = await new Promise((resolve, reject) => {
      db.query(query, [id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Message disabled successfully" });
    } else {
      res.status(404).json({ error: "Message not found" });
    }
  } catch (error) {
    console.error("Error disabling message:", error);
    res
      .status(500)
      .json({ error: "An error occurred while disabling the message" });
  }
};

// Controlador para habilitar un mensaje
exports.enableMessage = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      UPDATE auto_messages
      SET status = 'active'
      WHERE id = ?
    `;
    const result = await new Promise((resolve, reject) => {
      db.query(query, [id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Message enabled successfully" });
    } else {
      res.status(404).json({ error: "Message not found" });
    }
  } catch (error) {
    console.error("Error enabling message:", error);
    res
      .status(500)
      .json({ error: "An error occurred while enabling the message" });
  }
};

// Controlador para eliminar un mensaje
exports.delete = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
    DELETE FROM auto_messages WHERE id = ?
    `;
    const result = await new Promise((resolve, reject) => {
      db.query(query, [id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Message deleted successfully" });
    } else {
      res.status(404).json({ error: "Message not found" });
    }
  } catch (error) {
    console.error("Error delete message:", error);
    res
      .status(500)
      .json({ error: "An error occurred while delete the message" });
  }
};

// Controlador para editar un mensaje
exports.update = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const { message } = req.body;
  try {
    const query = `
    UPDATE auto_messages SET name = ?, message = ? WHERE id = ?
    `;
    const result = await new Promise((resolve, reject) => {
      db.query(query, [name, message, id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Message edited successfully" });
    } else {
      res.status(404).json({ error: "Message not found" });
    }
  } catch (error) {
    console.error("Error edit message:", error);
    res.status(500).json({ error: "An error occurred while edit the message" });
  }
};

