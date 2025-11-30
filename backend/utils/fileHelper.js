const fs = require('fs');

/**
 * Supprime un fichier de manière sécurisée
 * Vérifie l'existence avant de supprimer et gère les erreurs
 * 
 * @param {string} filePath - Chemin du fichier à supprimer
 * @returns {boolean} - true si supprimé avec succès, false sinon
 */
const safeDeleteFile = (filePath) => {
    if (!filePath) {
        return false;
    }

    try {
        // Vérifier si le fichier existe
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Fichier supprimé: ${filePath}`);
            return true;
        } else {
            console.log(`Fichier non trouvé (déjà supprimé?): ${filePath}`);
            return false;
        }
    } catch (err) {
        console.error(`Erreur lors de la suppression du fichier ${filePath}:`, err.message);
        return false;
    }
};

/**
 * Supprime plusieurs fichiers de manière sécurisée
 * 
 * @param {string[]} filePaths - Tableau de chemins de fichiers
 * @returns {Object} - Résultat avec nombre de fichiers supprimés
 */
const safeDeleteFiles = (filePaths) => {
    if (!Array.isArray(filePaths)) {
        return { deleted: 0, failed: 0 };
    }

    let deleted = 0;
    let failed = 0;

    filePaths.forEach(filePath => {
        if (safeDeleteFile(filePath)) {
            deleted++;
        } else {
            failed++;
        }
    });

    return { deleted, failed };
};

/**
 * Supprime les fichiers uploadés dans une requête
 * Utile pour nettoyer après une erreur
 * 
 * @param {Object} files - Objet req.files de Multer
 * @returns {Object} - Résultat de la suppression
 */
const cleanupUploadedFiles = (files) => {
    if (!files) {
        return { deleted: 0, failed: 0 };
    }

    const filePaths = [];

    // Gérer les différents formats de req.files
    if (Array.isArray(files)) {
        // Format: req.files (array)
        files.forEach(file => {
            if (file.path) filePaths.push(file.path);
        });
    } else if (typeof files === 'object') {
        // Format: req.files (object avec champs nommés)
        Object.keys(files).forEach(fieldName => {
            const fieldFiles = files[fieldName];
            if (Array.isArray(fieldFiles)) {
                fieldFiles.forEach(file => {
                    if (file.path) filePaths.push(file.path);
                });
            } else if (fieldFiles && fieldFiles.path) {
                filePaths.push(fieldFiles.path);
            }
        });
    }

    return safeDeleteFiles(filePaths);
};

module.exports = {
    safeDeleteFile,
    safeDeleteFiles,
    cleanupUploadedFiles
};
