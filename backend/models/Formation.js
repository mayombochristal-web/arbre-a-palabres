const mongoose = require('mongoose');

const formationSchema = new mongoose.Schema({
    // Informations de base
    titre: {
        type: String,
        required: [true, 'Le titre est obligatoire'],
        trim: true,
        maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
    },
    description: {
        type: String,
        required: [true, 'La description est obligatoire'],
        maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
    },
    descriptionCourte: {
        type: String,
        maxlength: [200, 'La description courte ne peut pas dépasser 200 caractères']
    },

    // Tarification
    prix: {
        type: Number,
        required: [true, 'Le prix est obligatoire'],
        min: [0, 'Le prix ne peut pas être négatif']
    },

    // Durée et niveau
    duree: {
        type: Number, // En heures
        required: [true, 'La durée est obligatoire'],
        min: [1, 'La durée minimale est de 1 heure']
    },
    niveauRequis: {
        type: String,
        enum: ['Débutant', 'Intermédiaire', 'Avancé'],
        default: 'Débutant'
    },

    // Contenu de la formation
    modules: [{
        titre: String,
        description: String,
        duree: Number, // En minutes
        ordre: Number
    }],

    // Objectifs pédagogiques
    objectifs: [{
        type: String
    }],

    // Prérequis
    prerequis: [{
        type: String
    }],

    // Statut
    isActive: {
        type: Boolean,
        default: true
    },

    // Capacité
    capaciteMax: {
        type: Number,
        default: null // null = illimité
    },

    // Participants
    participants: [{
        candidat_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidat'
        },
        visitor_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Visitor'
        },
        dateInscription: {
            type: Date,
            default: Date.now
        },
        paiementStatut: {
            type: String,
            enum: ['EN_ATTENTE', 'PAYE', 'REMBOURSE'],
            default: 'EN_ATTENTE'
        },
        paiementReference: String,
        progression: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        statut: {
            type: String,
            enum: ['EN_COURS', 'TERMINE', 'ABANDONNE'],
            default: 'EN_COURS'
        },
        dateCompletion: Date
    }],

    // Statistiques
    nombreInscrits: {
        type: Number,
        default: 0
    },
    nombreCompletes: {
        type: Number,
        default: 0
    },

    // Dates
    dateCreation: {
        type: Date,
        default: Date.now
    },
    dateDebut: Date,
    dateFin: Date
}, {
    timestamps: true
});

// Index pour les performances
formationSchema.index({ isActive: 1 });
formationSchema.index({ prix: 1 });
formationSchema.index({ dateCreation: -1 });
formationSchema.index({ 'participants.candidat_id': 1 });
formationSchema.index({ 'participants.visitor_id': 1 });

// Méthode pour vérifier si la formation est complète
formationSchema.methods.estComplete = function () {
    if (!this.capaciteMax) return false;
    return this.nombreInscrits >= this.capaciteMax;
};

// Méthode pour inscrire un participant
formationSchema.methods.inscrireParticipant = function (participantData) {
    this.participants.push(participantData);
    this.nombreInscrits = this.participants.length;
    return this.save();
};

// Méthode pour valider le paiement d'un participant
formationSchema.methods.validerPaiement = function (participantId, reference) {
    const participant = this.participants.id(participantId);
    if (participant) {
        participant.paiementStatut = 'PAYE';
        participant.paiementReference = reference;
        return this.save();
    }
    return Promise.reject(new Error('Participant non trouvé'));
};

// Méthode pour obtenir le taux de complétion moyen
formationSchema.methods.tauxCompletionMoyen = function () {
    if (this.participants.length === 0) return 0;
    const total = this.participants.reduce((sum, p) => sum + p.progression, 0);
    return (total / this.participants.length).toFixed(2);
};

module.exports = mongoose.model('Formation', formationSchema);
