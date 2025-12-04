const Notification = require('../models/Notification');
const Visitor = require('../models/Visitor');
const Candidat = require('../models/Candidat');
const emailService = require('./emailService');
const templates = require('../utils/notificationTemplates');
const logger = require('../config/logger');

/**
 * Service principal pour gérer toutes les notifications
 */

/**
 * Envoyer une notification à un destinataire
 * @param {Object} options - Options de notification
 * @param {string} options.destinataire - ID du destinataire
 * @param {string} options.destinataireType - Type: 'Visitor' ou 'Candidat'
 * @param {string} options.type - Type de notification
 * @param {string} options.templateName - Nom du template à utiliser
 * @param {Object} options.data - Données pour le template
 * @param {string} options.canal - Canal d'envoi (email, sms, both)
 * @returns {Promise<Object>} Notification créée
 */
const envoyerNotification = async (options) => {
    const {
        destinataire,
        destinataireType,
        type,
        templateName,
        data,
        canal = 'email'
    } = options;

    try {
        // Récupérer les informations du destinataire
        const Model = destinataireType === 'Visitor' ? Visitor : Candidat;
        const dest = await Model.findById(destinataire);

        if (!dest) {
            throw new Error(`Destinataire ${destinataireType} non trouvé`);
        }

        // Vérifier si le destinataire accepte ce type de notification
        if (destinataireType === 'Visitor' && !dest.accepteNotification(type)) {
            logger.info('Notification ignorée (préférences)', {
                destinataire,
                type
            });
            return null;
        }

        // Générer le contenu depuis le template
        const template = templates[templateName];
        if (!template) {
            throw new Error(`Template ${templateName} non trouvé`);
        }

        const { subject, html } = template({ ...data, destinataire: dest });

        // Créer l'enregistrement de notification
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

        // Envoyer l'email
        if (canal === 'email' || canal === 'both') {
            try {
                await emailService.sendEmail(dest.email, subject, html);
                await notification.marquerEnvoye();

                // Mettre à jour le destinataire
                dest.lastNotificationSent = new Date();
                if (destinataireType === 'Visitor') {
                    dest.nombreNotificationsRecues += 1;
                }
                await dest.save();

                logger.info('Notification envoyée avec succès', {
                    destinataire,
                    type,
                    email: dest.email
                });
            } catch (error) {
                await notification.marquerEchouee(error.message);
                throw error;
            }
        }

        return notification;
    } catch (error) {
        logger.error('Erreur lors de l\'envoi de notification', {
            destinataire,
            type,
            error: error.message
        });
        throw error;
    }
};

/**
 * Notifier tous les visiteurs et candidats d'un nouveau débat
 * @param {Object} debat - Objet débat
 * @returns {Promise<Object>} Résultats des envois
 */
const notifierNouveauDebat = async (debat) => {
    try {
        const results = { success: 0, failed: 0 };

        // Récupérer tous les visiteurs actifs qui acceptent les notifications de débats
        const visiteurs = await Visitor.find({
            isActive: true,
            'preferences.nouveauxDebats': true
        });

        // Récupérer tous les candidats de la même catégorie
        const candidats = await Candidat.find({
            categorie: debat.categorie,
            statutAdministratif: 'ADMISSIBLE'
        });

        // Envoyer aux visiteurs
        for (const visiteur of visiteurs) {
            try {
                await envoyerNotification({
                    destinataire: visiteur._id,
                    destinataireType: 'Visitor',
                    type: 'NOUVEAU_DEBAT',
                    templateName: 'nouveauDebatTemplate',
                    data: { debat }
                });
                results.success++;
            } catch (error) {
                results.failed++;
            }
        }

        // Envoyer invitations personnalisées aux candidats
        for (const candidat of candidats) {
            try {
                await envoyerNotification({
                    destinataire: candidat._id,
                    destinataireType: 'Candidat',
                    type: 'INVITATION_PARTICIPATION',
                    templateName: 'invitationParticipationTemplate',
                    data: { candidat, debat }
                });
                results.success++;
            } catch (error) {
                results.failed++;
            }
        }

        logger.info('Notifications nouveau débat envoyées', results);
        return results;
    } catch (error) {
        logger.error('Erreur notification nouveau débat', { error: error.message });
        throw error;
    }
};

