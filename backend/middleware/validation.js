const { validationResult } = require('express-validator');

/**
 * Middleware pour gérer les erreurs de validation
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Erreur de validation',
            errors: errors.array().map(err => ({
                field: err.param || err.path,
                message: err.msg,
                value: err.value
            }))
        });
    }
    next();
};

module.exports = validate;
