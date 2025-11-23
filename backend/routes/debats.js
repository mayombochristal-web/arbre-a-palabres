const express = require('express');
const router = express.Router();
const Debat = require('../models/Debat');
const Candidat = require('../models/Candidat');
const Transaction = require('../models/Transaction');
const Trophee = require('../models/Trophee');
const { organiserNouveauDebatSimple, FRAIS_INSCRIPTION } = require('../utils/calculsFinanciers');
const { protect, admin } = require('../middleware/auth');

// @desc    Créer un nouveau débat standard
// @route   POST /api/debats/standard
// @access  Admin
router.post('/standard', protect, admin, async (req, res) => {
  try {
    const { participantsIds, theme } = req.body;

    // Récupérer les participants complets
    const participants = await Candidat.find({ 
      _id: { $in: participantsIds },
      statutAdministratif: 'ADMISSIBLE',
      fraisInscriptionPayes: true
    });

    if (participants.length !== 4) {
      return res.status(400).json({ 
        success: false,
        error: '4 participants admissibles avec frais payés requis' 
      });
    }

    // Vérifier que tous les participants ont la même catégorie
    const categorie = participants[0].categorie;
    if (!participants.every(p => p.categorie === categorie)) {
      return res.status(400).json({
        success: false,
        error: 'Tous les participants doivent être de la même catégorie'
      });
    }

    // Organiser le débat avec répartition simple
    const debatData = organiserNouveauDebatSimple(participants, theme);
    debatData.created_by = req.user._id;

    // Débiter les participants (frais de participation)
    const fraisUnitaire = FRAIS_INSCRIPTION[categorie];
    const transactions = [];

    for (const participant of participants) {
      // Vérifier que le participant a assez de solde
      if (participant.soldeActuel < fraisUnitaire) {
        return res.status(400).json({
          success: false,
          error: `Solde insuffisant pour ${participant.prenom} ${participant.nom}`
        });
      }

      // Débiter le participant
      participant.soldeActuel -= fraisUnitaire;

      // Créer une transaction pour les frais de participation
      const transaction = new Transaction({
        candidat_id: participant._id,
        type: 'FRAIS_INSCRIPTION', // Réutilisation du type pour frais de débat
        montant: fraisUnitaire,
        description: `Frais de participation au débat: ${theme}`,
        statut: 'VALIDEE',
        debat_id: null, // Sera mis à jour après création du débat
        created_by: req.user._id
      });

      transactions.push(transaction);
      await participant.save();
    }

    // Créer le débat en base
    const nouveauDebat = new Debat(debatData);
    await nouveauDebat.save();

    // Mettre à jour les transactions avec l'ID du débat
    for (const transaction of transactions) {
      transaction.debat_id = nouveauDebat._id;
      await transaction.save();
      
      // Ajouter la transaction au candidat
      await Candidat.findByIdAndUpdate(transaction.candidat_id, {
        $push: {
          transactions: {
            type: transaction.type,
            montant: transaction.montant,
            statut: transaction.statut,
            description: transaction.description,
            date: new Date(),
            reference: transaction.reference
          }
        }
      });
    }

    // Populer les données pour la réponse
    const debatComplet = await Debat.findById(nouveauDebat._id)
      .populate('participants_ids', 'nom prenom categorie soldeActuel scoreFinal');

    res.status(201).json({
      success: true,
      message: 'Débat créé avec succès avec répartition 25%/75%',
      debat: debatComplet,
      repartition: {
        cagnotteTotale: debatData.cagnotte_totale,
        fraisOrganisation: debatData.frais_organisation,
        gainVainqueur: debatData.gain_vainqueur,
        tauxFrais: '25%',
        tauxGain: '75%',
        fraisUnitaire: debatData.frais_unitaire
      }
    });

  } catch (error) {
    console.error('Erreur création débat:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// @desc    Clôturer un débat et distribuer les gains
// @route   PATCH /api/debats/:id/cloturer
// @access  Admin
router.patch('/:id/cloturer', protect, admin, async (req, res) => {
  try {
    const { vainqueurId } = req.body;

    const debat = await Debat.findById(req.params.id)
      .populate('participants_ids');
    
    if (!debat) {
      return res.status(404).json({ 
        success: false,
        error: 'Débat non trouvé' 
      });
    }

    if (debat.statut !== 'en_cours') {
      return res.status(400).json({ 
        success: false,
        error: 'Débat déjà terminé ou non commencé' 
      });
    }

    // Vérifier que le vainqueur fait partie des participants
    const vainqueur = debat.participants_ids.find(p => p._id.toString() === vainqueurId);
    if (!vainqueur) {
      return res.status(400).json({ 
        success: false,
        error: 'Le vainqueur doit être un participant du débat' 
      });
    }

    // Distribuer le gain au vainqueur
    vainqueur.soldeActuel += debat.gain_vainqueur;
    vainqueur.nombreVictoires += 1;
    vainqueur.totalGains = (vainqueur.totalGains || 0) + debat.gain_vainqueur;

    // Créer une transaction pour le gain
    const transactionGain = new Transaction({
      candidat_id: vainqueurId,
      type: 'GAIN_DEBAT',
      montant: debat.gain_vainqueur,
      description: `Gain du débat: ${debat.theme_debat}`,
      statut: 'VALIDEE',
      debat_id: debat._id,
      created_by: req.user._id
    });

    await transactionGain.save();

    // Ajouter la transaction au vainqueur
    vainqueur.transactions.push({
      type: 'GAIN_DEBAT',
      montant: debat.gain_vainqueur,
      statut: 'VALIDEE',
      description: `Gain du débat: ${debat.theme_debat}`,
      date: new Date(),
      reference: transactionGain.reference
    });

    // Mettre à jour les statistiques des perdants
    const perdants = debat.participants_ids.filter(p => p._id.toString() !== vainqueurId);
    for (const perdant of perdants) {
      perdant.nombreDefaites += 1;
      await perdant.save();
    }

    // Mettre à jour le débat
    debat.statut = 'termine';
    debat.vainqueur_id = vainqueurId;
    debat.date_fin = new Date();

    await Promise.all([
      debat.save(),
      vainqueur.save(),
      transactionGain.save()
    ]);

    const debatMisAJour = await Debat.findById(req.params.id)
      .populate('participants_ids', 'nom prenom soldeActuel')
      .populate('vainqueur_id', 'nom prenom');

    res.json({
      success: true,
      message: `Débat clôturé. ${debat.gain_vainqueur} FCFA attribués au vainqueur.`,
      debat: debatMisAJour,
      gainDistribue: debat.gain_vainqueur,
      transaction: {
        reference: transactionGain.reference,
        montant: transactionGain.montant
      }
    });

  } catch (error) {
    console.error('Erreur clôture débat:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la clôture du débat' 
    });
  }
});

// @desc    Démarrer un débat
// @route   PATCH /api/debats/:id/demarrer
// @access  Admin
router.patch('/:id/demarrer', protect, admin, async (req, res) => {
  try {
    const debat = await Debat.findById(req.params.id);

    if (!debat) {
      return res.status(404).json({ 
        success: false,
        error: 'Débat non trouvé' 
      });
    }

    if (debat.statut !== 'en_attente') {
      return res.status(400).json({ 
        success: false,
        error: 'Le débat ne peut pas être démarré dans son état actuel' 
      });
    }

    debat.statut = 'en_cours';
    debat.date_debut = new Date();
    
    await debat.save();

    res.json({
      success: true,
      message: 'Débat démarré avec succès',
      debat
    });

  } catch (error) {
    console.error('Erreur démarrage débat:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors du démarrage du débat' 
    });
  }
});

// @desc    Obtenir tous les débats
// @route   GET /api/debats
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      statut, 
      type, 
      categorie,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query = {};
    if (statut) query.statut = statut;
    if (type) query.type_debat = type;
    if (categorie) query.categorie = categorie;

    const debats = await Debat.find(query)
      .populate('participants_ids', 'nom prenom categorie scoreFinal')
      .populate('vainqueur_id', 'nom prenom')
      .populate('trophee_en_jeu', 'nom description')
      .sort({ date_debut: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Debat.countDocuments(query);

    res.json({
      success: true,
      debats,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Erreur récupération débats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la récupération des débats' 
    });
  }
});

// @desc    Obtenir un débat spécifique
// @route   GET /api/debats/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const debat = await Debat.findById(req.params.id)
      .populate('participants_ids')
      .populate('vainqueur_id')
      .populate('trophee_en_jeu')
      .populate('scores_participants.candidat_id', 'nom prenom');

    if (!debat) {
      return res.status(404).json({ 
        success: false,
        error: 'Débat non trouvé' 
      });
    }

    res.json({
      success: true,
      debat
    });

  } catch (error) {
    console.error('Erreur récupération débat:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la récupération du débat' 
    });
  }
});

