const express = require('express');
const router = express.Router();
const Candidat = require('../models/Candidat');
const Transaction = require('../models/Transaction');
const { soumettreCandidature } = require('../utils/calculsFinanciers');
const { upload, handleUploadErrors } = require('../middleware/upload');
const { protect, admin } = require('../middleware/auth');
const { cleanupUploadedFiles } = require('../utils/fileHelper');
const logger = require('../config/logger');
const fs = require('fs');

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
        // Supprimer les fichiers uploadés avant de retourner l'erreur
        cleanupUploadedFiles(req.files);

        return res.status(400).json({
          error: 'Un candidat avec cet email ou téléphone existe déjà'
        });
      }

      // Vérifier les fichiers uploadés (carte étudiant obligatoire, notes optionnelles)
      if (!req.files || !req.files.carteEtudiant) {
        return res.status(400).json({
          error: 'Le document (carte étudiante) est obligatoire'
        });
      }

      // 1. Déterminer la catégorie et les frais
      const resultatsCalculs = soumettreCandidature({
        dateNaissance,
        nationalite,
        nomEtablissement,
        fichiers: {
          carteEtudiant: req.files.carteEtudiant[0].path,
          notes: req.files.notes ? req.files.notes[0].path : null,
        }
      });

      // 2. Créer le candidat
      const nouveauCandidat = new Candidat({
        nom,
        prenom,
        dateNaissance,
        email,
        telephone,
        nationalite,
        nomEtablissement,
        urlCarteEtudiant: req.files.carteEtudiant[0].path,
        urlNotes: req.files.notes ? req.files.notes[0].path : null,
        categorie: resultatsCalculs.categorie,
        statutAdministratif: resultatsCalculs.statutAdministratif,
      });

      await nouveauCandidat.save();

      // 3. CRÉER LA TRANSACTION EN ATTENTE 
      const nouvelleTransaction = new Transaction({
        candidat_id: nouveauCandidat._id,
        type: 'FRAIS_INSCRIPTION',
        montant: resultatsCalculs.fraisInscription,
        statut: 'EN_ATTENTE',
        description: `Frais d'inscription pour la catégorie ${resultatsCalculs.categorie}`,
      });

      await nouvelleTransaction.save();

      logger.info('Nouvelle candidature soumise', { candidatId: nouveauCandidat._id, categorie: resultatsCalculs.categorie });

      res.status(201).json({
        success: true,
        message: 'Candidature soumise avec succès. Paiement des frais en attente.',
        candidat: nouveauCandidat,
        fraisRequis: resultatsCalculs.fraisInscription,
        instructionPaiement: resultatsCalculs.message,
        referenceTransaction: nouvelleTransaction.reference
      });

    } catch (error) {
      logger.error('Erreur inscription:', { error: error.message, stack: error.stack });

      cleanupUploadedFiles(req.files);

      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de la soumission de la candidature'
      });
    }
  });

// @desc    Obtenir le classement par catégorie
// @route   GET /api/candidats/classement/:categorie
// @access  Public
router.get('/classement/:categorie', async (req, res) => {
  try {
    const { categorie } = req.params;
    const { limit = 50, page = 1 } = req.query;

    // Valider la catégorie
    const categoriesValides = ['Primaire', 'College/Lycee', 'Universitaire'];
    if (!categoriesValides.includes(categorie)) {
      return res.status(400).json({
        success: false,
        error: 'Catégorie invalide. Valeurs acceptées: Primaire, College/Lycee, Universitaire'
      });
    }

    const query = {
      categorie,
      statutAdministratif: 'ADMISSIBLE'
    };

    const total = await Candidat.countDocuments(query);
    const candidats = await Candidat.find(query)
      .select('nom prenom scoreFinal nombreVictoires nombreDefaites soldeActuel tropheeActuel')
      .populate('tropheeActuel', 'nom imageUrl')
      .sort({ scoreFinal: -1, nombreVictoires: -1, soldeActuel: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Ajouter le rang à chaque candidat
    const classement = candidats.map((candidat, index) => ({
      rang: (parseInt(page) - 1) * parseInt(limit) + index + 1,
      ...candidat.toObject(),
      nombreDebatsTotal: candidat.nombreVictoires + candidat.nombreDefaites,
      tauxVictoire: candidat.nombreVictoires + candidat.nombreDefaites > 0
        ? ((candidat.nombreVictoires / (candidat.nombreVictoires + candidat.nombreDefaites)) * 100).toFixed(2)
        : 0
    }));

    res.status(200).json({
      success: true,
      categorie,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      classement
    });

  } catch (error) {
    logger.error('Erreur récupération classement:', { error: error.message, categorie: req.params.categorie });
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération du classement'
    });
  }
});

// @desc    Obtenir tous les candidats (filtrage/pagination)
// @route   GET /api/candidats
// @access  Public (ou Admin selon besoins)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, categorie, statut } = req.query;

    // Construction de la requête
    const query = {};

    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (categorie) {
      query.categorie = categorie;
    }

    if (statut) {
      query.statutAdministratif = statut;
    }

    // Pagination
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const total = await Candidat.countDocuments(query);
    const candidats = await Candidat.find(query)
      .sort({ createdAt: -1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    res.status(200).json({
      success: true,
      count: candidats.length,
      total,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      candidats
    });

  } catch (error) {
    logger.error('Erreur récupération candidats:', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des candidats'
    });
  }
});

// @desc    Obtenir un candidat par ID
// @route   GET /api/candidats/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const candidat = await Candidat.findById(req.params.id)
      .populate('tropheeActuel', 'nom description imageUrl');

    if (!candidat) {
      return res.status(404).json({
        success: false,
        error: 'Candidat non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      candidat
    });

  } catch (error) {
    logger.error('Erreur récupération candidat:', { error: error.message, id: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération du candidat'
    });
  }
});

module.exports = router;