const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const cleanCandidates = async () => {
    try {
        // Connexion à la base de données
        const mongoURI = 'mongodb+srv://arbre_admin:Broozy040200@cluster.qei6j24.mongodb.net/arbre-a-palabres?retryWrites=true&w=majority';

        await mongoose.connect(mongoURI);
        console.log('Connecté à MongoDB pour le nettoyage...');

        const Candidat = require('../models/Candidat');

        // 1. Trouver les candidats sans email ou avec email null
        const invalidCandidates = await Candidat.find({
            $or: [
                { email: { $exists: false } },
                { email: null },
                { email: "" }
            ]
        });

        console.log(`${invalidCandidates.length} candidats invalides trouvés.`);

        if (invalidCandidates.length > 0) {
            // 2. Supprimer ces candidats
            const result = await Candidat.deleteMany({
                $or: [
                    { email: { $exists: false } },
                    { email: null },
                    { email: "" }
                ]
            });
            console.log(`${result.deletedCount} candidats supprimés avec succès.`);
        } else {
            console.log('Aucun candidat invalide à supprimer.');
        }

        // 3. Vérifier les doublons d'email restants (au cas où)
        const duplicates = await Candidat.aggregate([
            { $group: { _id: "$email", count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]);

        if (duplicates.length > 0) {
            console.log('Attention : Des doublons d\'email existent encore :', duplicates);
            // Optionnel : Supprimer les doublons en gardant le plus récent
            for (const dup of duplicates) {
                const email = dup._id;
                if (!email) continue; // Skip null emails if any remain

                const candidates = await Candidat.find({ email }).sort({ createdAt: -1 });
                // Garder le premier (le plus récent), supprimer les autres
                const toDelete = candidates.slice(1);
                for (const c of toDelete) {
                    await Candidat.findByIdAndDelete(c._id);
                }
                console.log(`Doublons nettoyés pour ${email} (${toDelete.length} supprimés)`);
            }
        } else {
            console.log('Aucun doublon d\'email détecté.');
        }

    } catch (error) {
        console.error('Erreur lors du nettoyage :', error);
    } finally {
        await mongoose.disconnect();
        console.log('Déconnecté de MongoDB.');
    }
};

cleanCandidates();
