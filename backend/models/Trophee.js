const mongoose = require('mongoose');

const historiqueProprietaireSchema = new mongoose.Schema({
  candidat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidat',
    required: true
  },
  date_acquisition: {
    type: Date,
    default: Date.now
  },
  date_perte: {
    type: Date,
    default: null
  },
  raison_perte: {
    type: String,
    enum: ['DEFI_PERDU', 'RETRAIT', 'ADMINISTRATIF', 'AUTRE'],
    default: null
  },
  duree_possession: {
    type: Number, // en jours
    default: 0
  }
});

const tropheeSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom du trophée est obligatoire'],
    unique: true,
    trim: true
  },
  
  description: {
    type: String,
    required: [true, 'La description du trophée est obligatoire']
  },
  
  valeur: {
    type: Number,
    required: true,
    min: 0
  },
  
  categorie_requise: {
    type: String,
    required: true,
    enum: ['Primaire', 'College/Lycee', 'Universitaire']
  },
  
  image: {
    type: String,
    default: null
  },
  
  proprietaire_actuel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidat',
    default: null
  },
  
  historique_proprietaires: [historiqueProprietaireSchema],
  
  statut: {
    type: String,
    enum: ['DISPONIBLE', 'ATTRIBUE', 'RETIRE', 'EN_RESTAURATION'],
    default: 'DISPONIBLE'
  },
  
  date_creation: {
    type: Date,
    default: Date.now
  },
  
  date_derniere_attribution: {
    type: Date,
    default: null
  },
  
  nombre_changements: {
    type: Number,
    default: 0
  },
  
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index pour les performances
tropheeSchema.index({ categorie_requise: 1, statut: 1 });
tropheeSchema.index({ proprietaire_actuel: 1 });

// Middleware pour calculer la durée de possession avant sauvegarde
tropheeSchema.pre('save', function(next) {
  if (this.historique_proprietaires.length > 0) {
    const dernierProprietaire = this.historique_proprietaires[this.historique_proprietaires.length - 1];
    
    if (dernierProprietaire.date_perte && dernierProprietaire.date_acquisition) {
      const duree = Math.floor((dernierProprietaire.date_perte - dernierProprietaire.date_acquisition) / (1000 * 60 * 60 * 24));
      dernierProprietaire.duree_possession = duree;
    }
  }
  next();
});

// Méthode pour attribuer le trophée à un candidat
tropheeSchema.methods.attribuer = function(candidatId, raison = 'VICTOIRE_DEBAT') {
  if (this.statut !== 'DISPONIBLE') {
    throw new Error('Le trophée n\'est pas disponible');
  }
  
  // Ajouter à l'historique
  this.historique_proprietaires.push({
    candidat_id: candidatId,
    date_acquisition: new Date(),
    raison_perte: null
  });
  
  this.proprietaire_actuel = candidatId;
  this.statut = 'ATTRIBUE';
  this.date_derniere_attribution = new Date();
  this.nombre_changements += 1;
};

// Méthode pour retirer le trophée
tropheeSchema.methods.retirer = function(raison = 'ADMINISTRATIF') {
  if (this.statut !== 'ATTRIBUE') {
    throw new Error('Le trophée n\'est pas actuellement attribué');
  }
  
  // Mettre à jour le dernier propriétaire dans l'historique
  if (this.historique_proprietaires.length > 0) {
    const dernierProprietaire = this.historique_proprietaires[this.historique_proprietaires.length - 1];
    dernierProprietaire.date_perte = new Date();
    dernierProprietaire.raison_perte = raison;
    
    // Calculer la durée de possession
    const duree = Math.floor((dernierProprietaire.date_perte - dernierProprietaire.date_acquisition) / (1000 * 60 * 60 * 24));
    dernierProprietaire.duree_possession = duree;
  }
  
  this.proprietaire_actuel = null;
  this.statut = 'DISPONIBLE';
};

module.exports = mongoose.model('Trophee', tropheeSchema);