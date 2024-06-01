const db = require("../Config/database");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  const { username, email, password, deviceId } = req.body;

  try {
    // Verificar si el cliente ya existe en la base de datos
    const clientQuery = 'SELECT * FROM clients WHERE email = ?';
    const client = await new Promise((resolve, reject) => {
      db.query(clientQuery, [email], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });

    if (client) {
      // Si el cliente existe, verificar la contraseña
      const isPasswordCorrect = await bcrypt.compare(password, client.password);
      if (isPasswordCorrect && client.username === username) {
        // Registrar el dispositivo para el cliente existente
        const deviceInsertQuery = `
          INSERT INTO devices (client_id, device_fingerprint)
          VALUES (?, ?)
        `;
        await new Promise((resolve, reject) => {
          db.query(deviceInsertQuery, [client.id, deviceId], (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });

        return res.status(200).json({ message: 'Device registered to existing user successfully' });
      } else {
        return res.status(400).json({ error: 'Username, email or password is incorrect' });
      }
    } else {
      // Si el cliente no existe, crear un nuevo registro de cliente
      const hashedPassword = await bcrypt.hash(password, 10);

      const clientInsertQuery = `
        INSERT INTO clients (username, email, password)
        VALUES (?, ?, ?)
      `;
      const clientInsertResult = await new Promise((resolve, reject) => {
        db.query(
          clientInsertQuery,
          [username, email, hashedPassword],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });

      const clientId = clientInsertResult.insertId;

      const deviceInsertQuery = `
        INSERT INTO devices (client_id, device_fingerprint)
        VALUES (?, ?)
      `;
      await new Promise((resolve, reject) => {
        db.query(deviceInsertQuery, [clientId, deviceId], (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      res.status(200).json({ message: 'User and device registered successfully' });
    }
  } catch (error) {
    console.error('Error registering user and device:', error);
    res.status(500).json({ error: 'An error occurred while registering user and device' });
  }
};


// Método para verificar el estado de registro del cliente y su dispositivo
exports.checkRegistration = async (req, res) => {
  try {
    // Recuperar el deviceId enviado desde el frontend
    const deviceId = req.query.deviceId;

    if (!deviceId) {
      return res.status(400).json({
        error: "deviceId is required"
      });
    }

    // Consultar si existe un dispositivo con la huella digital proporcionada
    const deviceQuery = "SELECT * FROM devices WHERE device_fingerprint = ?";
    db.query(deviceQuery, [deviceId], (err, deviceRows) => {
      if (err) {
        console.error("Error checking client registration:", err);
        res.status(500).json({
          error: "An error occurred while checking client registration",
        });
        return;
      }

      // Verificar si se encontraron resultados
      const isRegistered = deviceRows.length > 0;

    // Obtener el client_id del primer resultado
    const clientId = isRegistered ? deviceRows[0].client_id : null;


      res.status(200).json({ isRegistered, clientId  });
    });
  } catch (error) {
    console.error("Error checking client registration:", error);
    res
      .status(500)
      .json({ error: "An error occurred while checking client registration" });
  }
};

// verificar huella digital del navegador del cliente
exports.checkLastChatStatus = async (req, res) => {
  const { deviceId } = req.query;

  try {
    // Consultar el client_id basado en el deviceId
    const deviceQuery =
      "SELECT client_id FROM devices WHERE device_fingerprint = ?";
    db.query(deviceQuery, [deviceId], async (err, deviceRows) => {
      if (err) {
        console.error("Error checking last chat status:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while checking last chat status" });
      }

      if (deviceRows.length === 0) {
        // Si no se encuentra el dispositivo, devolver un estado por defecto
        return res.status(200).json({ isLastChatActive: false });
      }

      const clientId = deviceRows[0].client_id;

      // Consultar el último chat del cliente
      const chatQuery =
        "SELECT id, status FROM chats WHERE client_id = ? ORDER BY created_at DESC LIMIT 1";
      db.query(chatQuery, [clientId], (err, chatRows) => {
        if (err) {
          console.error("Error checking last chat status:", err);
          return res.status(500).json({
            error: "An error occurred while checking last chat status",
          });
        }

        if (chatRows.length === 0) {
          
          // Si no hay chats para este cliente, devolver un estado por defecto
          return res.status(200).json({ isLastChatActive: false });
        }
        
        const chatId = chatRows[0].id;
        const isLastChatActive = chatRows[0].status === "active";

        // Devolver el estado del último chat y el id
        res.status(200).json({ isLastChatActive, chatId });
      });
    });
  } catch (error) {
    console.error("Error checking last chat status:", error);
    res
      .status(500)
      .json({ error: "An error occurred while checking last chat status" });
  }
};

// obtener informacion del cliente
exports.getClientInfo = async (req, res) => {
  try {
    // Recuperar el deviceId enviado desde el frontend
    const deviceId = req.query.deviceId;

    // Consultar el ID del cliente basado en el deviceId
    const clientIdQuery =
      "SELECT client_id FROM devices WHERE device_fingerprint = ?";
    db.query(clientIdQuery, [deviceId], (err, deviceRows) => {
      if (err) {
        console.error("Error getting client ID:", err);
        res
          .status(500)
          .json({ error: "An error occurred while getting client ID" });
        return;
      }

      // Verificar si se encontraron resultados
      if (deviceRows.length > 0) {
        const clientId = deviceRows[0].client_id;

        // Consultar la información del cliente basada en el client_id
        const clientInfoQuery =
          "SELECT id, username, email FROM clients WHERE id = ?";
        db.query(clientInfoQuery, [clientId], (err, clientRows) => {
          if (err) {
            console.error("Error getting client info:", err);
            res
              .status(500)
              .json({ error: "An error occurred while getting client info" });
            return;
          }

          // Verificar si se encontraron resultados
          if (clientRows.length > 0) {
            const clientInfo = clientRows[0];
            res.status(200).json({ clientInfo });
          } else {
            return res.status(404).json({ clientInfo: null });
          }
        });
      } else {
        return res.status(404).json({ clientInfo: null });
      }
    });
  } catch (error) {
    console.error("Error getting client info:", error);
    res
      .status(500)
      .json({ error: "An error occurred while getting client info" });
  }
};
