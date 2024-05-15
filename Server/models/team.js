const db = require("../Config/database");

class Team {
  // Método para obtener todos los equipos
  static getAllTeams() {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM teams WHERE status = "active"',
        (error, results) => {
          if (error) {
            reject(new Error("Error al obtener los equipos"));
          } else {
            resolve(results);
          }
        }
      );
    });
  }

  static getAllTeamsWithInfo() {
    return new Promise((resolve, reject) => {
      const query = `
                SELECT teams.*, 
                COUNT(DISTINCT user_teams.user_id) AS user_count, 
                COUNT(DISTINCT chats.id) AS chat_count
                FROM teams
                LEFT JOIN user_teams ON teams.id = user_teams.team_id
                LEFT JOIN chats ON teams.id = chats.team_id
                GROUP BY teams.id
                ORDER BY teams.id DESC
            `;
      db.query(query, (error, results) => {
        if (error) {
          reject(
            new Error("Error al obtener los equipos con información adicional")
          );
        } else {
          resolve(results);
        }
      });
    });
  }

  static addTeam(name) {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO teams (name, status) VALUES (?, "active")';
      db.query(query, [name], (error, results) => {
        if (error) {
          reject(new Error("Error al añadir el equipo"));
        } else {
          resolve(results);
        }
      });
    });
  }

  static getTeamInfoById(id) {
    return new Promise((resolve, reject) => {
      const query = `
      SELECT teams.*, 
      COUNT(DISTINCT user_teams.user_id) AS user_count, 
      COUNT(DISTINCT chats.id) AS chat_count,
      (SELECT COUNT(*) FROM chats WHERE chats.team_id = teams.id AND chats.status = 'active') AS active_chat_count,
      (SELECT COUNT(*) FROM chats WHERE chats.team_id = teams.id AND chats.status = 'closed') AS inactive_chat_count,
      GROUP_CONCAT(users.username) AS usernames
  FROM teams
  LEFT JOIN user_teams ON teams.id = user_teams.team_id
  LEFT JOIN chats ON teams.id = chats.team_id
  LEFT JOIN users ON user_teams.user_id = users.id
  WHERE teams.id = ?
  GROUP BY teams.id
  
      `;
      db.query(query, [id], (error, results) => {
        if (error) {
          reject(
            new Error("Error al obtener la información del equipo por ID")
          );
        } else {
          resolve(results[0]); // Devolver solo el primer resultado
        }
      });
    });
  }

  static disableTeam(teamId) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE teams SET status = "inactive" WHERE id = ?';
      db.query(query, [teamId], (error, results) => {
        if (error) {
          reject(new Error("Error al inhabilitar el equipo"));
        } else {
          resolve(results);
        }
      });
    });
  }

  static enableTeam(teamId) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE teams SET status = "active" WHERE id = ?';
      db.query(query, [teamId], (error, results) => {
        if (error) {
          reject(new Error("Error al habilitar el equipo"));
        } else {
          resolve(results);
        }
      });
    });
  }

  static editTeamName(id, newName) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE teams SET name = ? WHERE id = ?';
      db.query(query, [newName, id], (error, results) => {
        if (error) {
          reject(new Error("Error al editar el nombre del equipo"));
        } else {
          resolve(results);
        }
      });
    });
  }
}

module.exports = Team;
