const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');

// Ruta para agregar un nuevo mensaje automatico
router.post('/add-message', settingController.addMessage);

// Ruta para obtener mensajes automaticos
router.get('/get-all-messages', settingController.getAllMessages);


// Ruta para inhabilitar el mensaje
router.put('/:id/disable', settingController.disableMessage);

// Ruta para habilitar el mensaje
router.put('/:id/enable', settingController.enableMessage);

// Ruta para eliminar un  mensaje automatico
router.post('/:id/delete', settingController.delete);

// Ruta para editar un  mensaje automatico
router.put('/:id/update', settingController.update);

module.exports = router;