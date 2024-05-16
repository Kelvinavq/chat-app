const Team = require("../models/team");

class TeamController {
  static async getAllTeams(req, res) {
    try {
      const teams = await Team.getAllTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getAllTeamsWithUserStatus(req, res) {
    try {
      const userId = req.params.id; 
      const teams = await Team.getAllTeamsWithUserStatus(userId);
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getAllTeamsWithInfo(req, res) {
    try {
      const teams = await Team.getAllTeamsWithInfo();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async addTeam(req, res) {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "El nombre del equipo es obligatorio" });
    }

    try {
      await Team.addTeam(name);
      res.status(201).json({ message: "Equipo añadido correctamente" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getTeamInfoById(req, res) {
    const { id } = req.params;
    try {
      const teamInfo = await Team.getTeamInfoById(id);
      if (teamInfo && teamInfo.usernames) {
        // Convertir la cadena de nombres de usuario separada por comas en un array
        teamInfo.usernames = teamInfo.usernames.split(",");
      } else {
        // Si no se encontró ningún usuario para el equipo, establecer un array vacío
        teamInfo.usernames = [];
      }
      res.json(teamInfo);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async disableTeam(req, res) {
    const { id } = req.params;
    try {
      // Lógica para actualizar el estado del equipo a "inactive" en la base de datos
      await Team.disableTeam(id);
      res.status(200).json({ message: "Equipo inhabilitado exitosamente" });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error al inhabilitar el equipo",
          error: error.message,
        });
    }
  }

  static async enableTeam(req, res) {
    const { id } = req.params;
    try {
      // Lógica para actualizar el estado del equipo a "inactive" en la base de datos
      await Team.enableTeam(id);
      res.status(200).json({ message: "Equipo habilitado exitosamente" });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error al habilitar el equipo",
          error: error.message,
        });
    }
  }

  static async editTeamName(req, res) {
    const { id } = req.params;
    const { newName } = req.body;

    if (!newName) {
      return res.status(400).json({ message: 'El nuevo nombre del equipo es obligatorio' });
    }

    try {
      await Team.editTeamName(id, newName);
      res.status(200).json({ message: 'Nombre del equipo actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateUserWithTeams(req, res) {
    const { id } = req.params;
    const { username, email, password, role, teams } = req.body;
  
    try {
      // Actualizar la información del usuario
      const userUpdateData = { username, email, role };
      if (password) {
        userUpdateData.password = password; // Solo incluir la contraseña si se proporcionó
      }
  
      await User.updateUser(id, userUpdateData);
  
      // Actualizar los equipos asociados
      if (teams && teams.length > 0) {
        await User.updateUserTeams(id, teams);
      }
  
      res.status(200).json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar el usuario", error });
    }
  }
}

module.exports = TeamController;
