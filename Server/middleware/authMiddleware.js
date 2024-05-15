const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Acceso denegado. No hay token proporcionado." });
  }

  try {
    const decoded = jwt.verify(token, "secret_key");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Token inválido." });
  }
};

module.exports = authMiddleware;
