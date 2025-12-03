const rateLimit = require('express-rate-limit');

// Rate limiter général pour toutes les routes
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes par IP
    message: {
        error: 'Trop de requêtes depuis cette IP, veuillez réessayer dans 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiter strict pour les routes d'authentification
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives maximum
    message: {
        error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes'
    },
    skipSuccessfulRequests: true, // Ne compte pas les tentatives réussies
});

// Rate limiter pour les inscriptions
const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 3, // 3 inscriptions max par IP par heure
    message: {
        error: 'Trop d\'inscriptions depuis cette IP. Veuillez réessayer dans 1 heure'
    },
});

// Rate limiter pour les créations de débats (admin)
const debatCreationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 débats max par minute
    message: {
        error: 'Trop de créations de débats. Ralentissez un peu !'
    },
});

module.exports = {
    generalLimiter,
    authLimiter,
    registrationLimiter,
    debatCreationLimiter
};
