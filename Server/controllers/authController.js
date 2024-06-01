const db = require("../Config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validar que se reciban todos los datos necesarios
      if (!email || !password) {
        return res.status(400).json({ message: "Todos los campos son obligatorios." });
      }

      // Verificar si el correo electrónico está registrado
      const queryUser = "SELECT * FROM users WHERE email = ?";
      const userRows = await new Promise((resolve, reject) => {
        db.query(queryUser, [email], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

      if (userRows.length === 0) {
        return res.status(400).json({ message: "Credenciales inválidas." });
      }

      const user = userRows[0];

      // Verificar la contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Credenciales inválidas." });
      }

      // Generar un token de sesión
      const token = jwt.sign({ id: user.id, role: user.role }, "secret_key", { expiresIn: "1h" });

      const adminId = user.id;
      const role = user.role;

      res.status(200).json({ message: "Login exitoso.", token,  adminId, role});
    } catch (error) {
      console.error("Error en el login:", error);
      res.status(500).json({ error: "Error al iniciar sesión." });
    }
  }
}

module.exports = AuthController;
