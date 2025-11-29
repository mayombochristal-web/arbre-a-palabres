// Service de calcul financier (version client - logique simple 25%/75% et vérification d'éligibilité)
export const calculService = {
  /**
   * Configuration des frais d'inscription par catégorie
   */
  FRAIS_INSCRIPTION: {
    'Primaire': 500,
    'College/Lycee': 1000, 
    'Universitaire': 2000
  },

  /**
   * Catégories basées sur l'âge
   */
  CATEGORIES_AGE: {
    'Primaire': { min: 10, max: 12 },
    'College/Lycee': { min: 13, max: 18 },
    'Universitaire': { min: 19, max: 40 }
  },

  /**
   * Calcule la répartition simple 25%/75%
   */
  calculerRepartitionSimple(cagnotteTotale) {
    const fraisOrganisation = Math.round(cagnotteTotale * 0.25); // 25%
    const gainVainqueur = Math.round(cagnotteTotale * 0.75); // 75%
    
    // Validation
    if (fraisOrganisation + gainVainqueur !== cagnotteTotale) {
      // console.warn('Incohérence dans le calcul de répartition simple'); // Warning commenté
    }
    
    return {
      fraisOrganisation,
      gainVainqueur,
      cagnotteTotale
    };
  },

  /**
   * Calcule l'âge à partir d'une date de naissance
   */
  calculerAge(dateNaissance) {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  },

  /**
   * Détermine la catégorie à partir de l'âge
   */
  determinerCategorie(age) {
    if (age >= this.CATEGORIES_AGE.Primaire.min && age <= this.CATEGORIES_AGE.Primaire.max) {
      return 'Primaire';
    } else if (age >= this.CATEGORIES_AGE['College/Lycee'].min && age <= this.CATEGORIES_AGE['College/Lycee'].max) {
      return 'College/Lycee';
    } else if (age >= this.CATEGORIES_AGE.Universitaire.min && age <= this.CATEGORIES_AGE.Universitaire.max) {
      return 'Universitaire';
    }
    return null; // Hors catégorie
  },

  /**
   * Vérifie l'éligibilité et retourne les informations
   */
  verifierEligibilite(dateNaissance, nationalite) {
    const age = this.calculerAge(dateNaissance);
    const categorie = this.determinerCategorie(age);
    
    return {
      estEligible: age >= 10 && age <= 40 && nationalite === 'Gabonaise' && categorie !== null,
      age,
      categorie,
      fraisInscription: categorie ? this.FRAIS_INSCRIPTION[categorie] : 0
    };
  },
  
  // NOTE: Les fonctions de formatage (Montant, Date) ont été déplacées vers formatters.js
  
  /**
   * Calcule le pourcentage de victoires
   */
  calculerTauxVictoire(victoires, defaites) {
    const total = victoires + defaites;
    if (total === 0) return 0;
    return Math.round((victoires / total) * 100);
  },

  /**
   * Calcule le score final
   */
  calculerScoreFinal(victoires, defaites, nulls, gains) {
    // Logique simplifiée: 10 points par victoire, -5 par défaite, +1 point par 100 FCFA gagnés
    const scoreBase = (victoires * 10) - (defaites * 5);
    const scoreGain = Math.floor(gains / 100);
    return scoreBase + scoreGain;
  },

  /**
   * Détermine la difficulté d'un débat (simple, peut être étendu)
   */
  determinerDifficulte(categorie, type) {
    if (type === 'trophee') return 'Expert (Trophée)';
    if (categorie === 'Universitaire') return 'Avancé';
    if (categorie === 'College/Lycee') return 'Intermédiaire';
    return 'Débutant';
  }
};