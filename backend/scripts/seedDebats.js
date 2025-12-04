const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Debat = require('../models/Debat');
const User = require('../models/User');
const Candidat = require('../models/Candidat');
const path = require('path');

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env') });

const debatsData = [
    // Primaire (En attente)
    {
        titre: "Pourquoi j'aime ma culture gabonaise",
        categorie: "Primaire",
        statut: "en_attente",
        dateDebut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
        titre: "La forêt gabonaise : notre trésor à protéger",
        categorie: "Primaire",
        statut: "en_attente",
        dateDebut: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
    },
    {
        titre: "Comment la gentillesse peut changer une école",
        categorie: "Primaire",
        statut: "en_attente",
        dateDebut: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
    },

    // Collège (En cours)
    {
        titre: "Les réseaux sociaux : danger ou opportunité ?",
        categorie: "College",
        statut: "en_cours",
        dateDebut: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
        titre: "Le civisme : un devoir pour construire le Gabon",
        categorie: "College",
        statut: "en_cours",
        dateDebut: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
        titre: "Comment le sport peut prévenir la violence",
        categorie: "College",
        statut: "en_cours",
        dateDebut: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },

    // Lycée (Terminé)
    {
        titre: "La jeunesse gabonaise, moteur du changement ?",
        categorie: "Lycee",
        statut: "termine",
        dateDebut: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
        titre: "Entre tradition et modernité : notre identité",
        categorie: "Lycee",
        statut: "termine",
        dateDebut: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)
    },
    {
        titre: "L'entrepreneuriat jeune : solution au chômage ?",
        categorie: "Lycee",
        statut: "termine",
        dateDebut: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
    },

    // Universitaire (Mélange)
    {
        titre: "Rôle de la jeunesse intellectuelle",
        categorie: "Universitaire",
        statut: "en_attente",
        dateDebut: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    },
    {
        titre: "Innovation et transformation économique",
        categorie: "Universitaire",
        statut: "en_cours",
        dateDebut: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
];

const seedDebats = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connecté à MongoDB');

        // 1. Trouver ou créer un juge
        let juge = await User.findOne({ role: { $in: ['admin', 'jury', 'moderateur'] } });
        if (!juge) {
            console.log('Création d\'un juge par défaut...');
            juge = await User.create({
                name: 'Juge Default',
                email: 'juge@test.com',
                password: 'password123',
                role: 'jury'
            });
        }

        // 2. Trouver ou créer 4 candidats pour satisfaire la validation
        let candidats = await Candidat.find().limit(4);
        while (candidats.length < 4) {
            console.log(`Création candidat ${candidats.length + 1}...`);
            const c = await Candidat.create({
                nom: `Candidat${candidats.length}`,
                prenom: 'Test',
                email: `candidat${Date.now()}_${candidats.length}@test.com`,
                telephone: `0700000${candidats.length}`,
                categorie: 'Universitaire',
                dateNaissance: new Date('2000-01-01')
            });
            candidats.push(c);
        }
        const participantIds = candidats.map(c => c._id);

        // 3. Créer les débats
        for (const data of debatsData) {
            let categorieModel = data.categorie;
            let prix = 0;

            // Mapping des catégories et prix
            if (data.categorie === 'Primaire') {
                prix = 500;
            } else if (data.categorie === 'College' || data.categorie === 'Lycee') {
                categorieModel = 'College/Lycee';
                prix = 1000;
            } else { // Universitaire
                prix = 2000;
            }

            const cagnotte = prix * 4;
            const gain = cagnotte * 0.75;
            const frais = cagnotte * 0.25;

            const debatObj = {
                theme_debat: data.titre,
                categorie: categorieModel,
                statut: data.statut,
                date_debut: data.dateDebut,
                participants_ids: participantIds,
                juge_id: juge._id,
                frais_unitaire: prix,
                cagnotte_totale: cagnotte,
                gain_vainqueur: gain,
                frais_organisation: frais
            };

            const exists = await Debat.findOne({ theme_debat: data.titre });
            if (!exists) {
                await Debat.create(debatObj);
                console.log(`✅ Débat créé: ${data.titre} (${data.statut})`);
            } else {
                console.log(`ℹ️ Débat existe déjà: ${data.titre}`);
            }
        }

        console.log('🎉 Initialisation des débats terminée !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
};

seedDebats();
