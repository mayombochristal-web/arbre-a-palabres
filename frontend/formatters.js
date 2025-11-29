/**
 * Utilitaires de formatage pour l'application
 */

/**
 * Formate un numéro de téléphone gabonais
 */
export function formaterTelephone(telephone) {
  if (!telephone) return '';
  
  // Supprimer tous les caractères non numériques
  const numeros = telephone.replace(/\D/g, '');
  
  // Formater selon le format gabonais (simplifié)
  if (numeros.startsWith('241')) {
    return `+241 ${numeros.slice(3, 5)} ${numeros.slice(5, 8)} ${numeros.slice(8)}`;
  } else if (numeros.startsWith('0')) {
    return `+241 ${numeros.slice(1, 3)} ${numeros.slice(3, 6)} ${numeros.slice(6)}`;
  } else {
    return telephone;
  }
}

/**
 * Formate un nom avec première lettre en majuscule
 */
export function formaterNom(nom) {
  if (!nom) return '';
  return nom.split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formate une durée en jours, heures, minutes
 */
export function formaterDuree(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}j ${hours % 24}h`;
  if (hours > 0) return `${hours % 24}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes % 60}m ${seconds % 60}s`;
  return `${seconds % 60}s`;
}

/**
 * Formate un montant en FCFA (Déplacé depuis calculService.js)
 */
export function formaterMontant(montant) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(montant);
}

/**
 * Formate une date (Déplacé depuis calculService.js)
 */
export function formaterDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formate une date avec l'heure (Déplacé depuis calculService.js)
 */
export function formaterDateHeure(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formate le statut d'un candidat ou d'un débat
 */
export function formaterStatut(statut) {
  if (!statut) return 'Inconnu';
  const statuts = {
    'PAIEMENT_EN_ATTENTE': 'Paiement en attente',
    'ADMISSIBLE': 'Admissible',
    'ADMIS': 'Admis',
    'ELIMINE': 'Éliminé',
    'en_attente': 'En attente',
    'en_cours': 'En cours',
    'termine': 'Terminé',
    'annule': 'Annulé'
  };
  
  return statuts[statut.toUpperCase()] || statut;
}

/**
 * Formate le statut de transaction
 */
export function formaterStatutTransaction(statut) {
  const statuts = {
    'EN_ATTENTE': 'En attente',
    'VALIDEE': 'Validée',
    'REJETEE': 'Rejetée',
    'COMPLETEE': 'Complétée'
  };
  
  return statuts[statut] || statut;
}

/**
 * Formate le type de transaction
 */
export function formaterTypeTransaction(type) {
  const types = {
    'FRAIS_INSCRIPTION': 'Frais d\'inscription',
    'GAIN_DEBAT': 'Gain de débat',
    'RETRAIT': 'Retrait',
    'REMBOURSEMENT': 'Remboursement',
    'PENALITE': 'Pénalité'
  };
  
  return types[type] || type;
}

/**
 * Génère des initiales à partir d'un nom complet
 */
export function genererInitiales(nomComplet) {
  if (!nomComplet) return '';
  
  return nomComplet
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

/**
 * Tronque un texte avec ellipse
 */
export function tronquerTexte(texte, longueurMax = 50) {
  if (!texte) return '';
  if (texte.length <= longueurMax) return texte;
  
  return texte.substring(0, longueurMax) + '...';
}

/**
 * Valide un email
 */
export function validerEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valide un téléphone (format gabonais)
 */
export function validerTelephone(telephone) {
  // Supprimer tous les caractères non numériques
  const numeros = telephone.replace(/\D/g, '');
  // Vérification simple: 8 à 11 chiffres
  return numeros.length >= 8 && numeros.length <= 11;
}

/**
 * Formate le score d'un candidat
 */
export function formaterScore(score) {
  return score !== undefined && score !== null ? score.toLocaleString('fr-FR') : 'N/A';
}