const express = require('express');
const router = express.Router();
const TeamController = require('../controllers/teamController');

// Ruta para obtener todos los equipos
router.get('/teams', TeamController.getAllTeams);

// Ruta para obtener todos los equipos con información adicional
router.get('/teams/info', TeamController.getAllTeamsWithInfo);

// Ruta para agregar un nuevo equipo
router.post('/add-team', TeamController.addTeam);

// Ruta para obtener los detalles del equipo
router.get('/teams/details/:id', TeamController.getTeamInfoById);

// Ruta para inhabilitar el equipo
router.put('/teams/:id/disable', TeamController.disableTeam);

// Ruta para habilitar el equipo
router.put('/teams/:id/enable', TeamController.enableTeam);

// Ruta para editar el nombre de un equipo
router.put('/teams/:id/edit-name', TeamController.editTeamName);

// Ruta para obtener los equipos al que pertenece un usuario
router.get('/teams/get-teams-user/:id', TeamController.getAllTeamsWithUserStatus);

// Ruta para actualizar usuario y equipos asociados
router.put('/teams/update/:id', TeamController.updateUserWithTeams);

module.exports = router;
