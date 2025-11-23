// Configuration des frais d'inscription par catégorie
const FRAIS_INSCRIPTION = {
  'Primaire': 500,
  'College/Lycee': 1000, 
  'Universitaire': 2000
};

// Catégories basées sur l'âge
const CATEGORIES_AGE = {
  'Primaire': { min: 10, max: 12 },
  'College/Lycee': { min: 13, max: 18 },
  'Universitaire': { min: 19, max: 40 }
};

/**
 * Détermine la catégorie et les frais d'inscription basés sur l'âge
 */
function determinerCategorieEtFrais(dateNaissance) {
  const age = calculerAge(dateNaissance);
  
  for (const [categorie, limites] of Object.entries(CATEGORIES_AGE)) {
    if (age >= limites.min && age <= limites.max) {
      return {
        categorie,
        fraisInscription: FRAIS_INSCRIPTION[categorie],
        age
      };
    }
  }
  
  throw new Error('Âge hors limites (10-40 ans)');
}

/**
 * Calcule l'âge à partir de la date de naissance
 */
function calculerAge(dateNaissance) {
  const today = new Date();
  const birthDate = new Date(dateNaissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Répartition SIMPLE 25%/75% de la cagnotte
 */
function calculerRepartitionSimple(cagnotteTotale) {
  const fraisOrganisation = Math.round(cagnotteTotale * 0.25); // 25%
  const gainVainqueur = Math.round(cagnotteTotale * 0.75); // 75%
  
  // Validation
  if (fraisOrganisation + gainVainqueur !== cagnotteTotale) {
    throw new Error('Incohérence dans le calcul de répartition simple');
  }
  
  return {
    fraisOrganisation,
    gainVainqueur,
    cagnotteTotale,
    tauxFrais: 0.25,
    tauxGain: 0.75
  };
}

/**
 * Organise un nouveau débat avec répartition simple 25%/75%
 */
function organiserNouveauDebatSimple(participants, theme) {
  // Validation
  if (!participants || participants.length !== 4) {
    throw new Error('Un débat doit avoir exactement 4 participants');
  }
  
  // Vérification que tous les participants ont la même catégorie
  const categorie = participants[0].categorie;
  if (!participants.every(p => p.categorie === categorie)) {
    throw new Error('Tous les participants doivent être de la même catégorie');
  }
  
  // Vérification que tous les participants sont admissibles
  if (!participants.every(p => p.statutAdministratif === 'ADMISSIBLE' && p.fraisInscriptionPayes)) {
    throw new Error('Tous les participants doivent être admissibles avec frais payés');
  }
  
  // Calcul de la cagnotte (frais unitaire × 4 participants)
  const fraisUnitaire = FRAIS_INSCRIPTION[categorie];
  const cagnotteTotale = fraisUnitaire * 4;
  
  // Calcul de la répartition simple
  const repartition = calculerRepartitionSimple(cagnotteTotale);
  
  return {
    theme_debat: theme,
    participants_ids: participants.map(p => p._id),
    categorie: categorie,
    cagnotte_totale: repartition.cagnotteTotale,
    frais_organisation: repartition.fraisOrganisation,
    gain_vainqueur: repartition.gainVainqueur,
    source_financement: 'Candidats',
    type_debat: 'standard',
    frais_unitaire: fraisUnitaire,
    statut: 'en_attente'
  };
}

/**
 * Soumission de candidature avec vérification des documents
 */
function soumettreCandidature(donneesCandidat) {
  const { dateNaissance, nationalite, nomEtablissement, fichiers } = donneesCandidat;
  
  // Vérification de l'éligibilité
  if (nationalite !== "Gabonaise") {
    throw new Error('La nationalité gabonaise est requise');
  }
  
  if (!nomEtablissement) {
    throw new Error("Le nom de l'établissement est requis");
  }
  
  if (!fichiers?.carteEtudiant || !fichiers?.notes) {
    throw new Error('Les documents (carte étudiante et notes) sont requis');
  }
  
  // Détermination de la catégorie et des frais
  const { categorie, fraisInscription, age } = determinerCategorieEtFrais(dateNaissance);
  
  return {
    categorie,
    fraisInscription,
    age,
    statutAdministratif: 'PAIEMENT_EN_ATTENTE',
    message: `Inscription enregistrée. Veuillez payer ${fraisInscription} FCFA sur Airtel Money: +24177765496.`
  };
}

/**
 * Calcule les gains pour un débat de défi
 */
function calculerGainsDefi(montantMise, nombreParticipants = 4) {
  const cagnotteTotale = montantMise * nombreParticipants;
  return calculerRepartitionSimple(cagnotteTotale);
}

module.exports = {
  FRAIS_INSCRIPTION,
  CATEGORIES_AGE,
  determinerCategorieEtFrais,
  calculerRepartitionSimple,
  organiserNouveauDebatSimple,
  soumettreCandidature,
  calculerGainsDefi
};