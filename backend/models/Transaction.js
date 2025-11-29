const mongoose = require('mongoose');
const crypto = require('crypto'); // NOUVEAU

const transactionSchema = new mongoose.Schema({
  candidat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidat',
    required: true
  },
  
  type: {
    type: String,
    required: true,
    enum: [
      'FRAIS_INSCRIPTION',
      'GAIN_DEBAT', 
      'RETRAIT',
      'REMBOURSEMENT',
      'PENALITE'
    ]
  },
  
  montant: {
    type: Number,
    required: true,
    min: 0
  },
  
  statut: {
    type: String,
    enum: ['EN_ATTENTE', 'VALIDEE', 'REJETEE', 'COMPLETEE', 'ANNULEE'],
    default: 'EN_ATTENTE'
  },
  
  description: {
    type: String,
    required: true
  },
  
  reference: {
    type: String,
    unique: true,
    sparse: true // Permet plusieurs documents avec 'null' mais un seul pour chaque valeur réelle
  },
  
  // Pour les gains de débats
  debat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Debat',
    default: null
  },
  
  // Pour les retraits
  methode_retrait: {
    type: String,
    enum: ['AIRTEL_MONEY', 'MOMO', 'VIREMENT_BANCAIRE', 'CASH'],
    default: null
  },
  numero_compte: String,
  nom_beneficiaire: String,
  
  // Champs administratifs
  valide_par: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  date_validation: {
    type: Date,
    default: null
  },
  
  raison_rejet: String,
  
  preuve_paiement: String,
  
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Rendu facultatif car les transactions d'inscription/retrait sont initiées par le candidat/système
  }
}, {
  timestamps: true
});

// Middleware pour générer une référence avant sauvegarde (CORRECTION C1)
transactionSchema.pre('save', async function(next) {
  if (this.isNew && !this.reference) {
    const prefix = this.type === 'RETRAIT' ? 'RET' : 
                  this.type === 'FRAIS_INSCRIPTION' ? 'FRA' : 'TRX';
    
    // Génération d'un suffixe cryptographique aléatoire de 4 octets (8 caractères hex)
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    
    // La référence combine un préfixe, le timestamp et un identifiant aléatoire
    // pour minimiser les collisions sans utiliser de transactions coûteuses.
    this.reference = `${prefix}_${Date.now()}_${randomSuffix}`.toUpperCase();
  }
  next();
});

// Méthode pour vérifier si une transaction peut être validée
transactionSchema.methods.peutValider = function() {
  return this.statut === 'EN_ATTENTE';
};

// Méthode pour vérifier si une transaction est complète
transactionSchema.methods.estComplete = function() {
  return this.statut === 'COMPLETEE' || this.statut === 'VALIDEE';
};

module.exports = mongoose.model('Transaction', transactionSchema);