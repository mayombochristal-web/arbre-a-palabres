const mongoose = require('mongoose');

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
    required: true
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
    sparse: true
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
    enum: ['AIRTEL_MONEY', 'MOOV_MONEY', 'BANQUE', 'ESPECES'],
    default: null
  },
  
  numero_compte: String,
  nom_beneficiaire: String,
  
  // Suivi administratif
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
    required: true
  }
}, {
  timestamps: true
});

// Index pour les performances
transactionSchema.index({ candidat_id: 1, createdAt: -1 });
transactionSchema.index({ type: 1, statut: 1 });
transactionSchema.index({ reference: 1 });
transactionSchema.index({ debat_id: 1 });

// Middleware pour générer une référence avant sauvegarde
transactionSchema.pre('save', async function(next) {
  if (this.isNew && !this.reference) {
    const prefix = this.type === 'RETRAIT' ? 'RET' : 
                  this.type === 'FRAIS_INSCRIPTION' ? 'FRA' : 'TRX';
    
    const count = await mongoose.model('Transaction').countDocuments();
    this.reference = `${prefix}${Date.now()}${count + 1}`;
  }
  next();
});

// Méthode pour vérifier si une transaction peut être validée
transactionSchema.methods.peutValider = function() {
  return this.statut === 'EN_ATTENTE';
};

// Méthode pour compléter un retrait
transactionSchema.methods.completerRetrait = function(adminId) {
  if (this.type !== 'RETRAIT') {
    throw new Error('Seuls les retraits peuvent être complétés');
  }
  
  this.statut = 'COMPLETEE';
  this.valide_par = adminId;
  this.date_validation = new Date();
};

module.exports = mongoose.model('Transaction', transactionSchema);