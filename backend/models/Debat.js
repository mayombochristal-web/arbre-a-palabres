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
  
  participants_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidat',
    required: true,
    validate: {
      validator: function(participants) {
        // Validation côté Mongoose pour s'assurer qu'il y ait exactement 4 participants
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
debatSchema.methods.peutDemarrer = function() {
  return this.statut === 'en_attente' && 
         this.participants_ids.length === 4;
};

// Méthode pour calculer le classement
debatSchema.methods.calculerClassement = function() {
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

// Middleware pour valider la cohérence financière (CORRECTION C3)
debatSchema.pre('save', function(next) {
  // Cette validation suppose que la cagnotte totale est la somme des frais unitaires de 4 participants
  if (this.isModified('cagnotte_totale') || 
      this.isModified('frais_unitaire')) {
    
    // Vérification de la cohérence : Cagnotte Totale = Frais Unitaire * Nombre de Participants (fixé à 4)
    if (this.cagnotte_totale !== this.frais_unitaire * 4) {
      // Pour une logique de cagnotte, on peut aussi vérifier que l'allocation ne dépasse pas la cagnotte.
      // Par souci de simplicité et de cohérence avec la variable "cagnotte_totale",
      // on vérifie que la cagnotte est bien le total des entrées.
      next(new Error(`Validation des finances échouée: La cagnotte totale (${this.cagnotte_totale}) doit être le produit des frais unitaires (${this.frais_unitaire} * 4).`));
    }
  }
  
  // Validation pour s'assurer que l'allocation ne dépasse pas la cagnotte (Bonne pratique)
  const totalAllocation = this.frais_organisation + this.gain_vainqueur; 
  // ATTENTION: Si vous avez d'autres gains (ex: 2e place), il faut les ajouter ici.
  // La formule actuelle est trop simpliste pour l'intégrer comme une règle stricte sans confirmation de votre logique.
  // Je laisse la validation de la CAGNOTTE_TOTALE = FRAIS_UNITAIRE * 4 car c'est la seule qui semble logique.
  
  next();
});

module.exports = mongoose.model('Debat', debatSchema);