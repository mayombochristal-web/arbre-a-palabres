const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Configuration du transporteur email
const createTransporter = () => {
    // Pour le développement, utiliser un compte de test Ethereal
    // En production, utiliser Gmail, SendGrid, ou autre service

    if (process.env.NODE_ENV === 'production' && process.env.EMAIL_USER) {
        // Configuration production avec Gmail ou autre
        return nodemailer.createTransporter({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    } else {
        // Configuration de test (les emails ne seront pas vraiment envoyés)
        return nodemailer.createTransporter({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER || 'test@ethereal.email',
                pass: process.env.EMAIL_PASSWORD || 'test123'
            }
        });
    }
};

/**
 * Envoyer un email simple
 * @param {string} to - Adresse email du destinataire
 * @param {string} subject - Sujet de l'email
 * @param {string} html - Contenu HTML de l'email
 * @param {string} text - Contenu texte brut (optionnel)
 * @returns {Promise<Object>} Résultat de l'envoi
 */
const sendEmail = async (to, subject, html, text = null) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"L\'Arbre à Palabres" <noreply@arbreapalabres.com>',
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, '') // Fallback: strip HTML tags
        };

        const info = await transporter.sendMail(mailOptions);

        logger.info('Email envoyé avec succès', {
            to,
            subject,
            messageId: info.messageId
        });

        return {
            success: true,
            messageId: info.messageId,
            preview: nodemailer.getTestMessageUrl(info) // URL de prévisualisation pour Ethereal
        };
    } catch (error) {
        logger.error('Erreur lors de l\'envoi de l\'email', {
            to,
            subject,
            error: error.message
        });

        throw new Error(`Échec de l'envoi de l'email: ${error.message}`);
    }
};

/**
 * Envoyer des emails en masse
 * @param {Array<string>} recipients - Liste des adresses email
 * @param {string} subject - Sujet de l'email
 * @param {string} html - Contenu HTML
 * @returns {Promise<Object>} Résultats des envois
 */
const sendBulkEmail = async (recipients, subject, html) => {
    const results = {
        success: [],
        failed: []
    };

    for (const recipient of recipients) {
        try {
            await sendEmail(recipient, subject, html);
            results.success.push(recipient);
        } catch (error) {
            results.failed.push({
                email: recipient,
                error: error.message
            });
        }
    }

    logger.info('Envoi groupé terminé', {
        total: recipients.length,
        success: results.success.length,
        failed: results.failed.length
    });

    return results;
};

/**
 * Envoyer un email avec un template
 * @param {string} to - Adresse email du destinataire
 * @param {string} templateName - Nom du template
 * @param {Object} data - Données pour le template
 * @returns {Promise<Object>} Résultat de l'envoi
 */
const sendTemplateEmail = async (to, templateName, data) => {
    const templates = require('../utils/notificationTemplates');

    const template = templates[templateName];
    if (!template) {
        throw new Error(`Template '${templateName}' non trouvé`);
    }

    const { subject, html } = template(data);
    return sendEmail(to, subject, html);
};

/**
 * Vérifier la configuration email
 * @returns {Promise<boolean>} True si la configuration est valide
 */
const verifyEmailConfig = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        logger.info('Configuration email vérifiée avec succès');
        return true;
    } catch (error) {
        logger.error('Erreur de configuration email', { error: error.message });
        return false;
    }
};

module.exports = {
    sendEmail,
    sendBulkEmail,
    sendTemplateEmail,
    verifyEmailConfig
};
