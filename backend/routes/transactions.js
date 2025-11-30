const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Candidat = require('../models/Candidat');
const { protect, admin } = require('../middleware/auth');
const logger = require('../config/logger');

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
      logger.error('Erreur critique débit solde', { candidatId, montant });
      return res.status(500).json({ success: false, error: 'Erreur critique lors du débit du solde.' });
    }

    logger.info('Demande de retrait créée', { transactionId: nouvelleTransaction._id, candidatId, montant });

    res.status(201).json({
      success: true,
      message: 'Demande de retrait enregistrée avec succès. En attente de validation.',
      transaction: nouvelleTransaction,
      nouveauSolde: updatedCandidat.soldeActuel
    });

  } catch (error) {
    logger.error('Erreur demande de retrait:', { error: error.message, stack: error.stack });
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
            }
          },
          { new: true, runValidators: true }
        );
        transaction.statut = 'VALIDEE';
        transaction.description = 'Frais d\'inscription validés. Candidat Admissible.';

      } else if (transaction.type === 'RETRAIT') {
        transaction.statut = 'COMPLETEE';
        transaction.description = transaction.description + ' - Validé par administration.';
      } else if (transaction.type === 'GAIN_DEBAT') {
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

    logger.info(`Transaction ${statut}`, { transactionId: transaction._id, type: transaction.type, user: req.user._id });

    res.json({
      success: true,
      message: `Transaction ${transaction.reference} mise à jour au statut ${transaction.statut}`,
      transaction
    });

  } catch (error) {
    logger.error('Erreur validation transaction:', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, error: 'Erreur interne lors de la mise à jour du statut' });
  }
});


// @desc    Valider une transaction (raccourci pour /statut avec VALIDEE)
// @route   PATCH /api/transactions/:id/valider
// @access  Admin
router.patch('/:id/valider', protect, admin, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction non trouvée' });
    }

    if (transaction.statut !== 'EN_ATTENTE') {
      return res.status(400).json({
        success: false,
        error: 'Seules les transactions en attente peuvent être validées'
      });
    }

    // Logique de validation selon le type
    if (transaction.type === 'FRAIS_INSCRIPTION') {
      await Candidat.findByIdAndUpdate(
        transaction.candidat_id,
        {
          $set: {
            fraisInscriptionPayes: true,
            statutAdministratif: 'ADMISSIBLE'
          }
        },
        { new: true, runValidators: true }
      );
      transaction.statut = 'VALIDEE';
      transaction.description = 'Frais d\'inscription validés. Candidat Admissible.';

    } else if (transaction.type === 'RETRAIT') {
      transaction.statut = 'COMPLETEE';
      transaction.description = transaction.description + ' - Validé par administration.';
    } else if (transaction.type === 'GAIN_DEBAT') {
      transaction.statut = 'COMPLETEE';
    }

    transaction.valide_par = req.user._id;
    transaction.date_validation = new Date();

    await transaction.save();

    logger.info('Transaction validée (raccourci)', { transactionId: transaction._id, user: req.user._id });

    res.json({
      success: true,
      message: `Transaction ${transaction.reference} validée avec succès`,
      transaction
    });

  } catch (error) {
    logger.error('Erreur validation transaction:', { error: error.message });
    res.status(500).json({ success: false, error: 'Erreur interne lors de la validation' });
  }
});

// @desc    Rejeter une transaction (raccourci pour /statut avec REJETEE)
// @route   PATCH /api/transactions/:id/rejeter
// @access  Admin
router.patch('/:id/rejeter', protect, admin, async (req, res) => {
  try {
    const { raison } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction non trouvée' });
    }

    if (transaction.statut !== 'EN_ATTENTE') {
      return res.status(400).json({
        success: false,
        error: 'Seules les transactions en attente peuvent être rejetées'
      });
    }

    // Si c'est un retrait rejeté, rembourser le solde du candidat
    if (transaction.type === 'RETRAIT') {
      await Candidat.findByIdAndUpdate(
        transaction.candidat_id,
        { $inc: { soldeActuel: transaction.montant } },
        { new: true }
      );
      transaction.statut = 'REJETEE';
      transaction.description = 'Retrait rejeté. Solde remboursé.';
    } else {
      transaction.statut = 'REJETEE';
    }

    transaction.raison_rejet = raison || 'Rejeté par l\'administration';
    transaction.valide_par = req.user._id;
    transaction.date_validation = new Date();

    await transaction.save();

    logger.info('Transaction rejetée (raccourci)', { transactionId: transaction._id, user: req.user._id });

    res.json({
      success: true,
      message: `Transaction ${transaction.reference} rejetée`,
      transaction
    });

  } catch (error) {
    logger.error('Erreur rejet transaction:', { error: error.message });
    res.status(500).json({ success: false, error: 'Erreur interne lors du rejet' });
  }
});

// @desc    Obtenir les transactions d'un candidat
// @route   GET /api/transactions/candidat/:candidatId
// @access  Public (ou Admin)
router.get('/candidat/:candidatId', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, statut } = req.query;

    const query = { candidat_id: req.params.candidatId };

    if (type) {
      query.type = type;
    }

    if (statut) {
      query.statut = statut;
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('candidat_id', 'nom prenom email')
      .populate('debat_id', 'theme_debat categorie')
      .populate('valide_par', 'nom prenom')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      transactions
    });

  } catch (error) {
    logger.error('Erreur récupération transactions candidat:', { error: error.message, candidatId: req.params.candidatId });
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des transactions'
    });
  }
});

// @desc    Obtenir toutes les transactions (Admin)
// @route   GET /api/transactions
// @access  Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 50, type, statut, search } = req.query;

    const query = {};

    if (type) {
      query.type = type;
    }

    if (statut) {
      query.statut = statut;
    }

    if (search) {
      query.reference = { $regex: search, $options: 'i' };
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('candidat_id', 'nom prenom email telephone')
      .populate('debat_id', 'theme_debat categorie')
      .populate('valide_par', 'nom prenom')
      .populate('created_by', 'nom prenom')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Statistiques rapides
    const stats = {
      total,
      enAttente: await Transaction.countDocuments({ statut: 'EN_ATTENTE' }),
      validees: await Transaction.countDocuments({ statut: 'VALIDEE' }),
      rejetees: await Transaction.countDocuments({ statut: 'REJETEE' }),
      completees: await Transaction.countDocuments({ statut: 'COMPLETEE' })
    };

    res.json({
      success: true,
      stats,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      transactions
    });

  } catch (error) {
    logger.error('Erreur récupération transactions:', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des transactions'
    });
  }
});

module.exports = router;