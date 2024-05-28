const multer = require('multer');
const path = require('path');
const sharp = require('sharp'); 

// Configura el almacenamiento de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/assets/images'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

// Filtra solo las imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Configura Multer con el almacenamiento y el filtro de archivos
const upload = multer({ 
  storage, 
  fileFilter,
});

// Middleware de procesamiento de imágenes antes de guardarlas
const processImage = (req, res, next) => {
  if (req.file) {
    // Define la ruta de salida para el archivo comprimido
    const compressedFilePath = req.file.path.replace(
      path.extname(req.file.path),
      `-compressed${path.extname(req.file.path)}`
    );

    // Usa sharp para comprimir la imagen
    sharp(req.file.path)
      .resize(800) // Ajusta el tamaño si es necesario
      .toFile(compressedFilePath, (err, info) => {
        if (err) {
          console.error('Error processing image:', err);
          next(err);
        } else {
          // Elimina el archivo original
          // fs.unlinkSync(req.file.path);

          // Cambia la ruta al archivo comprimido
          req.file.path = compressedFilePath;
          next();
        }
      });
  } else {
    next();
  }
};

module.exports = { 
  upload,
  processImage,
};
