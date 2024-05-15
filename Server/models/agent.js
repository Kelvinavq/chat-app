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
}

module.exports = User;
