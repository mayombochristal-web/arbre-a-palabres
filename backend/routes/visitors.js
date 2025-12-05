const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/VisitorController');
const { protect, admin } = require('../middleware/auth');

// @desc    Inscription visiteur gratuite
// @route   POST /api/visitors/inscription
// @access  Public
router.post('/inscription', (req, res) => visitorController.register(req, res));

// @desc    Obtenir tous les visiteurs (avec pagination)
// @route   GET /api/visitors
// @access  Admin
router.get('/', protect, admin, (req, res) => visitorController.getAll(req, res));

// @desc    Obtenir les statistiques des visiteurs (Placé avant /:id pour éviter conflit)
// @route   GET /api/visitors/stats/overview
// @access  Admin
router.get('/stats/overview', protect, admin, (req, res) => visitorController.getStats(req, res));

// @desc    Obtenir un visiteur par ID
// @route   GET /api/visitors/:id
// @access  Admin
router.get('/:id', protect, admin, (req, res) => visitorController.getById(req, res));

// @desc    Modifier les préférences de notification d'un visiteur
// @route   PUT /api/visitors/:id/preferences
// @access  Public (avec token ou email de vérification)
router.put('/:id/preferences', (req, res) => visitorController.updatePreferences(req, res));

// @desc    Désabonner un visiteur
// @route   DELETE /api/visitors/:id/unsubscribe
// @access  Public
router.delete('/:id/unsubscribe', (req, res) => visitorController.unsubscribe(req, res));

module.exports = router;