// @desc    Mettre à jour les scores d'un débat
// @route   PATCH /api/debats/:id/scores
// @access  Admin/Jury
router.patch('/:id/scores', protect, async (req, res) => {
  try {
    const { scores } = req.body;
    const debat = await Debat.findById(req.params.id);

    if (!debat) {
      return res.status(404).json({ 
        success: false,
        error: 'Débat non trouvé' 
      });
    }

    if (debat.statut !== 'en_cours') {
      return res.status(400).json({ 
        success: false,
        error: 'Le débat doit être en cours pour mettre à jour les scores' 
      });
    }

    // Valider les scores
    for (const score of scores) {
      if (!score.candidat_id || score.score_final === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Chaque score doit avoir un candidat_id et un score_final'
        });
      }

      if (score.score_final < 0 || score.score_final > 20) {
        return res.status(400).json({
          success: false,
          error: 'Les scores doivent être entre 0 et 20'
        });
      }
    }

    debat.scores_participants = scores;
    await debat.save();

    // Mettre à jour les scores des candidats
    for (const score of scores) {
      await Candidat.findByIdAndUpdate(score.candidat_id, {
        scoreFinal: score.score_final
      });
    }

    res.json({
      success: true,
      message: 'Scores mis à jour avec succès',
      scores: debat.scores_participants
    });

  } catch (error) {
    console.error('Erreur mise à jour scores:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la mise à jour des scores' 
    });
  }
});

// @desc    Obtenir les statistiques des débats
// @route   GET /api/debats/statistiques/general
// @access  Public
router.get('/statistiques/general', async (req, res) => {
  try {
    const totalDebats = await Debat.countDocuments();
    const debatsTermines = await Debat.countDocuments({ statut: 'termine' });
    const debatsEnCours = await Debat.countDocuments({ statut: 'en_cours' });
    
    const gainsTotaux = await Debat.aggregate([
      { $match: { statut: 'termine' } },
      { $group: { _id: null, total: { $sum: '$gain_vainqueur' } } }
    ]);

    const fraisTotaux = await Debat.aggregate([
      { $match: { statut: 'termine' } },
      { $group: { _id: null, total: { $sum: '$frais_organisation' } } }
    ]);

    const debatsParCategorie = await Debat.aggregate([
      { $group: { _id: '$categorie', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      statistiques: {
        totalDebats,
        debatsTermines,
        debatsEnCours,
        gainsDistribues: gainsTotaux[0]?.total || 0,
        fraisOrganisation: fraisTotaux[0]?.total || 0,
        debatsParCategorie
      }
    });

  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la récupération des statistiques' 
    });
  }
});

module.exports = router;