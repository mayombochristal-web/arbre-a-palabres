const mongoose = require('mongoose');
const validator = require('validator');

const visitorSchema = new mongoose.Schema({
    // Informations personnelles
    nom: {
        type: String,
        required: [true, 'Le nom est obligatoire'],
        trim: true,
        maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
    },
    prenom: {
        type: String,
        required: [true, 'Le prénom est obligatoire'],
        trim: true,
        maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
    },
    email: {
        type: String,
        required: [true, 'L\'email est obligatoire'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Veuillez fournir un email valide']
    },
    telephone: {
        type: String,
        trim: true,
        sparse: true // Permet les valeurs null/undefined sans contrainte d'unicité
    },

    // Préférences de notifications
    preferences: {
        nouveauxDebats: {
            type: Boolean,
            default: true
        },
        resultatsDebats: {
            type: Boolean,
            default: true
        },
        offresFormation: {
            type: Boolean,
            default: true
        },
        newsletter: {
            type: Boolean,
            default: true
        }
    },

    // Statut
    isActive: {
        type: Boolean,
        default: true
    },

    // Tracking
    dateInscription: {
        type: Date,
        default: Date.now
    },
    lastNotificationSent: {
        type: Date,
        default: null
    },
    nombreNotificationsRecues: {
        type: Number,
        default: 0
    },

    // Source d'inscription (pour analytics)
    source: {
        type: String,
        enum: ['website', 'mobile', 'referral', 'social_media'],
        default: 'website'
    }
}, {
    timestamps: true
});

// Index pour les performances
visitorSchema.index({ email: 1 }, { unique: true });
visitorSchema.index({ isActive: 1 });
visitorSchema.index({ dateInscription: -1 });

// Méthode pour vérifier si le visiteur souhaite recevoir un type de notification
visitorSchema.methods.accepteNotification = function (type) {
    if (!this.isActive) return false;

    switch (type) {
        case 'NOUVEAU_DEBAT':
            return this.preferences.nouveauxDebats;
        case 'RESULTAT_DEBAT':
            return this.preferences.resultatsDebats;
        case 'OFFRE_FORMATION':
            return this.preferences.offresFormation;
        case 'NEWSLETTER':
            return this.preferences.newsletter;
        default:
            return false;
    }
};

// Méthode pour désactiver l'abonnement
visitorSchema.methods.desabonner = function () {
    this.isActive = false;
    return this.save();
};

module.exports = mongoose.model('Visitor', visitorSchema);
