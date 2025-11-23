const express = require('express');
const router = express.Router();
const Candidat = require('../models/Candidat');
const Transaction = require('../models/Transaction');
const { soumettreCandidature } = require('../utils/calculsFinanciers');
const { upload, handleUploadErrors } = require('../middleware/upload');
const { protect, admin } = require('../middleware/auth');

// @desc    Soumettre une candidature
// @route   POST /api/candidats/inscription
// @access  Public
router.post('/inscription', 
  upload.fields([
    { name: 'carteEtudiant', maxCount: 1 },
    { name: 'notes', maxCount: 1 }
  ]),
  handleUploadErrors,
  async (req, res) => {
    try {
      const { 
        nom, 
        prenom, 
        dateNaissance, 
        email, 
        telephone, 
        nationalite, 
        nomEtablissement 
      } = req.body;

      // Vérifier si l'email ou téléphone existe déjà
      const existeDeja = await Candidat.findOne({ 
        $or: [{ email }, { telephone }] 
      });
      
      if (existeDeja) {
        return res.status(400).json({ 
          error: 'Un candidat avec cet email ou téléphone existe déjà' 
        });
      }

      // Vérifier les fichiers uploadés
      if (!req.files || !req.files.carteEtudiant || !req.files.notes) {
        return res.status(400).json({
          error: 'Les documents carte étudiante et notes sont requis'
        });
      }

      // Soumettre la candidature (vérification éligibilité)
      const resultatSoumission = soumettreCandidature({
        dateNaissance,
        nationalite,
        nomEtablissement,
        fichiers: {
          carteEtudiant: req.files.carteEtudiant[0].filename,
          notes: req.files.notes[0].filename
        }
      });

      // Créer le candidat
      const nouveauCandidat = new Candidat({
        nom,
        prenom,
        dateNaissance: new Date(dateNaissance),
        email,
        telephone,
        nationalite,
        nomEtablissement,
        categorie: resultatSoumission.categorie,
        fichierCarteEtudiant: req.files.carteEtudiant[0].filename,
        fichierNotes: req.files.notes[0].filename,
        statutAdministratif: resultatSoumission.statutAdministratif,
        age: resultatSoumission.age
      });

      await nouveauCandidat.save();

      res.status(201).json({
        success: true,
        message: resultatSoumission.message,
        candidat: {
          id: nouveauCandidat._id,
          nom: nouveauCandidat.nom,
          prenom: nouveauCandidat.prenom,
          categorie: nouveauCandidat.categorie,
          fraisInscription: resultatSoumission.fraisInscription,
          statut: nouveauCandidat.statutAdministratif,
          age: nouveauCandidat.age
        }
      });

    } catch (error) {
      console.error('Erreur soumission candidature:', error);
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

// @desc    Valider le paiement des frais
// @route   PATCH /api/candidats/:id/valider-paiement
// @access  Admin
router.patch('/:id/valider-paiement', protect, admin, async (req, res) => {
  try {
    const candidat = await Candidat.findById(req.params.id);
    
    if (!candidat) {
      return res.status(404).json({ 
        success: false,
        error: 'Candidat non trouvé' 
      });
    }

    if (candidat.fraisInscriptionPayes) {
      return res.status(400).json({ 
        success: false,
        error: 'Frais déjà payés' 
      });
    }

    // Créer une transaction pour les frais d'inscription
    const fraisInscription = require('../utils/calculsFinanciers').FRAIS_INSCRIPTION[candidat.categorie];
    
    const transaction = new Transaction({
      candidat_id: candidat._id,
      type: 'FRAIS_INSCRIPTION',
      montant: fraisInscription,
      description: `Frais d'inscription - ${candidat.categorie}`,
      statut: 'VALIDEE',
      created_by: req.user._id
    });

    await transaction.save();

    // Mettre à jour le statut du candidat
    candidat.fraisInscriptionPayes = true;
    candidat.statutAdministratif = 'ADMISSIBLE';
    candidat.transactions.push({
      type: 'FRAIS_INSCRIPTION',
      montant: fraisInscription,
      statut: 'VALIDEE',
      description: `Frais d'inscription validés`,
      date: new Date(),
      reference: transaction.reference
    });
    
    await candidat.save();

    res.json({
      success: true,
      message: 'Paiement validé avec succès',
      candidat: {
        id: candidat._id,
        nom: candidat.nom,
        prenom: candidat.prenom,
        statut: candidat.statutAdministratif,
        categorie: candidat.categorie
      },
      transaction: {
        reference: transaction.reference,
        montant: transaction.montant
      }
    });

  } catch (error) {
    console.error('Erreur validation paiement:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la validation du paiement' 
    });
  }
});

// @desc    Mettre à jour les scores d'un candidat
// @route   PATCH /api/candidats/:id/scores
// @access  Admin/Jury
router.patch('/:id/scores', protect, async (req, res) => {
  try {
    const { scoreEcrit, scoreOral } = req.body;
    const candidat = await Candidat.findById(req.params.id);

    if (!candidat) {
      return res.status(404).json({ 
        success: false,
        error: 'Candidat non trouvé' 
      });
    }

    // Mettre à jour les scores
    if (scoreEcrit !== undefined) {
      if (scoreEcrit < 0 || scoreEcrit > 20) {
        return res.status(400).json({
          success: false,
          error: 'Le score écrit doit être entre 0 et 20'
        });
      }
      candidat.scoreEcrit = scoreEcrit;
    }
    
    if (scoreOral !== undefined) {
      if (scoreOral < 0 || scoreOral > 20) {
        return res.status(400).json({
          success: false,
          error: 'Le score oral doit être entre 0 et 20'
        });
      }
      candidat.scoreOral = scoreOral;
    }

    // Calculer le score final (moyenne)
    if (scoreEcrit !== undefined && scoreOral !== undefined) {
      candidat.scoreFinal = (scoreEcrit + scoreOral) / 2;
    }

    await candidat.save();

    res.json({
      success: true,
      message: 'Scores mis à jour avec succès',
      scores: {
        ecrit: candidat.scoreEcrit,
        oral: candidat.scoreOral,
        final: candidat.scoreFinal
      }
    });

  } catch (error) {
    console.error('Erreur mise à jour scores:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la mise à jour des scores' 
    });
  }
});

// @desc    Obtenir le classement par catégorie
// @route   GET /api/candidats/classement/:categorie
// @access  Public
router.get('/classement/:categorie', async (req, res) => {
  try {
    const { categorie } = req.params;
    const { limit = 50 } = req.query;

    if (!['Primaire', 'College/Lycee', 'Universitaire'].includes(categorie)) {
      return res.status(400).json({
        success: false,
        error: 'Catégorie invalide'
      });
    }

    const candidats = await Candidat.find({ 
      categorie,
      statutAdministratif: 'ADMISSIBLE',
      scoreFinal: { $gt: 0 }
    })
    .sort({ scoreFinal: -1, dateInscription: 1 })
    .limit(parseInt(limit))
    .select('nom prenom scoreEcrit scoreOral scoreFinal nomEtablissement nombreVictoires');

    res.json({
      success: true,
      categorie,
      classement: candidats.map((candidat, index) => ({
        rang: index + 1,
        nom: `${candidat.prenom} ${candidat.nom}`,
        etablissement: candidat.nomEtablissement,
        scoreEcrit: candidat.scoreEcrit,
        scoreOral: candidat.scoreOral,
        scoreFinal: candidat.scoreFinal.toFixed(2),
        victoires: candidat.nombreVictoires
      }))
    });

  } catch (error) {
    console.error('Erreur récupération classement:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la récupération du classement' 
    });
  }
});

