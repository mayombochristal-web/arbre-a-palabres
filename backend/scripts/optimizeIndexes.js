const mongoose = require('mongoose');
const Candidat = require('../models/Candidat');
const Debat = require('../models/Debat');
const Transaction = require('../models/Transaction');
const logger = require('../config/logger');

/**
 * Script pour optimiser les index MongoDB
 * Améliore les performances des requêtes fréquentes
 */

async function optimizeIndexes() {
    try {
        console.log('🔧 Optimisation des index MongoDB...\n');

        // ============================================
        // CANDIDATS - Index Optimisés
        // ============================================
        console.log('📊 Candidats:');

        // Index composites pour les requêtes fréquentes
        await Candidat.collection.createIndex(
            { categorie: 1, statutAdministratif: 1, scoreFinal: -1 },
            { name: 'categorie_statut_score' }
        );
        console.log('  ✅ Index composite: categorie + statut + score');

        await Candidat.collection.createIndex(
            { statutAdministratif: 1, fraisInscriptionPayes: 1 },
            { name: 'statut_frais' }
        );
        console.log('  ✅ Index composite: statut + frais payés');

        // Index pour la recherche
        await Candidat.collection.createIndex(
            { nom: 'text', prenom: 'text', email: 'text' },
            { name: 'search_text' }
        );
        console.log('  ✅ Index texte: recherche nom/prénom/email');

        // Index pour le classement
        await Candidat.collection.createIndex(
            { categorie: 1, scoreFinal: -1, nombreVictoires: -1 },
            { name: 'classement' }
        );
        console.log('  ✅ Index classement: categorie + scores');

        // ============================================
        // DÉBATS - Index Optimisés
        // ============================================
        console.log('\n📊 Débats:');

        // Index composite pour filtrage et tri
        await Debat.collection.createIndex(
            { statut: 1, categorie: 1, date_debut: -1 },
            { name: 'statut_categorie_date' }
        );
        console.log('  ✅ Index composite: statut + catégorie + date');

        // Index pour les participants
        await Debat.collection.createIndex(
            { participants_ids: 1, statut: 1 },
            { name: 'participants_statut' }
        );
        console.log('  ✅ Index composite: participants + statut');

        // Index pour les débats actifs
        await Debat.collection.createIndex(
            { statut: 1, date_debut: -1 },
            { name: 'debats_actifs' }
        );
        console.log('  ✅ Index débats actifs');

        // ============================================
        // TRANSACTIONS - Index Optimisés
        // ============================================
        console.log('\n📊 Transactions:');

        // Index composite pour historique candidat
        await Transaction.collection.createIndex(
            { candidat_id: 1, createdAt: -1 },
            { name: 'candidat_historique' }
        );
        console.log('  ✅ Index composite: candidat + date');

        // Index pour les transactions en attente
        await Transaction.collection.createIndex(
            { statut: 1, type: 1, createdAt: -1 },
            { name: 'statut_type_date' }
        );
        console.log('  ✅ Index composite: statut + type + date');

        // Index pour les débats
        await Transaction.collection.createIndex(
            { debat_id: 1 },
            { name: 'debat_transactions' }
        );
        console.log('  ✅ Index débat');

        // ============================================
        // STATISTIQUES DES INDEX
        // ============================================
        console.log('\n📈 Statistiques des index:');

        const candidatIndexes = await Candidat.collection.indexes();
        console.log(`  Candidats: ${candidatIndexes.length} index`);

        const debatIndexes = await Debat.collection.indexes();
        console.log(`  Débats: ${debatIndexes.length} index`);

        const transactionIndexes = await Transaction.collection.indexes();
        console.log(`  Transactions: ${transactionIndexes.length} index`);

        console.log('\n✅ Optimisation des index terminée avec succès!');

        return {
            success: true,
            candidatIndexes: candidatIndexes.length,
            debatIndexes: debatIndexes.length,
            transactionIndexes: transactionIndexes.length
        };

    } catch (error) {
        console.error('❌ Erreur lors de l\'optimisation des index:', error);
        throw error;
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    const connectDB = require('../config/database');

    connectDB()
        .then(() => optimizeIndexes())
        .then(() => {
            console.log('\n🎉 Script terminé!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Erreur fatale:', error);
            process.exit(1);
        });
}

module.exports = { optimizeIndexes };
