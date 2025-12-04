const express = require('express');
const router = express.Router();
const Formation = require('../models/Formation');
const { parseAirtelMessage } = require('../utils/paymentParser');
const { protect, admin } = require('../middleware/auth');
const { envoyerOffreFormationTousVisiteurs } = require('../services/notificationService');
const logger = require('../config/logger');

// @desc    Créer une nouvelle formation
// @route   POST /api/formations
// @access  Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const formationData = req.body;

        const nouvelleFormation = new Formation(formationData);
        await nouvelleFormation.save();

        logger.info('Nouvelle formation créée', {
            formationId: nouvelleFormation._id,
            titre: nouvelleFormation.titre
        });

        // Envoyer l'offre à tous les visiteurs si demandé
        if (req.body.notifierVisiteurs) {
            try {
                await envoyerOffreFormationTousVisiteurs(nouvelleFormation);
            } catch (emailError) {
                logger.error('Erreur envoi offre formation', { error: emailError.message });
            }
        }

        res.status(201).json({
            success: true,
            message: 'Formation créée avec succès',
            formation: nouvelleFormation
        });

    } catch (error) {
        logger.error('Erreur création formation:', { error: error.message, stack: error.stack });

        res.status(400).json({
            success: false,
            error: error.message || 'Erreur lors de la création de la formation'
        });
    }
});

// @desc    Obtenir toutes les formations actives
// @route   GET /api/formations
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, niveau, prixMax } = req.query;

        const query = { isActive: true };

        if (niveau) {
            query.niveauRequis = niveau;
        }

        if (prixMax) {
            query.prix = { $lte: parseInt(prixMax) };
        }

        const total = await Formation.countDocuments(query);
        const formations = await Formation.find(query)
            .select('-participants') // Ne pas exposer les participants dans la liste
            .sort({ dateCreation: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: formations.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            formations
        });

    } catch (error) {
        logger.error('Erreur récupération formations:', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la récupération des formations'
        });
    }
});

// @desc    Obtenir une formation par ID
// @route   GET /api/formations/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const formation = await Formation.findById(req.params.id)
            .select('-participants.paiementReference'); // Masquer les références de paiement

        if (!formation) {
            return res.status(404).json({
                success: false,
                error: 'Formation non trouvée'
            });
        }

        res.status(200).json({
            success: true,
            formation
        });

    } catch (error) {
        logger.error('Erreur récupération formation:', { error: error.message, id: req.params.id });
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la récupération de la formation'
        });
    }
});

// @desc    Inscription à une formation
// @route   POST /api/formations/:id/inscription
// @access  Public
router.post('/:id/inscription', async (req, res) => {
    try {
        const { candidat_id, visitor_id, paymentMessage } = req.body;

        if (!candidat_id && !visitor_id) {
            return res.status(400).json({
                success: false,
                error: 'Vous devez fournir un candidat_id ou visitor_id'
            });
        }

        const formation = await Formation.findById(req.params.id);

        if (!formation) {
            return res.status(404).json({
                success: false,
                error: 'Formation non trouvée'
            });
        }

        if (!formation.isActive) {
            return res.status(400).json({
                success: false,
                error: 'Cette formation n\'est plus disponible'
            });
        }

        if (formation.estComplete()) {
            return res.status(400).json({
                success: false,
                error: 'Cette formation est complète'
            });
        }

        // Vérifier si déjà inscrit
        const dejaInscrit = formation.participants.find(
            p => (p.candidat_id && p.candidat_id.toString() === candidat_id) ||
                (p.visitor_id && p.visitor_id.toString() === visitor_id)
        );

        if (dejaInscrit) {
            return res.status(400).json({
                success: false,
                error: 'Vous êtes déjà inscrit à cette formation'
            });
        }

        // Vérifier le paiement si un message est fourni
        let paiementStatut = 'EN_ATTENTE';
        let paiementReference = null;

        if (paymentMessage) {
            const paymentResult = parseAirtelMessage(paymentMessage);
            if (paymentResult.success && paymentResult.amount >= formation.prix) {
                paiementStatut = 'PAYE';
                paiementReference = paymentResult.transactionId;
            }
        }

        // Inscrire le participant
        const participantData = {
            candidat_id: candidat_id || undefined,
            visitor_id: visitor_id || undefined,
            paiementStatut,
            paiementReference
        };

        await formation.inscrireParticipant(participantData);

        logger.info('Nouvelle inscription formation', {
            formationId: formation._id,
            candidat_id,
            visitor_id,
            paiementStatut
        });

        res.status(201).json({
            success: true,
            message: paiementStatut === 'PAYE'
                ? 'Inscription réussie et paiement validé !'
                : 'Inscription enregistrée. Paiement en attente.',
            formation: {
                _id: formation._id,
                titre: formation.titre,
                prix: formation.prix
            },
            paiementStatut
        });

    } catch (error) {
        logger.error('Erreur inscription formation:', { error: error.message, id: req.params.id });

        res.status(400).json({
            success: false,
            error: error.message || 'Erreur lors de l\'inscription'
        });
    }
});

