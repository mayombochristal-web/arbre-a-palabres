const mongoose = require('mongoose');

const debatSchema = new mongoose.Schema({
  theme_debat: {
    type: String,
    required: [true, 'Le thème du débat est obligatoire'],
    trim: true,
    maxlength: [200, 'Le thème ne peut pas dépasser 200 caractères']
  },
  
  participants_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidat',
    required: true,
    validate: {
      validator: function(participants) {
        return participants.length === 4;
      },
      message: 'Un débat doit avoir exactement 4 participants'
    }
  }],
  
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
  
  source_financement: {
    type: String,
    required: true,
    enum: ['Candidats', 'Organisation', 'Candidats/Organisation', 'Don'],
    default: 'Candidats'
  },
  
  statut: {
    type: String,
    enum: ['en_attente', 'en_cours', 'termine', 'annule'],
    default: 'en_attente'
  },
  
  vainqueur_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidat',
    default: null
  },
  
  date_debut: {
    type: Date,
    default: Date.now
  },
  
  date_fin: {
    type: Date,
    default: null
  },
  
  type_debat: {
    type: String,
    enum: ['standard', 'defi', 'tournoi'],
    default: 'standard'
  },
  
  // Pour les débats de défi
  trophee_en_jeu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trophee',
    default: null
  },
  
  // Informations d'évaluation
  jury_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jury'
  }],
  
  scores_participants: [{
    candidat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidat'
    },
    score_ecrit: Number,
    score_oral: Number,
    score_final: Number,
    rang: Number
  }],
  
  description: String,
  regles_speciales: [String],
  
  created_by: {
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
debatSchema.methods.peutDemarrer = function() {
  return this.statut === 'en_attente' && 
         this.participants_ids.length === 4;
};

// Méthode pour calculer le classement
debatSchema.methods.calculerClassement = function() {
  if (this.scores_participants.length === 0) return null;
  
  const scoresAvecRang = [...this.scores_participants]
    .sort((a, b) => b.score_final - a.score_final)
    .map((score, index) => ({
      ...score.toObject(),
      rang: index + 1
    }));
  
  return scoresAvecRang;
};

// Middleware pour valider la cohérence financière
debatSchema.pre('save', function(next) {
  if (this.isModified('cagnotte_totale') || 
      this.isModified('frais_organisation') || 
      this.isModified('gain_vainqueur')) {
    
    const totalCalcule = this.frais_organisation + this.gain_vainqueur;
    
    if (Math.abs(totalCalcule - this.cagnotte_totale) > 1) {
      return next(new Error('Incohérence financière: frais + gain doit égaler la cagnotte totale'));
    }
  }
  next();
});

module.exports = mongoose.model('Debat', debatSchema);