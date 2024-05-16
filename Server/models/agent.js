const db = require("../Config/database");

// Modelo de agentes
class Agent {
  // Método para obtener todos los usuarios
  static getAllAgents() {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM users", (error, results) => {
        if (error) {
          reject(new Error("Error al obtener los agentes"));
        } else {
          resolve(results);
        }
      });
    });
  }

  static getAgentInfoById(id) {
    return new Promise((resolve, reject) => {
      const query = `
      SELECT users.*, 
      COUNT(DISTINCT user_teams.team_id) AS team_count, 
      COUNT(DISTINCT chats.id) AS chat_count,
      (SELECT COUNT(*) FROM chats WHERE chats.admin_id = users.id) AS admin_chat_count,
      (SELECT COUNT(*) FROM chats WHERE chats.admin_id = users.id AND chats.status = 'active') AS active_chat_count,
      (SELECT COUNT(*) FROM chats WHERE chats.admin_id = users.id AND chats.status = 'closed') AS inactive_chat_count,
      GROUP_CONCAT(teams.name) AS teams
    FROM users
    LEFT JOIN user_teams ON users.id = user_teams.user_id
    LEFT JOIN teams ON user_teams.team_id = teams.id
    LEFT JOIN chats ON users.id = chats.admin_id
    WHERE users.id = ?
    GROUP BY users.id;
    
      `;
      db.query(query, [id], (error, results) => {
        if (error) {
          reject(
            new Error("Error al obtener la información del agente por ID")
          );
        } else {
          resolve(results[0]); // Devolver solo el primer resultado
        }
      });
    });
  }

  static disableAgent(agentId) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET status = "suspended" WHERE id = ?';
      db.query(query, [agentId], (error, results) => {
        if (error) {
          reject(new Error("Error al suspender el usuario"));
        } else {
          resolve(results);
        }
      });
    });
  }

  static enableAgent(agentId) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET status = "active" WHERE id = ?';
      db.query(query, [agentId], (error, results) => {
        if (error) {
          reject(new Error("Error al habilitar el usuario"));
        } else {
          resolve(results);
        }
      });
    });
  }

  static getAllAgentsSuspended() {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM users WHERE status = 'suspended'", (error, results) => {
        if (error) {
          reject(new Error("Error al obtener los agentes"));
        } else {
          resolve(results);
        }
      });
    });
  }


}

module.exports = Agent;
