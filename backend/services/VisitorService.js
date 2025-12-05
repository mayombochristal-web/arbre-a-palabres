const Visitor = require('../models/Visitor');
const notificationService = require('./notificationService');
const logger = require('../config/logger');

class VisitorService {

    /**
     * Inscrire un nouveau visiteur
     * @param {Object} data Données du visiteur
     * @returns {Promise<Object>} Le visiteur créé
     */
    async register(data) {
        const { nom, prenom, email, telephone, preferences, source } = data;

        // Validation métier : unicité
        const existingVisitor = await Visitor.findOne({ email });
        if (existingVisitor) {
            throw new Error('Un visiteur avec cet email existe déjà');
        }

        // Création
        const newVisitor = new Visitor({
            nom,
            prenom,
            email,
            telephone,
            preferences: preferences || {},
            source: source || 'website'
        });

        await newVisitor.save();

        // Gestion des effets de bord (Notifications) via le service dédié
        try {
            await notificationService.sendWelcome(newVisitor);
        } catch (error) {
            logger.warn('Echec envoi email bienvenue', { error: error.message });
        }

        notificationService.notifyAdmin(
            '🌟 Nouveau Visiteur Inscrit !',
            `<p>Un nouveau visiteur vient de s'inscrire.</p>
             <ul>
                <li><strong>Nom:</strong> ${nom} ${prenom}</li>
                <li><strong>Email:</strong> ${email}</li>
             </ul>`
        );

        return newVisitor;
    }

    /**
     * Récupérer tous les visiteurs avec pagination et filtre
     * @param {Object} params { page, limit, search, isActive }
     */
    async findAll(params) {
        const { page = 1, limit = 20, search, isActive } = params;
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

        return {
            visitors,
            pagination: {
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        };
    }

    /**
     * Trouver un visiteur par ID
     * @param {string} id 
     */
    async findById(id) {
        const visitor = await Visitor.findById(id);
        if (!visitor) {
            throw new Error('Visiteur non trouvé');
        }
        return visitor;
    }

    /**
     * Mettre à jour les préférences
     * @param {string} id 
     * @param {Object} preferences 
     */
    async updatePreferences(id, preferences) {
        const visitor = await this.findById(id);

        visitor.preferences = {
            ...visitor.preferences,
            ...preferences
        };

        return await visitor.save();
    }

    /**
     * Désabonner un visiteur
     * @param {string} id 
     */
    async unsubscribe(id) {
        const visitor = await this.findById(id);
        await visitor.desabonner();
        return visitor;
    }

    /**
     * Obtenir les statistiques globales
     */
    async getStats() {
        const total = await Visitor.countDocuments();
        const active = await Visitor.countDocuments({ isActive: true });
        const inactive = await Visitor.countDocuments({ isActive: false });

        const sourceStats = await Visitor.aggregate([
            { $group: { _id: '$source', count: { $sum: 1 } } }
        ]);

        return { total, active, inactive, sourceStats };
    }
}

module.exports = new VisitorService();
