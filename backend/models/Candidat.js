const mongoose = require('mongoose');
const validator = require('validator');

// CORRECTION A1: Suppression du schéma de transaction redondant.
// Le schéma de transaction complet est défini dans Transaction.js

const candidatSchema = new mongoose.Schema({
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
  dateNaissance: {
    type: Date,
    required: [true, 'La date de naissance est obligatoire']
  },
  
  // Contacts
  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Veuillez fournir un email valide']
  },
  telephone: {
    type: String,
    required: [true, 'Le numéro de téléphone est obligatoire'],
    unique: true,
    validate: {
      validator: function(v) {
        // Valide un numéro de téléphone gabonais (exemple) ou autre format international
        return /^\+?[0-9]{8,15}$/.test(v); 
      },
      message: props => `${props.value} n'est pas un numéro de téléphone valide!`
    }
  },
  
  // Scolarité/Administration
  nationalite: {
    type: String,
    required: [true, 'La nationalité est obligatoire'],
    trim: true
  },
  nomEtablissement: {
    type: String,
    required: [true, 'Le nom de l\'établissement est obligatoire'],
    trim: true
  },
  
  // Documents
  urlCarteEtudiant: String,
  urlNotes: String,
  
  // Statut
  statutAdministratif: {
    type: String,
    enum: ['CANDIDAT', 'PAIEMENT_EN_ATTENTE', 'ADMISSIBLE', 'EXCLU'],
    default: 'CANDIDAT'
  },
  
  categorie: {
    type: String,
    enum: ['Primaire', 'College/Lycee', 'Universitaire', 'Inconnu'],
    default: 'Inconnu'
  },
  
  fraisInscriptionPayes: {
    type: Boolean,
    default: false
  },
  
  // Métriques du débat
  scoreFinal: {
    type: Number,
    default: 0
  },
  nombreVictoires: {
    type: Number,
    default: 0,
    min: 0
  },
  nombreDefaites: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Finances
  soldeActuel: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Trophée Actuel
  tropheeActuel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trophee',
    default: null
  },
  
  // Date d'inscription
  dateInscription: {
    type: Date,
    default: Date.now
  },
  
  // Champs calculés
  age: {
    type: Number,
    min: 10,
    max: 40
  }
}, {
  timestamps: true
});

// Index pour les performances
candidatSchema.index({ categorie: 1, statutAdministratif: 1 });
candidatSchema.index({ scoreFinal: -1 });
candidatSchema.index({ soldeActuel: -1 });
candidatSchema.index({ email: 1 }, { unique: true }); // Assurer l'unicité
candidatSchema.index({ telephone: 1 }, { unique: true }); // Assurer l'unicité

// Middleware pour calculer l'âge avant sauvegarde
candidatSchema.pre('save', function(next) {
  if (this.dateNaissance) {
    const today = new Date();
    const birthDate = new Date(this.dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    this.age = age;
  }
  next();
});

// Méthode pour vérifier l'éligibilité
candidatSchema.methods.estEligible = function() {
  return this.age >= 10 && 
         this.age <= 40 &&
         this.statutAdministratif === 'ADMISSIBLE' &&
         this.fraisInscriptionPayes === true;
};

// Méthode pour obtenir le nombre de débats total
candidatSchema.methods.nombreDebatsTotal = function() {
    return this.nombreVictoires + this.nombreDefaites;
};

module.exports = mongoose.model('Candidat', candidatSchema);