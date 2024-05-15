class SomeProtectedController {
    static async someMethod(req, res) {
      try {
        // Ejemplo de lógica para una ruta protegida
        res.status(200).json({ message: "Acceso a ruta protegida exitoso.", user: req.user });
      } catch (error) {
        console.error("Error en la ruta protegida:", error);
        res.status(500).json({ error: "Error al acceder a la ruta protegida." });
      }
    }
  }
  
  module.exports = SomeProtectedController;
  