/**
 * Notifier les résultats d'un débat
 * @param {Object} debat - Objet débat
 * @param {Object} vainqueur - Candidat vainqueur
 * @returns {Promise<Object>} Résultats des envois
 */
const notifierResultatDebat = async (debat, vainqueur) => {
    try {
        const results = { success: 0, failed: 0 };

        // Notifier tous les visiteurs actifs
        const visiteurs = await Visitor.find({
            isActive: true,
            'preferences.resultatsDebats': true
        });

        for (const visiteur of visiteurs) {
            try {
                await envoyerNotification({
                    destinataire: visiteur._id,
                    destinataireType: 'Visitor',
                    type: 'RESULTAT_DEBAT',
                    templateName: 'resultatDebatTemplate',
                    data: { debat, vainqueur }
                });
                results.success++;
            } catch (error) {
                results.failed++;
            }
        }

        // Féliciter le vainqueur
        try {
            await envoyerNotification({
                destinataire: vainqueur._id,
                destinataireType: 'Candidat',
                type: 'FELICITATIONS_VICTOIRE',
                templateName: 'felicitationsVictoireTemplate',
                data: { candidat: vainqueur, debat }
            });
            results.success++;
        } catch (error) {
            results.failed++;
        }

        // Encourager les autres participants
        const participants = debat.participants.filter(
            p => p.candidat_id.toString() !== vainqueur._id.toString()
        );

        for (const participant of participants) {
            try {
                const candidat = await Candidat.findById(participant.candidat_id);
                if (candidat) {
                    await envoyerNotification({
                        destinataire: candidat._id,
                        destinataireType: 'Candidat',
                        type: 'ENCOURAGEMENT',
                        templateName: 'encouragementTemplate',
                        data: { candidat, debat }
                    });
                    results.success++;
                }
            } catch (error) {
                results.failed++;
            }
        }

        logger.info('Notifications résultat débat envoyées', results);
        return results;
    } catch (error) {
        logger.error('Erreur notification résultat débat', { error: error.message });
        throw error;
    }
};

/**
 * Proposer une formation à un destinataire
 * @param {Object} formation - Objet formation
 * @param {string} destinataire - ID du destinataire
 * @param {string} destinataireType - Type de destinataire
 * @returns {Promise<Object>} Notification envoyée
 */
const proposerFormation = async (formation, destinataire, destinataireType) => {
    return envoyerNotification({
        destinataire,
        destinataireType,
        type: 'OFFRE_FORMATION',
        templateName: 'offreFormationTemplate',
        data: { formation }
    });
};

/**
 * Envoyer l'offre de formation à tous les visiteurs
 * @param {Object} formation - Objet formation
 * @returns {Promise<Object>} Résultats des envois
 */
const envoyerOffreFormationTousVisiteurs = async (formation) => {
    try {
        const results = { success: 0, failed: 0 };

        const visiteurs = await Visitor.find({
            isActive: true,
            'preferences.offresFormation': true
        });

        for (const visiteur of visiteurs) {
            try {
                await proposerFormation(formation, visiteur._id, 'Visitor');
                results.success++;
            } catch (error) {
                results.failed++;
            }
        }

        logger.info('Offre formation envoyée à tous les visiteurs', results);
        return results;
    } catch (error) {
        logger.error('Erreur envoi offre formation', { error: error.message });
        throw error;
    }
};

/**
 * Envoyer email de bienvenue à un nouveau visiteur
 * @param {Object} visiteur - Objet visiteur
 * @returns {Promise<Object>} Notification envoyée
 */
const envoyerBienvenue = async (visiteur) => {
    return envoyerNotification({
        destinataire: visiteur._id,
        destinataireType: 'Visitor',
        type: 'BIENVENUE',
        templateName: 'bienvenueVisiteurTemplate',
        data: { nom: visiteur.nom, prenom: visiteur.prenom }
    });
};

module.exports = {
    envoyerNotification,
    notifierNouveauDebat,
    notifierResultatDebat,
    proposerFormation,
    envoyerOffreFormationTousVisiteurs,
    envoyerBienvenue
};
