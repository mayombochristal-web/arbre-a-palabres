const visitorService = require('../services/VisitorService');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../config/logger');

class VisitorController {

    /**
     * @route POST /api/visitors/inscription
     */
    async register(req, res) {
        try {
            const visitor = await visitorService.register(req.body);
            res.status(201).json(ApiResponse.success(visitor, 'Inscription réussie !'));
        } catch (error) {
            logger.error('Erreur inscription', { error: error.message });
            res.status(400).json(ApiResponse.error(error.message));
        }
    }

    /**
     * @route GET /api/visitors
     */
    async getAll(req, res) {
        try {
            const data = await visitorService.findAll(req.query);
            res.status(200).json(ApiResponse.success(data));
        } catch (error) {
            logger.error('Erreur récupération visiteurs', { error: error.message });
            res.status(500).json(ApiResponse.error('Erreur serveur'));
        }
    }

    /**
     * @route GET /api/visitors/:id
     */
    async getById(req, res) {
        try {
            const visitor = await visitorService.findById(req.params.id);
            res.status(200).json(ApiResponse.success(visitor));
        } catch (error) {
            if (error.message === 'Visiteur non trouvé') {
                return res.status(404).json(ApiResponse.error(error.message));
            }
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    /**
     * @route PUT /api/visitors/:id/preferences
     */
    async updatePreferences(req, res) {
        try {
            const visitor = await visitorService.updatePreferences(req.params.id, req.body.preferences);
            res.status(200).json(ApiResponse.success(
                visitor.preferences,
                'Préférences mises à jour avec succès'
            ));
        } catch (error) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    /**
     * @route DELETE /api/visitors/:id/unsubscribe
     */
    async unsubscribe(req, res) {
        try {
            await visitorService.unsubscribe(req.params.id);
            res.status(200).json(ApiResponse.success(null, 'Désabonnement réussi'));
        } catch (error) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    /**
     * @route GET /api/visitors/stats/overview
     */
    async getStats(req, res) {
        try {
            const stats = await visitorService.getStats();
            res.status(200).json(ApiResponse.success(stats));
        } catch (error) {
            res.status(500).json(ApiResponse.error('Erreur récupération statistiques'));
        }
    }
}

module.exports = new VisitorController();