// @desc    Obtenir tous les candidats
// @route   GET /api/candidats
// @access  Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      categorie, 
      statut,
      search 
    } = req.query;

    const query = {};
    
    if (categorie) query.categorie = categorie;
    if (statut) query.statutAdministratif = statut;
    
    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { nomEtablissement: { $regex: search, $options: 'i' } }
      ];
    }

    const candidats = await Candidat.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-fichierCarteEtudiant -fichierNotes');

    const total = await Candidat.countDocuments(query);

    res.json({
      success: true,
      candidats,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Erreur récupération candidats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la récupération des candidats' 
    });
  }
});

// @desc    Obtenir un candidat spécifique
// @route   GET /api/candidats/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const candidat = await Candidat.findById(req.params.id)
      .select('-fichierCarteEtudiant -fichierNotes')
      .populate('tropheeActuel', 'nom description valeur');

    if (!candidat) {
      return res.status(404).json({ 
        success: false,
        error: 'Candidat non trouvé' 
      });
    }

    res.json({
      success: true,
      candidat
    });

  } catch (error) {
    console.error('Erreur récupération candidat:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la récupération du candidat' 
    });
  }
});

// @desc    Obtenir les statistiques d'un candidat
// @route   GET /api/candidats/:id/statistiques
// @access  Public
router.get('/:id/statistiques', async (req, res) => {
  try {
    const candidat = await Candidat.findById(req.params.id);
    
    if (!candidat) {
      return res.status(404).json({ 
        success: false,
        error: 'Candidat non trouvé' 
      });
    }

    const statistiques = {
      nom_complet: `${candidat.prenom} ${candidat.nom}`,
      categorie: candidat.categorie,
      etablissement: candidat.nomEtablissement,
      solde_actuel: candidat.soldeActuel,
      nombre_victoires: candidat.nombreVictoires,
      nombre_defaites: candidat.nombreDefaites,
      total_debats: candidat.nombreVictoires + candidat.nombreDefaites,
      taux_victoire: candidat.nombreVictoires + candidat.nombreDefaites > 0 
        ? ((candidat.nombreVictoires / (candidat.nombreVictoires + candidat.nombreDefaites)) * 100).toFixed(2)
        : 0,
      score_final: candidat.scoreFinal,
      date_inscription: candidat.dateInscription,
      a_un_trophee: !!candidat.tropheeActuel,
      statut: candidat.statutAdministratif,
      total_gains: candidat.totalGains || 0
    };

    res.json({
      success: true,
      statistiques
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