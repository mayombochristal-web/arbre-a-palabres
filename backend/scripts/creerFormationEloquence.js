/**
 * Script pour créer la formation "Éloquence Avancée" à 10 000 FCFA
 * et l'envoyer à tous les visiteurs
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Formation = require('../models/Formation');
const { envoyerOffreFormationTousVisiteurs } = require('../services/notificationService');
const logger = require('../config/logger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/arbre-palabres';

// Données de la formation
const formationData = {
    titre: 'Éloquence Avancée',
    description: `Développez vos compétences en art oratoire et devenez un orateur exceptionnel !

Cette formation complète vous permettra de maîtriser les techniques avancées de l'éloquence, de la rhétorique et de la prise de parole en public. Que vous soyez débutant ou que vous souhaitiez perfectionner vos compétences, ce programme est conçu pour vous faire progresser rapidement.

Au programme :
- Techniques de respiration et de gestion du stress
- Structuration d'un discours percutant
- Utilisation de la voix et du langage corporel
- Argumentation et réfutation
- Improvisation et répartie
- Analyse de grands discours historiques
- Exercices pratiques et mises en situation

Formation animée par des experts en communication et des anciens vainqueurs de débats.`,

    descriptionCourte: 'Maîtrisez l\'art de la parole et devenez un orateur exceptionnel avec notre formation complète en éloquence.',

    prix: 10000, // 10 000 FCFA

    duree: 20, // 20 heures de formation

    niveauRequis: 'Débutant',

    modules: [
        {
            titre: 'Introduction à l\'éloquence',
            description: 'Les fondamentaux de la prise de parole en public',
            duree: 120, // 2 heures
            ordre: 1
        },
        {
            titre: 'La voix, votre instrument',
            description: 'Techniques vocales et respiration',
            duree: 180, // 3 heures
            ordre: 2
        },
        {
            titre: 'Structurer son discours',
            description: 'De l\'introduction à la conclusion percutante',
            duree: 180,
            ordre: 3
        },
        {
            titre: 'L\'art de l\'argumentation',
            description: 'Convaincre par la logique et l\'émotion',
            duree: 240, // 4 heures
            ordre: 4
        },
        {
            titre: 'Le langage corporel',
            description: 'Gestuelle, posture et présence scénique',
            duree: 180,
            ordre: 5
        },
        {
            titre: 'Improvisation et répartie',
            description: 'Réagir avec élégance dans toutes les situations',
            duree: 180,
            ordre: 6
        },
        {
            titre: 'Gestion du stress et du trac',
            description: 'Techniques pour rester calme et confiant',
            duree: 120,
            ordre: 7
        },
        {
            titre: 'Pratique et évaluation',
            description: 'Mises en situation et feedback personnalisé',
            duree: 240,
            ordre: 8
        }
    ],

    objectifs: [
        'Maîtriser les techniques de respiration et de gestion du stress',
        'Structurer un discours clair et percutant',
        'Utiliser efficacement sa voix et son langage corporel',
        'Argumenter de manière convaincante',
        'Improviser avec aisance',
        'Analyser et déconstruire des discours',
        'Gagner en confiance à l\'oral'
    ],

    prerequis: [
        'Aucun prérequis nécessaire',
        'Motivation et envie de progresser',
        'Disponibilité pour les sessions pratiques'
    ],

    isActive: true,
    capaciteMax: null // Illimité
};

async function creerFormation() {
    try {
        // Connexion à la base de données
        await mongoose.connect(MONGODB_URI);
        logger.info('Connecté à MongoDB');

        // Vérifier si la formation existe déjà
        const existeDeja = await Formation.findOne({ titre: 'Éloquence Avancée' });

        if (existeDeja) {
            logger.info('La formation "Éloquence Avancée" existe déjà', {
                formationId: existeDeja._id
            });

            // Envoyer l'offre à tous les visiteurs
            console.log('\n📧 Envoi de l\'offre à tous les visiteurs...\n');
            const results = await envoyerOffreFormationTousVisiteurs(existeDeja);

            console.log(`\n✅ Offre envoyée avec succès !`);
            console.log(`   - Succès: ${results.success}`);
            console.log(`   - Échecs: ${results.failed}\n`);

            await mongoose.disconnect();
            return;
        }

        // Créer la formation
        const nouvelleFormation = new Formation(formationData);
        await nouvelleFormation.save();

        console.log('\n✅ Formation créée avec succès !');
        console.log(`   ID: ${nouvelleFormation._id}`);
        console.log(`   Titre: ${nouvelleFormation.titre}`);
        console.log(`   Prix: ${nouvelleFormation.prix} FCFA`);
        console.log(`   Durée: ${nouvelleFormation.duree} heures`);
        console.log(`   Modules: ${nouvelleFormation.modules.length}\n`);

        // Envoyer l'offre à tous les visiteurs
        console.log('📧 Envoi de l\'offre à tous les visiteurs...\n');
        const results = await envoyerOffreFormationTousVisiteurs(nouvelleFormation);

        console.log(`\n✅ Offre envoyée avec succès !`);
        console.log(`   - Succès: ${results.success}`);
        console.log(`   - Échecs: ${results.failed}\n`);

        await mongoose.disconnect();
        logger.info('Déconnecté de MongoDB');

    } catch (error) {
        logger.error('Erreur lors de la création de la formation', {
            error: error.message,
            stack: error.stack
        });
        console.error('\n❌ Erreur:', error.message);
        process.exit(1);
    }
}

// Exécuter le script
creerFormation();
