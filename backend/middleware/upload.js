const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier uploads s'il n'existe pas
const uploadDir = './uploads/documents';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Filtrage des fichiers
const fileFilter = (req, file, cb) => {
  // Vérifier le type de fichier
  const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Formats acceptés: PDF, JPG, JPEG, PNG'), false);
  }
};

// Configuration de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 5 // Maximum 5 fichiers
  }
});

// Middleware pour gérer les erreurs d'upload
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Fichier trop volumineux. Taille maximale: 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Trop de fichiers. Maximum: 5 fichiers'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Champ de fichier inattendu'
      });
    }
  } else if (err) {
    return res.status(400).json({
      error: err.message
    });
  }
  next();
};

module.exports = {
  upload,
  handleUploadErrors
};