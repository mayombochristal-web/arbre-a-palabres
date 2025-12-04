const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // Destinataire (peut être un Visitor ou un Candidat)
    destinataire: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'destinataireType'
    },
    destinataireType: {
        type: String,
        required: true,
        enum: ['Visitor', 'Candidat']
    },

    // Type de notification
    type: {
        type: String,
        required: true,
        enum: [
            'NOUVEAU_DEBAT',
            'RESULTAT_DEBAT',
            'INVITATION_PARTICIPATION',
            'OFFRE_FORMATION',
            'ASTUCES_PERSONNALISEES',
            'NEWSLETTER',
            'BIENVENUE',
            'FELICITATIONS_VICTOIRE',
            'ENCOURAGEMENT'
        ]
    },

    // Contenu
    titre: {
        type: String,
        required: true,
        maxlength: 200
    },
    contenu: {
        type: String,
        required: true
    },

    // Canal d'envoi
    canal: {
        type: String,
        enum: ['email', 'sms', 'both'],
        default: 'email'
    },

    // Statut d'envoi
    statut: {
        type: String,
        enum: ['EN_ATTENTE', 'ENVOYE', 'ECHOUE'],
        default: 'EN_ATTENTE'
    },

    // Dates
    dateEnvoi: {
        type: Date,
        default: null
    },
    dateEchec: {
        type: Date,
        default: null
    },

    // Métadonnées additionnelles
    metadata: {
        debat_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Debat'
        },
        formation_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Formation'
        },
        vainqueur_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidat'
        },
        customData: mongoose.Schema.Types.Mixed
    },

    // Erreur (si échec)
    erreur: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Index pour les performances
notificationSchema.index({ destinataire: 1, destinataireType: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ statut: 1 });
notificationSchema.index({ dateEnvoi: -1 });
notificationSchema.index({ createdAt: -1 });

// Méthode pour marquer comme envoyée
notificationSchema.methods.marquerEnvoye = function () {
    this.statut = 'ENVOYE';
    this.dateEnvoi = new Date();
    return this.save();
};

// Méthode pour marquer comme échouée
notificationSchema.methods.marquerEchouee = function (erreur) {
    this.statut = 'ECHOUE';
    this.dateEchec = new Date();
    this.erreur = erreur;
    return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
