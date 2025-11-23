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

    // Vérifier le candidat
    const candidat = await Candidat.findById(candidatId);
    if (!candidat) {
      return res.status(404).json({
        success: false,
        error: 'Candidat non trouvé'
      });
    }

    // Vérifier le solde
    if (candidat.soldeActuel < montant) {
      return res.status(400).json({
        success: false,
        error: 'Solde insuffisant'
      });
    }

    // Vérifier le montant minimum de retrait
    const montantMinimum = 1000; // 1000 FCFA minimum
    if (montant < montantMinimum) {
      return res.status(400).json({
        success: false,
        error: `Le montant minimum de retrait est ${montantMinimum} FCFA`
      });
    }

    // Débiter immédiatement le solde (pour éviter les doubles retraits)
    candidat.soldeActuel -= montant;
    
    // Créer la transaction de retrait
    const transaction = new Transaction({
      candidat_id: candidatId,
      type: 'RETRAIT',
      montant: montant,
      description: `Demande de retrait - ${methodeRetrait}`,
      statut: 'EN_ATTENTE',
      methode_retrait: methodeRetrait,
      numero_compte: numeroCompte,
      nom_beneficiaire: nomBeneficiaire || `${candidat.prenom} ${candidat.nom}`,
      created_by: candidatId // Le candidat fait la demande lui-même
    });

    // Ajouter la transaction au candidat
    candidat.transactions.push({
      type: 'RETRAIT',
      montant: montant,
      statut: 'EN_ATTENTE',
      description: `Demande de retrait - ${methodeRetrait}`,
      date: new Date()
    });

    await Promise.all([
      transaction.save(),
      candidat.save()
    ]);

    res.status(201).json({
      success: true,
      message: `Demande de retrait de ${montant} FCFA enregistrée. En attente de validation.`,
      transaction: {
        id: transaction._id,
        reference: transaction.reference,
        montant: transaction.montant,
        statut: transaction.statut,
        date: transaction.createdAt
      },
      nouveauSolde: candidat.soldeActuel
    });

  } catch (error) {
    console.error('Erreur demande retrait:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la demande de retrait' 
    });
  }
});

// @desc    Valider un retrait
// @route   PATCH /api/transactions/:id/valider
// @access  Admin
router.patch('/:id/valider', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction non trouvée'
      });
    }

    if (transaction.type !== 'RETRAIT') {
      return res.status(400).json({
        success: false,
        error: 'Seules les transactions de retrait peuvent être validées'
      });
    }

    if (transaction.statut !== 'EN_ATTENTE') {
      return res.status(400).json({
        success: false,
        error: 'La transaction a déjà été traitée'
      });
    }

    // Valider la transaction
    transaction.statut = 'VALIDEE';
    transaction.valide_par = req.user._id;
    transaction.date_validation = new Date();

    await transaction.save();

    // Mettre à jour la transaction dans le profil du candidat
    await Candidat.findByIdAndUpdate(transaction.candidat_id, {
      $set: {
        'transactions.$[elem].statut': 'VALIDEE'
      }
    }, {
      arrayFilters: [
        { 'elem.date': { $gte: transaction.createdAt } }
      ]
    });

    res.json({
      success: true,
      message: 'Retrait validé avec succès',
      transaction: {
        id: transaction._id,
        reference: transaction.reference,
        montant: transaction.montant,
        statut: transaction.statut,
        dateValidation: transaction.date_validation
      }
    });

  } catch (error) {
    console.error('Erreur validation retrait:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la validation du retrait' 
    });
  }
});

// @desc    Rejeter un retrait
// @route   PATCH /api/transactions/:id/rejeter
// @access  Admin
router.patch('/:id/rejeter', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { raison } = req.body;

    if (!raison) {
      return res.status(400).json({
        success: false,
        error: 'La raison du rejet est requise'
      });
    }

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction non trouvée'
      });
    }

    if (transaction.type !== 'RETRAIT') {
      return res.status(400).json({
        success: false,
        error: 'Seules les transactions de retrait peuvent être rejetées'
      });
    }

    if (transaction.statut !== 'EN_ATTENTE') {
      return res.status(400).json({
        success: false,
        error: 'La transaction a déjà été traitée'
      });
    }

    // Rembourser le candidat
    const candidat = await Candidat.findById(transaction.candidat_id);
    candidat.soldeActuel += transaction.montant;

    // Rejeter la transaction
    transaction.statut = 'REJETEE';
    transaction.valide_par = req.user._id;
    transaction.date_validation = new Date();
    transaction.raison_rejet = raison;

    // Mettre à jour la transaction dans le profil du candidat
    candidat.transactions.push({
      type: 'REMBOURSEMENT',
      montant: transaction.montant,
      statut: 'VALIDEE',
      description: `Remboursement - ${raison}`,
      date: new Date()
    });

    await Promise.all([
      transaction.save(),
      candidat.save()
    ]);

    res.json({
      success: true,
      message: 'Retrait rejeté et montant remboursé',
      transaction: {
        id: transaction._id,
        reference: transaction.reference,
        montant: transaction.montant,
        statut: transaction.statut,
        raison: transaction.raison_rejet
      },
      nouveauSolde: candidat.soldeActuel
    });

  } catch (error) {
    console.error('Erreur rejet retrait:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors du rejet du retrait' 
    });
  }
});

// @desc    Obtenir l'historique des transactions d'un candidat
// @route   GET /api/transactions/candidat/:candidatId
// @access  Public
router.get('/candidat/:candidatId', async (req, res) => {
  try {
    const { candidatId } = req.params;
    const { page = 1, limit = 10, type } = req.query;

    const query = { candidat_id: candidatId };
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('debat_id', 'theme_debat date_debut');

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Erreur récupération transactions:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la récupération des transactions' 
    });
  }
});

// @desc    Obtenir toutes les transactions (admin)
// @route   GET /api/transactions
// @access  Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      statut,
      dateDebut,
      dateFin 
    } = req.query;

    const query = {};
    
    if (type) query.type = type;
    if (statut) query.statut = statut;
    
    if (dateDebut || dateFin) {
      query.createdAt = {};
      if (dateDebut) query.createdAt.$gte = new Date(dateDebut);
      if (dateFin) query.createdAt.$lte = new Date(dateFin);
    }

    const transactions = await Transaction.find(query)
      .populate('candidat_id', 'nom prenom email telephone')
      .populate('debat_id', 'theme_debat')
      .populate('valide_par', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    // Statistiques des transactions
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: '$statut',
          count: { $sum: 1 },
          totalMontant: { $sum: '$montant' }
        }
      }
    ]);

    res.json({
      success: true,
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      statistiques: stats
    });

  } catch (error) {
    console.error('Erreur récupération transactions:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la récupération des transactions' 
    });
  }
});

module.exports = router;