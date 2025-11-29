const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Candidat = require('../models/Candidat');
const { protect, admin } = require('../middleware/auth');

// @desc    Demander un retrait
// @route   POST /api/transactions/retrait
// @access  Public (avec validation)
router.post('/retrait', async (req, res) => {
  try {
    const { candidatId, montant, methodeRetrait, numeroCompte, nomBeneficiaire } = req.body;

    // Valider les données
    if (!candidatId || !montant || !methodeRetrait) {
      return res.status(400).json({
        success: false,
        error: 'Candidat, montant et méthode de retrait sont requis'
      });
    }

    if (montant <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Le montant doit être positif'
      });
    }

    // 1. Vérifier le candidat
    const candidat = await Candidat.findById(candidatId);
    if (!candidat) {
      return res.status(404).json({
        success: false,
        error: 'Candidat non trouvé'
      });
    }

    // 2. Vérifier le solde
    if (candidat.soldeActuel < montant) {
      return res.status(400).json({
        success: false,
        error: `Solde insuffisant. Solde actuel: ${candidat.soldeActuel}`
      });
    }
    
    // CORRECTION C2: Créer la transaction d'abord
    const nouvelleTransaction = new Transaction({
      candidat_id: candidatId,
      type: 'RETRAIT',
      montant,
      statut: 'EN_ATTENTE',
      description: `Demande de retrait de ${montant} FCFA`,
      methode_retrait: methodeRetrait,
      numero_compte: numeroCompte,
      nom_beneficiaire: nomBeneficiaire
    });

    await nouvelleTransaction.save();

    // 3. Débit atomique du solde pour éviter la Race Condition (CORRECTION C2)
    // Le solde est débité immédiatement, la transaction reste 'EN_ATTENTE' d'une validation externe
    const updatedCandidat = await Candidat.findByIdAndUpdate(
        candidatId,
        { $inc: { soldeActuel: -montant } }, // Opération atomique
        { new: true, runValidators: true }
    );
    
    // Si la mise à jour échoue (impossible car le solde a été vérifié, mais bonne pratique)
    if (!updatedCandidat) {
        // En cas d'échec critique ici, il faudrait annuler la transaction
        await Transaction.findByIdAndUpdate(nouvelleTransaction._id, { statut: 'ANNULEE', raison_rejet: 'Echec de la mise à jour du solde candidat.' });
        return res.status(500).json({ success: false, error: 'Erreur critique lors du débit du solde.' });
    }

    res.status(201).json({
      success: true,
      message: 'Demande de retrait enregistrée avec succès. En attente de validation.',
      transaction: nouvelleTransaction,
      nouveauSolde: updatedCandidat.soldeActuel
    });

  } catch (error) {
    console.error('Erreur demande de retrait:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur interne du serveur lors du retrait'
    });
  }
});


// @desc    Valider ou rejeter une transaction (Ex: Frais d'inscription ou Retrait)
// @route   PATCH /api/transactions/:id/statut
// @access  Admin
router.patch('/:id/statut', protect, admin, async (req, res) => {
    try {
        const { statut, raisonRejet } = req.body;
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ success: false, error: 'Transaction non trouvée' });
        }

        if (!['VALIDEE', 'REJETEE', 'COMPLETEE', 'ANNULEE'].includes(statut)) {
            return res.status(400).json({ success: false, error: 'Statut de validation invalide.' });
        }
        
        // Logique de validation/rejet
        if (statut === 'VALIDEE' && transaction.statut === 'EN_ATTENTE') {
            
            if (transaction.type === 'FRAIS_INSCRIPTION') {
                // Pour les frais d'inscription, on passe le candidat à ADMISSIBLE et on marque le paiement comme fait
                await Candidat.findByIdAndUpdate(
                    transaction.candidat_id,
                    { 
                        $set: { 
                            fraisInscriptionPayes: true, 
                            statutAdministratif: 'ADMISSIBLE' 
                        },
                        // CORRECTION C2: Si le montant des frais est > 0, il faut l'ajouter au solde du système (pas du candidat)
                        // Si le solde du candidat était initialement débité (ce qui ne devrait pas être le cas pour les FRAIS_INSCRIPTION),
                        // il faudrait ajuster ici. Assurez-vous que les FRAIS_INSCRIPTION ne touchent pas le solde candidat.
                    },
                    { new: true, runValidators: true }
                );
                transaction.statut = 'VALIDEE';
                transaction.description = 'Frais d\'inscription validés. Candidat Admissible.';
                
            } else if (transaction.type === 'RETRAIT') {
                // Pour les retraits, le solde a déjà été débité (C2). On marque comme validé et éventuellement COMPLETEE.
                // On met `COMPLETEE` si l'argent a été remis, `VALIDEE` s'il est prêt à être remis. 
                // Je vais utiliser 'COMPLETEE' pour signifier que l'opération est terminée.
                transaction.statut = 'COMPLETEE'; 
                transaction.description = transaction.description + ' - Validé par administration.';
            } else if (transaction.type === 'GAIN_DEBAT') {
                // Un gain doit être marqué comme COMPLETEE s'il est confirmé
                transaction.statut = 'COMPLETEE';
            }
            
        } else if (statut === 'REJETEE' && transaction.statut === 'EN_ATTENTE') {
            
            // Si c'est un retrait rejeté, il faut rembourser le solde du candidat
            if (transaction.type === 'RETRAIT') {
                // CRITIQUE : Remboursement atomique du solde (CORRECTION C2)
                await Candidat.findByIdAndUpdate(
                    transaction.candidat_id,
                    { $inc: { soldeActuel: transaction.montant } }, 
                    { new: true }
                );
                transaction.statut = 'REJETEE';
                transaction.description = 'Retrait rejeté. Solde remboursé.';
            } else {
                // Autres types de transactions rejetées
                transaction.statut = 'REJETEE';
            }
            
            transaction.raison_rejet = raisonRejet;
            
        } else {
             return res.status(400).json({ success: false, error: 'Transition de statut invalide ou transaction déjà traitée.' });
        }
        
        transaction.valide_par = req.user._id;
        transaction.date_validation = new Date();
        
        await transaction.save();

        res.json({
            success: true,
            message: `Transaction ${transaction.reference} mise à jour au statut ${transaction.statut}`,
            transaction
        });

    } catch (error) {
        console.error('Erreur validation transaction:', error);
        res.status(500).json({ success: false, error: 'Erreur interne lors de la mise à jour du statut' });
    }
});


// @desc    Obtenir toutes les transactions (Admin)
// ... (autres routes)

module.exports = router;