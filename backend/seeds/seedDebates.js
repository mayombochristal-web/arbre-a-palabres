const mongoose = require('mongoose');
const Debat = require('../models/Debat');
require('dotenv').config();

const themes = [
    { theme: "Pourquoi j'aime ma culture gabonaise", categorie: "Primaire" },
    { theme: "L'importance de l'éducation pour le développement", categorie: "Primaire" },
    { theme: "Les réseaux sociaux : avantage ou danger ?", categorie: "Collège" },
    { theme: "La préservation de l'environnement au Gabon", categorie: "Collège" },
    { theme: "L'intelligence artificielle et l'avenir de l'emploi", categorie: "Lycée" },
    { theme: "La place des femmes dans la politique gabonaise", categorie: "Lycée" },
    { theme: "Le retour aux valeurs traditionnelles est-il un frein au développement ?", categorie: "Universitaire" },
    { theme: "La diversification économique du Gabon : utopie ou réalité ?", categorie: "Universitaire" }
];

const seedDebates = async () => {
    try {
        console.log('🌱 Début du seeding des débats...');

        // Connexion si non connecté
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('✅ Connecté à MongoDB');
        }

        let count = 0;
        for (const item of themes) {
            const exists = await Debat.findOne({ theme_debat: item.theme });
            if (!exists) {
                await new Debat({
                    theme_debat: item.theme,
                    categorie: item.categorie,
                    statut: 'en_attente',
                    type_debat: 'standard',
                    description: `Débat de niveau ${item.categorie}`,
                    date_debat: new Date(),
                    participants_ids: [], // Important : laisser vide ou mettre des IDs valides si requis par le schéma
                    juge_id: null // Idem
                }).save();
                count++;
                console.log(`➕ Ajouté: ${item.theme}`);
            } else {
                console.log(`ℹ️ Existe déjà: ${item.theme}`);
            }
        }

        console.log(`✅ Seeding terminé. ${count} nouveaux débats.`);
        // process.exit(0); // Ne pas kill le process si appelé depuis le serveur
    } catch (error) {
        console.error('❌ Erreur seeding:', error);
        // process.exit(1);
    }
};

// Export au lieu d'auto-exécution
module.exports = seedDebates;

// Exécution seulement si appelé directement : node seedDebates.js
if (require.main === module) {
    seedDebates().then(() => {
        console.log('Script terminé.');
        process.exit(0);
    });
}
