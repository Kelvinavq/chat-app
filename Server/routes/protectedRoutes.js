const express = require("express");
const router = express.Router();
const SomeProtectedController = require("../controllers/someProtectedController");
const authMiddleware = require("../middleware/authMiddleware");

// Ruta protegida de ejemplo
router.get("/protected-route", authMiddleware, SomeProtectedController.someMethod);

module.exports = router;
