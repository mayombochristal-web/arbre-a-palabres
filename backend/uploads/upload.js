const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Variables d'environnement
const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads'; // Assurer que la variable d'env est utilisée
const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 5 * 1024 * 1024;

// Créer le dossier uploads s'il n'existe pas
const uploadDir = path.join(UPLOAD_PATH, 'documents');
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
    // Le message d'erreur est géré dans handleUploadErrors (plus bas)
    cb(new Error('TYPE_DE_FICHIER_INVALIDE'), false);
  }
};

// Configuration de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE, // CORRECTION A2: Utilisation de la variable d'environnement
    files: 5 // Maximum 5 fichiers (conservé)
  }
});

// Middleware pour gérer les erreurs d'upload
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: `Fichier trop volumineux. Taille maximale: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Nombre de fichiers maximum dépassé (5)'
      });
    }
    return res.status(400).json({
      error: `Erreur d'upload Multer: ${err.message}`
    });
  }

  // Gérer l'erreur de type de fichier
  if (err && err.message === 'TYPE_DE_FICHIER_INVALIDE') {
      return res.status(400).json({
        error: 'Type de fichier non autorisé. Formats acceptés: PDF, JPG, JPEG, PNG'
      });
  }
  
  // Passer les autres erreurs au gestionnaire d'erreurs global
  next(err);
};

module.exports = { 
  upload, 
  handleUploadErrors 
};