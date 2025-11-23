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
  
  // Formater selon le format gabonais
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

  if (days > 0) {
    return `${days} jour${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} heure${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return `${seconds} seconde${seconds > 1 ? 's' : ''}`;
  }
}

/**
 * Formate un score sur 20
 */
export function formaterScore(score) {
  if (score === null || score === undefined) return 'N/A';
  return score.toFixed(2);
}

/**
 * Formate un statut en texte lisible
 */
export function formaterStatut(statut) {
  const statuts = {
    'PAIEMENT_EN_ATTENTE': 'Paiement en attente',
    'ADMISSIBLE': 'Admissible',
    'ADMIS': 'Admis',
    'ELIMINE': 'Éliminé',
    'SUSPENDU': 'Suspendu',
    'en_attente': 'En attente',
    'en_cours': 'En cours',
    'termine': 'Terminé',
    'annule': 'Annulé',
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
 * Valide un numéro de téléphone gabonais
 */
export function validerTelephone(telephone) {
  const regex = /^(\+241|0)[0-9]{8}$/;
  return regex.test(telephone.replace(/\s/g, ''));
}

export default {
  formaterTelephone,
  formaterNom,
  formaterDuree,
  formaterScore,
  formaterStatut,
  formaterTypeTransaction,
  genererInitiales,
  tronquerTexte,
  validerEmail,
  validerTelephone
};