const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
    // Log structuré de l'erreur
    logger.error(err.message, {
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body
    });

    // Erreurs de validation Mongoose
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            error: 'Erreur de validation des données',
            details: errors
        });
    }

    // Erreur de cast Mongoose (ID invalide)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Identifiant invalide',
            field: err.path
        });
    }

    // Erreur de duplication (clé unique)
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            error: `Ce ${field} est déjà utilisé`,
            field
        });
    }

    // Erreur JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Token invalide'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Token expiré'
        });
    }

    // Erreur Multer (upload de fichiers)
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'Fichier trop volumineux (max 5MB)'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                error: 'Champ de fichier inattendu'
            });
        }
        return res.status(400).json({
            success: false,
            error: 'Erreur lors de l\'upload du fichier'
        });
    }

    // Erreur par défaut
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'Erreur serveur interne';

    // En production, ne pas exposer les détails techniques
    if (process.env.NODE_ENV === 'production') {
        return res.status(statusCode).json({
            success: false,
            error: statusCode === 500 ? 'Une erreur est survenue' : message
        });
    }

    // En développement, inclure plus de détails
    res.status(statusCode).json({
        success: false,
        error: message,
        stack: err.stack
    });
};

module.exports = errorHandler;
