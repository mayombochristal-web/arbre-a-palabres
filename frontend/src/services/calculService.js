// Service de calcul financier (version client - logique simple 25%/75%)
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
      console.warn('Incohérence dans le calcul de répartition simple');
    }
    
    return {
      fraisOrganisation,
      gainVainqueur,
      cagnotteTotale,
      tauxFrais: 0.25,
      tauxGain: 0.75
    };
  },

  /**
   * Calcule les gains pour un débat standard
   */
  calculerGainsDebat(categorie, nombreParticipants = 4) {
    const fraisUnitaire = this.FRAIS_INSCRIPTION[categorie];
    const cagnotteTotale = fraisUnitaire * nombreParticipants;
    return this.calculerRepartitionSimple(cagnotteTotale);
  },

  /**
   * Détermine la catégorie basée sur l'âge
   */
  determinerCategorie(age) {
    for (const [categorie, limites] of Object.entries(this.CATEGORIES_AGE)) {
      if (age >= limites.min && age <= limites.max) {
        return categorie;
      }
    }
    return null;
  },

  /**
   * Calcule l'âge à partir de la date de naissance
   */
  calculerAge(dateNaissance) {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  },

  /**
   * Vérifie l'éligibilité d'un candidat
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

  /**
   * Formate un montant en FCFA
   */
  formaterMontant(montant) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(montant);
  },

  /**
   * Formate une date
   */
  formaterDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * Formate une date avec l'heure
   */
  formaterDateHeure(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Calcule le pourcentage de victoires
   */
  calculerTauxVictoire(victoires, defaites) {
    const total = victoires + defaites;
    return total > 0 ? ((victoires / total) * 100).toFixed(1) : 0;
  },

  /**
   * Génère des couleurs pour les graphiques
   */
  genererCouleurs(nombre) {
    const couleurs = [
      '#2e7d32', '#4caf50', '#8bc34a', '#cddc39',
      '#ff9800', '#ff5722', '#795548', '#607d8b',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688'
    ];
    
    return couleurs.slice(0, nombre);
  }
};