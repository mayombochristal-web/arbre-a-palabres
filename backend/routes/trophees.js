const express = require('express');
const router = express.Router();
const Trophee = require('../models/Trophee');
const Candidat = require('../models/Candidat');
const { protect, admin } = require('../middleware/auth');

// @desc    Créer un nouveau trophée
// @route   POST /api/trophees
// @access  Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { nom, description, valeur, categorie_requise, image } = req.body;

    // Vérifier si un trophée avec le même nom existe déjà
    const tropheeExistant = await Trophee.findOne({ nom });
    if (tropheeExistant) {
      return res.status(400).json({
        success: false,
        error: 'Un trophée avec ce nom existe déjà'
      });
    }

    const nouveauTrophee = new Trophee({
      nom,
      description,
      valeur,
      categorie_requise,
      image,
      created_by: req.user._id
    });

    await nouveauTrophee.save();

    res.status(201).json({
      success: true,
      message: 'Trophée créé avec succès',
      trophee: nouveauTrophee
    });

  } catch (error) {
    console.error('Erreur création trophée:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la création du trophée' 
    });
  }
});

// @desc    Obtenir tous les trophées
// @route   GET /api/trophees
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { categorie, statut } = req.query;

    const query = {};
    if (categorie) query.categorie_requise = categorie;
    if (statut) query.statut = statut;

    const trophees = await Trophee.find(query)
      .populate('proprietaire_actuel', 'nom prenom categorie nomEtablissement')
      .populate('historique_proprietaires.candidat_id', 'nom prenom')
      .sort({ valeur: -1 });

    res.json({
      success: true,
      trophees
    });

  } catch (error) {
    console.error('Erreur récupération trophées:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la récupération des trophées' 
    });
  }
});

// @desc    Attribuer un trophée à un candidat
// @route   PATCH /api/trophees/:id/attribuer
// @access  Admin
router.patch('/:id/attribuer', protect, admin, async (req, res) => {
  try {
    const { candidatId } = req.body;
    const trophee = await Trophee.findById(req.params.id);

    if (!trophee) {
      return res.status(404).json({
        success: false,
        error: 'Trophée non trouvé'
      });
    }

    const candidat = await Candidat.findById(candidatId);
    if (!candidat) {
      return res.status(404).json({
        success: false,
        error: 'Candidat non trouvé'
      });
    }

    // Vérifier la catégorie
    if (candidat.categorie !== trophee.categorie_requise) {
      return res.status(400).json({
        success: false,
        error: `Le candidat doit être de catégorie ${trophee.categorie_requise}`
      });
    }

    // Vérifier si le trophée est disponible
    if (trophee.statut !== 'DISPONIBLE') {
      return res.status(400).json({
        success: false,
        error: 'Le trophée n\'est pas disponible'
      });
    }

    // Retirer l'ancien trophée du candidat s'il en a un
    if (candidat.tropheeActuel) {
      const ancienTrophee = await Trophee.findById(candidat.tropheeActuel);
      if (ancienTrophee) {
        ancienTrophee.retirer('REMPLACE');
        await ancienTrophee.save();
      }
    }

    // Attribuer le nouveau trophée
    trophee.attribuer(candidatId);
    await trophee.save();

    // Mettre à jour le candidat
    candidat.tropheeActuel = trophee._id;
    await candidat.save();

    res.json({
      success: true,
      message: `Trophée "${trophee.nom}" attribué à ${candidat.prenom} ${candidat.nom}`,
      trophee: {
        id: trophee._id,
        nom: trophee.nom,
        proprietaire: {
          id: candidat._id,
          nom: `${candidat.prenom} ${candidat.nom}`,
          categorie: candidat.categorie
        }
      }
    });

  } catch (error) {
    console.error('Erreur attribution trophée:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// @desc    Retirer un trophée
// @route   PATCH /api/trophees/:id/retirer
// @access  Admin
router.patch('/:id/retirer', protect, admin, async (req, res) => {
  try {
    const { raison } = req.body;
    const trophee = await Trophee.findById(req.params.id);

    if (!trophee) {
      return res.status(404).json({
        success: false,
        error: 'Trophée non trouvé'
      });
    }

    if (trophee.statut !== 'ATTRIBUE') {
      return res.status(400).json({
        success: false,
        error: 'Le trophée n\'est pas actuellement attribué'
      });
    }

    // Retirer le trophée du candidat
    const candidat = await Candidat.findById(trophee.proprietaire_actuel);
    if (candidat) {
      candidat.tropheeActuel = null;
      await candidat.save();
    }

    // Retirer le trophée
    trophee.retirer(raison || 'ADMINISTRATIF');
    await trophee.save();

    res.json({
      success: true,
      message: 'Trophée retiré avec succès',
      trophee: {
        id: trophee._id,
        nom: trophee.nom,
        statut: trophee.statut,
        ancienProprietaire: candidat ? {
          id: candidat._id,
          nom: `${candidat.prenom} ${candidat.nom}`
        } : null
      }
    });

  } catch (error) {
    console.error('Erreur retrait trophée:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// @desc    Obtenir l'historique d'un trophée
// @route   GET /api/trophees/:id/historique
// @access  Public
router.get('/:id/historique', async (req, res) => {
  try {
    const trophee = await Trophee.findById(req.params.id)
      .populate('historique_proprietaires.candidat_id', 'nom prenom categorie nomEtablissement');

    if (!trophee) {
      return res.status(404).json({
        success: false,
        error: 'Trophée non trouvé'
      });
    }

    // Trier l'historique par date d'acquisition (du plus récent au plus ancien)
    const historiqueTrie = trophee.historique_proprietaires
      .sort((a, b) => new Date(b.date_acquisition) - new Date(a.date_acquisition));

    res.json({
      success: true,
      trophee: {
        id: trophee._id,
        nom: trophee.nom,
        description: trophee.description,
        valeur: trophee.valeur
      },
      historique: historiqueTrie.map(proprietaire => ({
        candidat: proprietaire.candidat_id,
        date_acquisition: proprietaire.date_acquisition,
        date_perte: proprietaire.date_perte,
        duree_possession: proprietaire.duree_possession,
        raison_perte: proprietaire.raison_perte
      }))
    });

  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la récupération de l\'historique' 
    });
  }
});

module.exports = router;