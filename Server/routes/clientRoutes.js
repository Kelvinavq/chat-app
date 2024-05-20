const express = require('express');
const router = express.Router();

const clientController = require('../controllers/clientController');

// Ruta para obtener los clientes
router.get('/get-all-clients', clientController.getAllClients);

// Ruta para editar un cliente
router.put('/:id/update', clientController.update);

// Ruta para editar un cliente
router.put('/:id/update-password', clientController.updatePassword);

module.exports = router;