// @desc    Valider le paiement d'un participant
// @route   PATCH /api/formations/:id/participants/:participantId/valider-paiement
// @access  Admin
router.patch('/:id/participants/:participantId/valider-paiement', protect, admin, async (req, res) => {
    try {
        const { reference } = req.body;

        const formation = await Formation.findById(req.params.id);

        if (!formation) {
            return res.status(404).json({
                success: false,
                error: 'Formation non trouvée'
            });
        }

        await formation.validerPaiement(req.params.participantId, reference);

        logger.info('Paiement formation validé', {
            formationId: formation._id,
            participantId: req.params.participantId
        });

        res.status(200).json({
            success: true,
            message: 'Paiement validé avec succès'
        });

    } catch (error) {
        logger.error('Erreur validation paiement:', { error: error.message });

        res.status(400).json({
            success: false,
            error: error.message || 'Erreur lors de la validation du paiement'
        });
    }
});

// @desc    Obtenir les participants d'une formation
// @route   GET /api/formations/:id/participants
// @access  Admin
router.get('/:id/participants', protect, admin, async (req, res) => {
    try {
        const formation = await Formation.findById(req.params.id)
            .populate('participants.candidat_id', 'nom prenom email')
            .populate('participants.visitor_id', 'nom prenom email');

        if (!formation) {
            return res.status(404).json({
                success: false,
                error: 'Formation non trouvée'
            });
        }

        res.status(200).json({
            success: true,
            participants: formation.participants,
            stats: {
                total: formation.nombreInscrits,
                completes: formation.nombreCompletes,
                tauxCompletion: formation.tauxCompletionMoyen()
            }
        });

    } catch (error) {
        logger.error('Erreur récupération participants:', { error: error.message, id: req.params.id });
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des participants'
        });
    }
});

// @desc    Modifier une formation
// @route   PUT /api/formations/:id
// @access  Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const formation = await Formation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!formation) {
            return res.status(404).json({
                success: false,
                error: 'Formation non trouvée'
            });
        }

        logger.info('Formation modifiée', { formationId: formation._id });

        res.status(200).json({
            success: true,
            message: 'Formation modifiée avec succès',
            formation
        });

    } catch (error) {
        logger.error('Erreur modification formation:', { error: error.message, id: req.params.id });

        res.status(400).json({
            success: false,
            error: error.message || 'Erreur lors de la modification'
        });
    }
});

// @desc    Désactiver une formation
// @route   DELETE /api/formations/:id
// @access  Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const formation = await Formation.findById(req.params.id);

        if (!formation) {
            return res.status(404).json({
                success: false,
                error: 'Formation non trouvée'
            });
        }

        formation.isActive = false;
        await formation.save();

        logger.info('Formation désactivée', { formationId: formation._id });

        res.status(200).json({
            success: true,
            message: 'Formation désactivée avec succès'
        });

    } catch (error) {
        logger.error('Erreur désactivation formation:', { error: error.message, id: req.params.id });

        res.status(500).json({
            success: false,
            error: 'Erreur lors de la désactivation'
        });
    }
});

module.exports = router;
