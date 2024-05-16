const db = require("../Config/database");
const bcrypt = require("bcrypt");
const Agent = require("../models/agent");

class AgentController {
  // Método para registrar un nuevo agente
  static async registerAgent(req, res) {
    try {
      const { username, email, password, role, team } = req.body;

      // Validar que se reciban todos los datos necesarios
      if (!username || !email || !password || !role || !team) {
        return res
          .status(400)
          .json({ message: "Todos los campos son obligatorios." });
      }

      // Iniciar una transacción
      await new Promise((resolve, reject) => {
        db.beginTransaction(async (err) => {
          if (err) return reject(err);

          try {
            // Verificar si el equipo existe
            const queryTeam = "SELECT id FROM teams WHERE id = ?";
            const teamRows = await new Promise((resolve, reject) => {
              db.query(queryTeam, [team], (err, results) => {
                if (err) return reject(err);
                resolve(results);
              });
            });

            if (teamRows.length === 0) {
              return db.rollback(() => {
                res.status(404).json({ message: "El equipo no existe." });
              });
            }

            const teamId = teamRows[0].id;

            // Verificar si el nombre de usuario ya está en uso
            const queryUsername = "SELECT id FROM users WHERE username = ?";
            const usernameRows = await new Promise((resolve, reject) => {
              db.query(queryUsername, [username], (err, results) => {
                if (err) return reject(err);
                resolve(results);
              });
            });

            if (usernameRows.length > 0) {
              return db.rollback(() => {
                res
                  .status(400)
                  .json({ message: "El nombre de usuario ya está en uso." });
              });
            }

            // Verificar si el correo electrónico ya está registrado
            const queryEmail = "SELECT id FROM users WHERE email = ?";
            const emailRows = await new Promise((resolve, reject) => {
              db.query(queryEmail, [email], (err, results) => {
                if (err) return reject(err);
                resolve(results);
              });
            });

            if (emailRows.length > 0) {
              return db.rollback(() => {
                res
                  .status(400)
                  .json({
                    message: "El correo electrónico ya está registrado.",
                  });
              });
            }

            // Encriptar la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insertar el nuevo usuario en la tabla users
            const insertUser =
              "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";
            const userResult = await new Promise((resolve, reject) => {
              db.query(
                insertUser,
                [username, email, hashedPassword, role],
                (err, results) => {
                  if (err) return reject(err);
                  resolve(results);
                }
              );
            });

            const userId = userResult.insertId;

            // Insertar el usuario en la tabla user_teams
            const insertUserTeam =
              "INSERT INTO user_teams (user_id, team_id) VALUES (?, ?)";
            await new Promise((resolve, reject) => {
              db.query(insertUserTeam, [userId, teamId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
              });
            });

            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  res
                    .status(500)
                    .json({ error: "Error al registrar el agente." });
                });
              }

              res
                .status(201)
                .json({ message: "Usuario añadido correctamente." });
            });
          } catch (error) {
            db.rollback(() => {
              console.error("Error registrando el agente:", error);
              res.status(500).json({ error: "Error al registrar el agente." });
            });
          }
        });
      });
    } catch (error) {
      console.error("Error registrando el agente:", error);
      res.status(500).json({ error: "Error al registrar el agente." });
    }
  }

  static async getAllAgents(req, res) {
    try {
      const agents = await Agent.getAllAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getAgentInfoById(req, res) {
    const { id } = req.params;
    try {
      const agentInfo = await Agent.getAgentInfoById(id);
      if (agentInfo && agentInfo.teams) {
        // Convertir la cadena de nombres de equipo separada por comas en un array
        agentInfo.teams = agentInfo.teams.split(",");
      } else {
        // Si no se encontró ningún equipo para el ususario, establecer un array vacío
        agentInfo.teams = [];
      }
      res.json(agentInfo);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async disableAgent(req, res) {
    const { id } = req.params;
    try {
      // Lógica para actualizar el estado del usuario a "suspendido" en la base de datos
      await Agent.disableAgent(id);
      res.status(200).json({ message: "usuario suspendido exitosamente" });
    } catch (error) {
      res.status(500).json({
        message: "Error al suspender el usuario",
        error: error.message,
      });
    }
  }

  static async enableAgent(req, res) {
    const { id } = req.params;
    try {
      // Lógica para actualizar el estado del ususario a "active" en la base de datos
      await Agent.enableAgent(id);
      res.status(200).json({ message: "usuario habilitado exitosamente" });
    } catch (error) {
      res.status(500).json({
        message: "Error al habilitar el usuario",
        error: error.message,
      });
    }
  }
}

module.exports = AgentController;
