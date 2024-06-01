const db = require("../Config/database");
const bcrypt = require("bcryptjs");

// Controlador para obtener todos los clientes
exports.getAllClients = async (req, res) => {
  try {
    const query = `
      SELECT * FROM clients ORDER BY id DESC
      `;
    db.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching clients list:", err);
        res
          .status(500)
          .json({ error: "An error occurred while fetching clients list" });
      } else {
        res.status(200).json({ clients: result });
      }
    });
  } catch (error) {
    console.error("Error fetching clients list:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching clients list" });
  }
};

// Controlador para editar un cliente
exports.update = async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  const { email } = req.body;
  try {
    const query = `
      UPDATE clients SET username = ?, email = ? WHERE id = ?
      `;
    const result = await new Promise((resolve, reject) => {
      db.query(query, [username, email, id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "client edited successfully" });
    } else {
      res.status(404).json({ error: "client not found" });
    }
  } catch (error) {
    console.error("Error edit client:", error);
    res.status(500).json({ error: "An error occurred while edit the client" });
  }
};

// Controlador para editar un cliente
exports.updatePassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
        UPDATE clients SET password = ? WHERE id = ?
        `;
    const result = await new Promise((resolve, reject) => {
      db.query(query, [hashedPassword, id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "client edited successfully" });
    } else {
      res.status(404).json({ error: "client not found" });
    }
  } catch (error) {
    console.error("Error edit client:", error);
    res.status(500).json({ error: "An error occurred while edit the client" });
  }
};
