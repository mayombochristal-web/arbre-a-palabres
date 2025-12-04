const mongoose = require('mongoose');

// Schéma pour les scores
const scoreParticipantSchema = new mongoose.Schema({
  candidat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidat',
    required: true
  },
  score_arguments: {
    type: Number,
    default: 0
  },
  score_style: {
    type: Number,
    default: 0
  },
  score_final: {
    type: Number,
    default: 0
  },
  rang: { // 1er, 2e, 3e, 4e
    type: Number,
    default: null
  }
}, { _id: false });


const debatSchema = new mongoose.Schema({
  theme_debat: {
    type: String,
    required: [true, 'Le thème du débat est obligatoire'],
    trim: true,
    maxlength: [200, 'Le thème ne peut pas dépasser 200 caractères']
  },

  participants_ids: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidat'
    }],
    validate: {
      validator: function (participants) {
        // Validation côté Mongoose pour s'assurer qu'il y ait exactement 4 participants
        return participants.length === 4;
      },
      message: 'Un débat doit avoir exactement 4 participants'
    }
  },

  categorie: {
    type: String,
    required: true,
    enum: ['Primaire', 'College/Lycee', 'Universitaire']
  },

  // Finances
  cagnotte_totale: {
    type: Number,
    required: true,
    min: 0
  },
  frais_organisation: {
    type: Number,
    required: true,
    min: 0
  },
  gain_vainqueur: {
    type: Number,
    required: true,
    min: 0
  },
  frais_unitaire: {
    type: Number,
    required: true,
    min: 0
  },

  // Scores
  scores_participants: [scoreParticipantSchema],

  // Statut
  statut: {
    type: String,
    enum: ['en_attente', 'en_cours', 'termine', 'annule'],
    default: 'en_attente'
  },

  // Dates
  date_debut: {
    type: Date,
    default: Date.now
  },

  date_fin: {
    type: Date,
    default: null
  },

  // Référence aux juges (ou modérateur)
  juge_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index pour les performances
debatSchema.index({ statut: 1, date_debut: -1 });
debatSchema.index({ participants_ids: 1 });
debatSchema.index({ categorie: 1 });
debatSchema.index({ 'scores_participants.rang': 1 });

// Méthode pour vérifier si un débat peut démarrer
debatSchema.methods.peutDemarrer = function () {
  return this.statut === 'en_attente' &&
    this.participants_ids.length === 4;
};

// Méthode pour calculer le classement
debatSchema.methods.calculerClassement = function () {
  if (this.scores_participants.length === 0) return null;

  // Trie en ordre décroissant
  const scoresAvecRang = [...this.scores_participants]
    .sort((a, b) => b.score_final - a.score_final)
    .map((score, index) => ({
      ...score.toObject(),
      rang: index + 1
    }));

  return scoresAvecRang;
};

// Middleware pour valider la cohérence financière
debatSchema.pre('save', function (next) {
  // Validation 1: Cagnotte Totale = Frais Unitaire * 4 participants
  if (this.isModified('cagnotte_totale') || this.isModified('frais_unitaire')) {
    if (this.cagnotte_totale !== this.frais_unitaire * 4) {
      return next(new Error(
        `Validation financière échouée: La cagnotte totale (${this.cagnotte_totale} FCFA) ` +
        `doit être égale aux frais unitaires (${this.frais_unitaire} FCFA) × 4 participants.`
      ));
    }
  }

  // Validation 2: Répartition 75/25 (Gain Vainqueur + Frais Organisation = Cagnotte Totale)
  if (this.isModified('gain_vainqueur') ||
    this.isModified('frais_organisation') ||
    this.isModified('cagnotte_totale')) {

    const totalAllocation = this.frais_organisation + this.gain_vainqueur;

    if (totalAllocation !== this.cagnotte_totale) {
      return next(new Error(
        `Validation financière échouée: La somme du gain vainqueur (${this.gain_vainqueur} FCFA) ` +
        `et des frais d'organisation (${this.frais_organisation} FCFA) doit égaler ` +
        `la cagnotte totale (${this.cagnotte_totale} FCFA). Total actuel: ${totalAllocation} FCFA.`
      ));
    }

    // Validation 3: Vérifier le ratio 75/25
    const expectedGainVainqueur = Math.floor(this.cagnotte_totale * 0.75);
    const expectedFraisOrganisation = this.cagnotte_totale - expectedGainVainqueur;

    if (this.gain_vainqueur !== expectedGainVainqueur ||
      this.frais_organisation !== expectedFraisOrganisation) {
      return next(new Error(
        `Validation financière échouée: Le ratio 75/25 n'est pas respecté. ` +
        `Attendu: Gain vainqueur = ${expectedGainVainqueur} FCFA (75%), ` +
        `Frais organisation = ${expectedFraisOrganisation} FCFA (25%). ` +
        `Reçu: Gain vainqueur = ${this.gain_vainqueur} FCFA, ` +
        `Frais organisation = ${this.frais_organisation} FCFA.`
      ));
    }
  }

  next();
});

module.exports = mongoose.model('Debat', debatSchema);