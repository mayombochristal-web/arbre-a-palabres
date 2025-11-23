const mongoose = require('mongoose');
const validator = require('validator');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['RETRAIT', 'GAIN_DEBAT', 'FRAIS_INSCRIPTION'],
    required: true
  },
  montant: {
    type: Number,
    required: true,
    min: 0
  },
  statut: {
    type: String,
    enum: ['EN_ATTENTE', 'VALIDEE', 'REJETEE', 'COMPLETEE'],
    default: 'EN_ATTENTE'
  },
  description: String,
  date: {
    type: Date,
    default: Date.now
  },
  reference: String
}, { _id: true });

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
  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email invalide']
  },
  telephone: {
    type: String,
    required: [true, 'Le téléphone est obligatoire'],
    unique: true,
    match: [/^(\+241|0)[0-9]{8}$/, 'Numéro de téléphone gabonais invalide']
  },
  nationalite: {
    type: String,
    required: true,
    default: 'Gabonaise',
    enum: ['Gabonaise']
  },
  
  // Scolarité et catégorie
  categorie: {
    type: String,
    required: true,
    enum: ['Primaire', 'College/Lycee', 'Universitaire']
  },
  nomEtablissement: {
    type: String,
    required: [true, 'Le nom de l\'établissement est obligatoire'],
    trim: true
  },
  noteSynthese: {
    type: Number,
    min: 0,
    max: 20,
    default: 0
  },
  
  // Documents
  fichierCarteEtudiant: {
    type: String,
    required: [true, 'La carte d\'étudiant est obligatoire']
  },
  fichierNotes: {
    type: String,
    required: [true, 'Le relevé de notes est obligatoire']
  },
  
  // Statut financier et administratif
  fraisInscriptionPayes: {
    type: Boolean,
    default: false
  },
  soldeActuel: {
    type: Number,
    default: 0,
    min: 0
  },
  statutAdministratif: {
    type: String,
    enum: ['PAIEMENT_EN_ATTENTE', 'ADMISSIBLE', 'ADMIS', 'ELIMINE', 'SUSPENDU'],
    default: 'PAIEMENT_EN_ATTENTE'
  },
  
  // Scores et évaluations
  scoreEcrit: {
    type: Number,
    min: 0,
    max: 20,
    default: 0
  },
  scoreOral: {
    type: Number,
    min: 0,
    max: 20,
    default: 0
  },
  scoreFinal: {
    type: Number,
    min: 0,
    max: 20,
    default: 0
  },
  
  // Statistiques de débats
  nombreVictoires: {
    type: Number,
    default: 0
  },
  nombreDefaites: {
    type: Number,
    default: 0
  },
  totalGains: {
    type: Number,
    default: 0
  },
  
  // Transactions
  transactions: [transactionSchema],
  
  // Trophées
  tropheeActuel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trophee',
    default: null
  },
  
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
candidatSchema.index({ email: 1 });
candidatSchema.index({ telephone: 1 });

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
         this.nationalite === 'Gabonaise' &&
         this.fraisInscriptionPayes &&
         this.statutAdministratif === 'ADMISSIBLE';
};

// Méthode statique pour trouver les candidats par catégorie
candidatSchema.statics.findByCategorie = function(categorie) {
  return this.find({ categorie, statutAdministratif: 'ADMISSIBLE' });
};

module.exports = mongoose.model('Candidat', candidatSchema);