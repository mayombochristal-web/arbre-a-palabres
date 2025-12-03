const Joi = require('joi');

// Validation pour l'inscription des candidats
const inscriptionCandidatSchema = Joi.object({
    nom: Joi.string()
        .min(2)
        .max(50)
        .required()
        .trim()
        .pattern(/^[a-zA-ZÀ-ÿ\s-]+$/)
        .messages({
            'string.base': 'Le nom doit être une chaîne de caractères',
            'string.min': 'Le nom doit contenir au moins 2 caractères',
            'string.max': 'Le nom ne peut pas dépasser 50 caractères',
            'string.pattern.base': 'Le nom ne peut contenir que des lettres',
            'any.required': 'Le nom est obligatoire'
        }),

    prenom: Joi.string()
        .min(2)
        .max(50)
        .required()
        .trim()
        .pattern(/^[a-zA-ZÀ-ÿ\s-]+$/)
        .messages({
            'string.min': 'Le prénom doit contenir au moins 2 caractères',
            'string.max': 'Le prénom ne peut pas dépasser 50 caractères',
            'string.pattern.base': 'Le prénom ne peut contenir que des lettres',
            'any.required': 'Le prénom est obligatoire'
        }),

    dateNaissance: Joi.date()
        .required()
        .max('now')
        .min('1950-01-01')
        .messages({
            'date.base': 'La date de naissance doit être une date valide',
            'date.max': 'La date de naissance ne peut pas être dans le futur',
            'date.min': 'La date de naissance semble incorrecte',
            'any.required': 'La date de naissance est obligatoire'
        }),

    email: Joi.string()
        .email()
        .required()
        .trim()
        .lowercase()
        .messages({
            'string.email': 'L\'email doit être une adresse email valide',
            'any.required': 'L\'email est obligatoire'
        }),

    telephone: Joi.string()
        .pattern(/^[0-9]{8,10}$/)
        .required()
        .messages({
            'string.pattern.base': 'Le téléphone doit contenir 8 à 10 chiffres',
            'any.required': 'Le téléphone est obligatoire'
        }),

    nationalite: Joi.string()
        .min(2)
        .max(50)
        .required()
        .trim()
        .messages({
            'any.required': 'La nationalité est obligatoire'
        }),

    nomEtablissement: Joi.string()
        .min(2)
        .max(100)
        .required()
        .trim()
        .messages({
            'any.required': 'Le nom de l\'établissement est obligatoire'
        }),

    tiktokLink: Joi.string()
        .uri()
        .allow('', null)
        .optional(),

    tiktokProfileName: Joi.string()
        .max(50)
        .allow('', null)
        .optional(),

    typeCandidat: Joi.string()
        .valid('EleveEtudiant', 'Entrepreneur')
        .default('EleveEtudiant'),

    paymentMessage: Joi.string()
        .max(500)
        .allow('', null)
        .optional()
});

// Validation pour l'authentification
const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Email invalide',
            'any.required': 'Email requis'
        }),

    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
            'any.required': 'Mot de passe requis'
        })
});

// Validation pour la création de débat
const creerDebatSchema = Joi.object({
    participantsIds: Joi.array()
        .items(Joi.string().hex().length(24)) // MongoDB ObjectId
        .length(4)
        .required()
        .messages({
            'array.length': 'Exactement 4 participants sont requis',
            'any.required': 'Les participants sont obligatoires'
        }),

    theme: Joi.string()
        .min(10)
        .max(200)
        .required()
        .trim()
        .messages({
            'string.min': 'Le thème doit contenir au moins 10 caractères',
            'string.max': 'Le thème ne peut pas dépasser 200 caractères',
            'any.required': 'Le thème est obligatoire'
        })
});

// Validation pour le retrait d'argent
const retraitSchema = Joi.object({
    montant: Joi.number()
        .positive()
        .min(500)
        .max(1000000)
        .required()
        .messages({
            'number.positive': 'Le montant doit être positif',
            'number.min': 'Le montant minimum de retrait est 500 FCFA',
            'number.max': 'Le montant maximum de retrait est 1 000 000 FCFA',
            'any.required': 'Le montant est obligatoire'
        }),

    numeroTelephone: Joi.string()
        .pattern(/^[0-9]{8,10}$/)
        .required()
        .messages({
            'string.pattern.base': 'Numéro de téléphone invalide',
            'any.required': 'Le numéro de téléphone est obligatoire'
        })
});

// Middleware de validation
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Retourne toutes les erreurs
            stripUnknown: true // Supprime les champs non attendus
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                error: 'Validation échouée',
                details: errors
            });
        }

        // Remplace req.body par les données validées et nettoyées
        req.body = value;
        next();
    };
};

module.exports = {
    validate,
    inscriptionCandidatSchema,
    loginSchema,
    creerDebatSchema,
    retraitSchema
};
