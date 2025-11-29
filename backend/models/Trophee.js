const mongoose = require('mongoose');

// Schéma imbriqué pour l'historique
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
  
  image: String,
  
  // Statut
  statut: {
    type: String,
    enum: ['DISPONIBLE', 'ATTRIBUE', 'HORS_SERVICE'],
    default: 'DISPONIBLE'
  },
  
  proprietaire_actuel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidat',
    default: null
  },
  
  date_derniere_attribution: {
    type: Date,
    default: null
  },
  
  nombre_changements: {
    type: Number,
    default: 0
  },
  
  // Historique des propriétaires
  historique_proprietaires: [historiqueProprietaireSchema],
  
  // Admin
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Middleware pour vérifier la cohérence du propriétaire
tropheeSchema.pre('save', function(next) {
  if (this.isModified('proprietaire_actuel')) {
    if (this.proprietaire_actuel && this.statut !== 'ATTRIBUE') {
      next(new Error('Un trophée avec un propriétaire doit être au statut ATTRIBUE.'));
    } else if (!this.proprietaire_actuel && this.statut === 'ATTRIBUE') {
      next(new Error('Un trophée au statut ATTRIBUE doit avoir un propriétaire actuel.'));
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

// Méthode pour retirer le trophée (CORRECTION A3)
tropheeSchema.methods.retirer = function(raison = 'ADMINISTRATIF') {
  if (this.statut !== 'ATTRIBUE') {
    throw new Error('Le trophée n\'est pas actuellement attribué');
  }
  
  // Mettre à jour le dernier propriétaire dans l'historique
  if (this.historique_proprietaires.length > 0) {
    const dernierProprietaire = this.historique_proprietaires[this.historique_proprietaires.length - 1];
    
    // Calcul de la durée de possession en jours (CORRECTION A3)
    const datePerte = new Date();
    const dateAcquisition = dernierProprietaire.date_acquisition;
    const diffTime = Math.abs(datePerte.getTime() - dateAcquisition.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    dernierProprietaire.date_perte = datePerte;
    dernierProprietaire.raison_perte = raison;
    dernierProprietaire.duree_possession = diffDays; // Stocke la durée en jours
  }
  
  this.proprietaire_actuel = null;
  this.statut = 'DISPONIBLE'; // Repasse en disponible
};

module.exports = mongoose.model('Trophee', tropheeSchema);