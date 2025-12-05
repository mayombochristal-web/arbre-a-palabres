const Joi = require('joi');

// Middleware générique pour valider les schémas
exports.validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }

    next();
};

// Schémas de validation Joi
exports.loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email invalide',
        'any.required': 'L\'email est requis'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Le mot de passe est requis'
    })
});

exports.registerSchema = Joi.object({
    nom: Joi.string().required(),
    prenom: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
    // Ajoutez d'autres champs selon besoin
});
