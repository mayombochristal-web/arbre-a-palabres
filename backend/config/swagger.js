const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Arbre à Palabres',
            version: '1.0.0',
            description: 'Documentation de l\'API pour l\'application de débats Arbre à Palabres',
            contact: {
                name: 'Support Technique',
                email: 'support@arbre-a-palabres.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Serveur de développement',
            },
            {
                url: 'https://arbre-palabres-backend.onrender.com/api',
                description: 'Serveur de production',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'], // Fichiers contenant les annotations
};

const specs = swaggerJsdoc(options);

module.exports = specs;
