const express = require('express');
const router = express.Router();
const Candidat = require('../models/Candidat');
const Transaction = require('../models/Transaction');
const { soumettreCandidature } = require('../utils/calculsFinanciers');
const { upload, handleUploadErrors } = require('../middleware/upload');
const { protect, admin } = require('../middleware/auth');
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
        if (req.files?.carteEtudiant) fs.unlinkSync(req.files.carteEtudiant[0].path);
        if (req.files?.notes) fs.unlinkSync(req.files.notes[0].path);

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

      res.status(201).json({
        success: true,
        message: 'Candidature soumise avec succès. Paiement des frais en attente.',
        candidat: nouveauCandidat,
        fraisRequis: resultatsCalculs.fraisInscription,
        instructionPaiement: resultatsCalculs.message,
        referenceTransaction: nouvelleTransaction.reference
      });

    } catch (error) {
      console.error('Erreur inscription:', error);

      if (req.files?.carteEtudiant) fs.unlinkSync(req.files.carteEtudiant[0].path);
      if (req.files?.notes) fs.unlinkSync(req.files.notes[0].path);

      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de la soumission de la candidature'
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
    console.error('Erreur récupération candidats:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des candidats'
    });
  }
});

module.exports = router;