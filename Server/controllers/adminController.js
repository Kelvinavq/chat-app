const db = require("../Config/database");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const multer = require("multer");

// Configuración de multer para la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/assets/profile/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

exports.getAdminInfo = async (req, res) => {
  const { id } = req.params;

  try {
    const query = "SELECT username, email, image FROM users WHERE id = ?";
    db.query(query, [id], (err, result) => {
      if (err) {
        console.error("Error fetching admin info:", err);
        return res.status(500).json({ error: "Failed to fetch admin info" });
      }
      if (result.length > 0) {
        res.status(200).json(result[0]);
      } else {
        res.status(404).json({ error: "Admin not found" });
      }
    });
  } catch (error) {
    console.error("Error fetching admin info:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.updateAdminInfo = async (req, res) => {
  const { adminId } = req.params;
  const { username, email } = req.body;

  try {
    const query = "UPDATE users SET username = ?, email = ? WHERE id = ?";
    db.query(query, [username, email, adminId], (err, result) => {
      if (err) {
        console.error("Error updating admin info:", err);
        return res.status(500).json({ error: "Failed to update admin info" });
      }
      res.status(200).json({ message: "Admin info updated successfully" });
    });
  } catch (error) {
    console.error("Error updating admin info:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.changeAdminPassword = async (req, res) => {
  const { adminId } = req.params;
  const { password } = req.body;

  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = "UPDATE users SET password = ? WHERE id = ?";
    db.query(query, [hashedPassword, adminId], (err, result) => {
      if (err) {
        console.error("Error updating admin password:", err);
        return res
          .status(500)
          .json({ error: "Failed to update admin password" });
      }
      res.status(200).json({ message: "Admin password updated successfully" });
    });
  } catch (error) {
    console.error("Error updating admin password:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};

exports.updateAdminImage = async (req, res) => {
  const { adminId } = req.params;

  // Utilizar multer para manejar la carga del archivo
  upload.single('image')(req, res, async (err) => {
    if (err) {
      console.error("Error uploading image:", err);
      return res.status(500).json({ error: "Failed to upload image" });
    }

    const newImage = req.file.filename;

    try {
      // Obtener la imagen actual del administrador
      const querySelect = "SELECT image FROM users WHERE id = ?";
      const result = await new Promise((resolve, reject) => {
        db.query(querySelect, [adminId], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      const oldImage = result.length > 0 ? result[0].image : null;

      // Actualizar la imagen en la base de datos
      const queryUpdate = "UPDATE users SET image = ? WHERE id = ?";
      await new Promise((resolve, reject) => {
        db.query(queryUpdate, [newImage, adminId], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      // Eliminar la imagen antigua si existe
      if (oldImage) {
        const oldImagePath = path.join(__dirname, '../public/assets/profile/', oldImage);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Error deleting old image:", err);
        });
      }

      res.status(200).json({ message: "Admin image updated successfully", image: newImage });
    } catch (error) {
      console.error("Error updating admin image:", error);
      res.status(500).json({ error: "Failed to update admin image" });
    }
  });
};

exports.getAdminTeams = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT teams.id, teams.name 
      FROM user_teams 
      INNER JOIN teams ON user_teams.team_id = teams.id 
      WHERE user_teams.user_id = ?
    `;
    db.query(query, [id], (err, result) => {
      if (err) {
        console.error("Error fetching admin teams:", err);
        return res.status(500).json({ error: "Failed to fetch admin teams" });
      }
      res.status(200).json({ teams: result });
    });
  } catch (error) {
    console.error("Error fetching admin teams:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};

