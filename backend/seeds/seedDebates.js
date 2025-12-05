const mongoose = require('mongoose');
const Debat = require('../models/Debat');
const logger = require('../config/logger');
require('dotenv').config();

const themes = [
    // Primaire
    { theme: "Pourquoi j'aime ma culture gabonaise", categorie: "Primaire" },
    { theme: "La forêt gabonaise : notre trésor à protéger", categorie: "Primaire" },
    { theme: "Comment la gentillesse peut changer une école", categorie: "Primaire" },

    // Collège
    { theme: "Les réseaux sociaux : danger ou opportunité pour les jeunes gabonais ?", categorie: "College/Lycee" },
    { theme: "Le civisme : un devoir pour construire le Gabon de demain", categorie: "College/Lycee" },
    { theme: "Comment le sport peut prévenir la violence chez les jeunes", categorie: "College/Lycee" },

    // Lycée
    { theme: "La jeunesse gabonaise peut-elle être le moteur du changement ?", categorie: "College/Lycee" },
    { theme: "L'entrepreneuriat jeune : solution au chômage au Gabon ?", categorie: "College/Lycee" },

    // Universitaire
    { theme: "Le rôle de la jeunesse intellectuelle dans la reconstruction du Gabon", categorie: "Universitaire" },
    { theme: "Comment l'innovation peut transformer l'économie gabonaise ?", categorie: "Universitaire" }
];

const seedDebates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info('Connecté à MongoDB pour le seeding');

        for (const item of themes) {
            const exists = await Debat.findOne({ theme_debat: item.theme });
            if (!exists) {
                const newDebat = new Debat({
                    theme_debat: item.theme,
                    categorie: item.categorie,
                    statut: 'en_attente',
                    date_debut: new Date(), // Date fictive
                    participants_ids: [], // A remplir plus tard
                    scores_participants: [],
                    frais_organisation: 0,
                    gain_vainqueur: 0,
                    frais_unitaire: 0,
                    cagnotte_totale: 0,
                    type_debat: 'standard'
                });
                await newDebat.save();
                logger.info(`Débat ajouté : ${item.theme}`);
            }
        }

        logger.info('Seeding terminé');
        process.exit(0);
    } catch (error) {
        logger.error('Erreur seeding:', error);
        process.exit(1);
    }
};

// seedDebates();
module.exports = seedDebates;
