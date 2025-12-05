const Notification = require('../models/Notification');
const Visitor = require('../models/Visitor');
const Candidat = require('../models/Candidat');
const emailService = require('./emailService');
const templates = require('../utils/notificationTemplates');
const logger = require('../config/logger');

/**
 * Service de gestion des notifications (Architecture Orientée Objet)
 * Encapsule toute la logique d'envoi et de suivi des notifications.
 */
class NotificationService {
    constructor() {
        this.adminEmail = 'mayombochristal@gmail.com';
    }

    /**
     * Méthode générique d'envoi de notification
     * @param {Object} options 
     */
    async send(options) {
        const {
            destinataire,
            destinataireType,
            type,
            templateName,
            data,
            canal = 'email'
        } = options;

        try {
            // 1. Validation et Récupération Destinataire
            const Model = destinataireType === 'Visitor' ? Visitor : Candidat;
            const dest = await Model.findById(destinataire);

            if (!dest) {
                throw new Error(`Destinataire ${destinataireType} non trouvé`);
            }

            // 2. Vérification des Préférences (Pattern Strategy pourrait être appliqué ici)
            if (destinataireType === 'Visitor' && !dest.accepteNotification(type)) {
                logger.info(`Notification ${type} ignorée par les préférences utilisateur`);
                return null;
            }

            // 3. Génération du Contenu
            const template = templates[templateName];
            if (!template) throw new Error(`Template ${templateName} introuvable`);

            const { subject, html } = template({ ...data, destinataire: dest });

            // 4. Persistance
            const notification = new Notification({
                destinataire,
                destinataireType,
                type,
                titre: subject,
                contenu: html,
                canal,
                metadata: data
            });
            await notification.save();

            // 5. Envoi (Canal Email)
            if (canal === 'email' || canal === 'both') {
                await this._sendEmailChannel(dest, subject, html, notification);
            }

            return notification;

        } catch (error) {
            this._handleError(error, destinataire, type);
            throw error;
        }
    }

    /**
     * Méthode privée pour gérer l'envoi email spécifique
     */
    async _sendEmailChannel(dest, subject, html, notification) {
        try {
            await emailService.sendEmail(dest.email, subject, html);
            await notification.marquerEnvoye();

            // Mise à jour des stats user
            dest.lastNotificationSent = new Date();
            if (dest instanceof Visitor) {
                dest.nombreNotificationsRecues += 1;
            }
            await dest.save();

            logger.info(`Email envoyé à ${dest.email}`);
        } catch (error) {
            await notification.marquerEchouee(error.message);
            throw error; // Propager pour gestion supérieure
        }
    }

    /**
     * Gestion centralisée des erreurs
     */
    _handleError(error, destId, type) {
        logger.error('Erreur NotificationService', {
            destinataire: destId,
            type,
            error: error.message
        });
    }

    // ==========================================
    // MÉTHODES MÉTIER SPÉCIFIQUES
    // ==========================================

    async notifyNewDebate(debat) {
        const results = { success: 0, failed: 0 };
        const visiteurs = await Visitor.find({ isActive: true, 'preferences.nouveauxDebats': true });

        // Utilisation de Promise.allSettled pour paralléliser (Optimisation)
        const promises = visiteurs.map(v =>
            this.send({
                destinataire: v._id,
                destinataireType: 'Visitor',
                type: 'NOUVEAU_DEBAT',
                templateName: 'nouveauDebatTemplate',
                data: { debat }
            }).then(() => results.success++).catch(() => results.failed++)
        );

        await Promise.allSettled(promises);
        return results;
    }

    async notifyAdmin(subject, htmlContent) {
        try {
            await emailService.sendEmail(this.adminEmail, subject, htmlContent);
            logger.info('Admin notifié', { subject });
        } catch (error) {
            logger.error('Echec notification admin', { error: error.message });
        }
    }

    async sendWelcome(visiteur) {
        return this.send({
            destinataire: visiteur._id,
            destinataireType: 'Visitor',
            type: 'BIENVENUE',
            templateName: 'bienvenueVisiteurTemplate',
            data: { nom: visiteur.nom, prenom: visiteur.prenom }
        });
    }
}

// Export d'une instance unique (Singleton Pattern)
module.exports = new NotificationService();
