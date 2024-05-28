const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Ruta para obtener la informacion del admin
router.get('/admin-info/:id', adminController.getAdminInfo);

router.post("/update-info/:adminId", adminController.updateAdminInfo);
router.post("/change-password/:adminId", adminController.changeAdminPassword);
router.post("/update-image/:adminId", adminController.updateAdminImage );

router.get('/teams/:id', adminController.getAdminTeams);



module.exports = router;
