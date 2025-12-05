const express = require('express');
const router = express.Router();
const debatController = require('../controllers/debatsController');
const { protect, admin } = require('../middleware/auth');
const Debat = require('../models/Debat'); // Garder pour le seeder temporaire si besoin, ou migrer le seeder aussi

// @desc    Créer un nouveau débat standard
// @route   POST /api/debats/standard
// @access  Admin
router.post('/standard', protect, admin, debatController.createStandard);

// @desc    Créer un débat de défi avec mise en jeu
// @route   POST /api/debats/defi
// @access  Public
router.post('/defi', debatController.createDefi);

// @desc    Obtenir les défis disponibles
// @route   GET /api/debats/defis/disponibles
// @access  Public
router.get('/defis/disponibles', debatController.getAvailableChallenges);

// @desc    Obtenir les statistiques des débats
// @route   GET /api/debats/statistiques/general
// @access  Public
router.get('/statistiques/general', debatController.getStats);

// @desc    Obtenir tous les débats
// @route   GET /api/debats
// @access  Public
router.get('/', debatController.getAll);

// @desc    Obtenir un débat spécifique
// @route   GET /api/debats/:id
// @access  Public
router.get('/:id', debatController.getById);

// @desc    Clôturer un débat et distribuer les gains
// @route   PATCH /api/debats/:id/cloturer
// @access  Admin
router.patch('/:id/cloturer', protect, admin, debatController.closeDebate);

// @desc    Démarrer un débat
// @route   PATCH /api/debats/:id/demarrer
// @access  Admin
router.patch('/:id/demarrer', protect, admin, debatController.startDebate);

// @desc    Mettre à jour les scores d'un débat
// @route   PATCH /api/debats/:id/scores
// @access  Admin/Jury
router.patch('/:id/scores', protect, debatController.updateScores);


// @desc    Seeder les débats (Maintenance)
// @route   POST /api/debats/seed
// @access  Admin
router.post('/seed', protect, admin, async (req, res) => {
  try {
    const seedDebates = require('../seeds/seedDebates');
    // Si seedDebates est une fonction async
    await seedDebates();
    res.json({ success: true, message: 'Seeding lancé (voir logs serveur)' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;