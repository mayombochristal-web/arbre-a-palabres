const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const { envoyerBienvenue } = require('../services/notificationService');
const { protect, admin } = require('../middleware/auth');
const logger = require('../config/logger');

// @desc    Inscription visiteur gratuite
// @route   POST /api/visitors/inscription
// @access  Public
router.post('/inscription', async (req, res) => {
    try {
        const {
            nom,
            prenom,
            email,
            telephone,
            preferences,
            source
        } = req.body;

        // Vérifier si l'email existe déjà
        const existeDeja = await Visitor.findOne({ email });

        if (existeDeja) {
            return res.status(400).json({
                success: false,
                error: 'Un visiteur avec cet email existe déjà'
            });
        }

        // Créer le visiteur
        const nouveauVisiteur = new Visitor({
            nom,
            prenom,
            email,
            telephone,
            preferences: preferences || {},
            source: source || 'website'
        });

        await nouveauVisiteur.save();

        // Envoyer email de bienvenue
        try {
            await envoyerBienvenue(nouveauVisiteur);
        } catch (emailError) {
            logger.error('Erreur envoi email bienvenue', { error: emailError.message });
            // Ne pas bloquer l'inscription si l'email échoue
        }

        logger.info('Nouveau visiteur inscrit', {
            visitorId: nouveauVisiteur._id,
            email: nouveauVisiteur.email
        });

        res.status(201).json({
            success: true,
            message: 'Inscription réussie ! Vous allez recevoir un email de bienvenue.',
            visitor: {
                _id: nouveauVisiteur._id,
                nom: nouveauVisiteur.nom,
                prenom: nouveauVisiteur.prenom,
                email: nouveauVisiteur.email,
                preferences: nouveauVisiteur.preferences
            }
        });

    } catch (error) {
        logger.error('Erreur inscription visiteur:', { error: error.message, stack: error.stack });

        res.status(400).json({
            success: false,
            error: error.message || 'Erreur lors de l\'inscription'
        });
    }
});

// @desc    Obtenir tous les visiteurs (avec pagination)
// @route   GET /api/visitors
// @access  Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const { page = 1, limit = 20, search, isActive } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { nom: { $regex: search, $options: 'i' } },
                { prenom: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const total = await Visitor.countDocuments(query);
        const visitors = await Visitor.find(query)
            .sort({ dateInscription: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: visitors.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            visitors
        });

    } catch (error) {
        logger.error('Erreur récupération visiteurs:', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la récupération des visiteurs'
        });
    }
});

// @desc    Obtenir un visiteur par ID
// @route   GET /api/visitors/:id
// @access  Admin
router.get('/:id', protect, admin, async (req, res) => {
    try {
        const visitor = await Visitor.findById(req.params.id);

        if (!visitor) {
            return res.status(404).json({
                success: false,
                error: 'Visiteur non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            visitor
        });

    } catch (error) {
        logger.error('Erreur récupération visiteur:', { error: error.message, id: req.params.id });
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la récupération du visiteur'
        });
    }
});

// @desc    Modifier les préférences de notification d'un visiteur
// @route   PUT /api/visitors/:id/preferences
// @access  Public (avec token ou email de vérification)
router.put('/:id/preferences', async (req, res) => {
    try {
        const { preferences } = req.body;

        const visitor = await Visitor.findById(req.params.id);

        if (!visitor) {
            return res.status(404).json({
                success: false,
                error: 'Visiteur non trouvé'
            });
        }

        // Mettre à jour les préférences
        visitor.preferences = {
            ...visitor.preferences,
            ...preferences
        };

        await visitor.save();

        logger.info('Préférences visiteur mises à jour', {
            visitorId: visitor._id,
            preferences: visitor.preferences
        });

        res.status(200).json({
            success: true,
            message: 'Préférences mises à jour avec succès',
            preferences: visitor.preferences
        });

    } catch (error) {
        logger.error('Erreur mise à jour préférences:', { error: error.message, id: req.params.id });
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la mise à jour des préférences'
        });
    }
});

// @desc    Désabonner un visiteur
// @route   DELETE /api/visitors/:id/unsubscribe
// @access  Public
router.delete('/:id/unsubscribe', async (req, res) => {
    try {
        const visitor = await Visitor.findById(req.params.id);

        if (!visitor) {
            return res.status(404).json({
                success: false,
                error: 'Visiteur non trouvé'
            });
        }

        await visitor.desabonner();

        logger.info('Visiteur désabonné', { visitorId: visitor._id });

        res.status(200).json({
            success: true,
            message: 'Vous avez été désabonné avec succès. Vous ne recevrez plus de notifications.'
        });

    } catch (error) {
        logger.error('Erreur désabonnement:', { error: error.message, id: req.params.id });
        res.status(500).json({
            success: false,
            error: 'Erreur lors du désabonnement'
        });
    }
});

// @desc    Obtenir les statistiques des visiteurs
// @route   GET /api/visitors/stats/overview
// @access  Admin
router.get('/stats/overview', protect, admin, async (req, res) => {
    try {
        const totalVisitors = await Visitor.countDocuments();
        const activeVisitors = await Visitor.countDocuments({ isActive: true });
        const inactiveVisitors = await Visitor.countDocuments({ isActive: false });

        // Statistiques par source
        const sourceStats = await Visitor.aggregate([
            { $group: { _id: '$source', count: { $sum: 1 } } }
        ]);

        // Inscriptions par mois (derniers 6 mois)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyStats = await Visitor.aggregate([
            { $match: { dateInscription: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$dateInscription' },
                        month: { $month: '$dateInscription' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                total: totalVisitors,
                active: activeVisitors,
                inactive: inactiveVisitors,
                bySour: sourceStats,
                monthly: monthlyStats
            }
        });

    } catch (error) {
        logger.error('Erreur récupération statistiques:', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des statistiques'
        });
    }
});

module.exports = router;
