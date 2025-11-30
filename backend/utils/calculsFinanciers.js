// =======================================================
// backend/utils/calculsFinanciers.js
// Contient les logiques de calcul et les données statiques
// =======================================================

// Définitions des catégories, âges et frais
const CATEGORIES_AGE = {
  'Primaire': { min: 10, max: 12 },
  'College/Lycee': { min: 13, max: 18 },
  'Universitaire': { min: 19, max: 40 }
};

const FRAIS_INSCRIPTION = {
  'Primaire': 500,
  'College/Lycee': 1000,
  'Universitaire': 2000,
  'Entrepreneur': 5000
};

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
 * Détermine la catégorie et les frais d'inscription basés sur l'âge
 */
function determinerCategorieEtFrais(dateNaissance, typeCandidat = null) {
  const age = calculerAge(dateNaissance);

  // Si le type est explicitement Entrepreneur, on ignore l'âge pour la catégorie
  if (typeCandidat === 'Entrepreneur') {
    return {
      categorie: 'Entrepreneur',
      fraisInscription: FRAIS_INSCRIPTION['Entrepreneur'],
      age
    };
  }

  if (age < 10) {
    throw new Error('Âge minimum requis non atteint');
  }
  if (age > 40) {
    throw new Error('Âge maximum dépassé');
  }

  for (const [categorie, limites] of Object.entries(CATEGORIES_AGE)) {
    if (age >= limites.min && age <= limites.max) {
      return {
        categorie,
        fraisInscription: FRAIS_INSCRIPTION[categorie],
        age
      };
    }
  }

  throw new Error('Erreur interne de détermination de catégorie.');
}

/**
 * Répartition SIMPLE 25%/75% de la cagnotte
 */
function calculerRepartitionSimple(cagnotteTotale) {
  const fraisOrganisation = Math.round(cagnotteTotale * 0.25); // 25%
  const gainVainqueur = Math.round(cagnotteTotale * 0.75); // 75%

  // Part du Juge Administratif (10% des frais d'organisation)
  const partJugeAdmin = Math.round(fraisOrganisation * 0.10);
  const resteOrganisation = fraisOrganisation - partJugeAdmin;

  if (fraisOrganisation + gainVainqueur !== cagnotteTotale) {
    const difference = cagnotteTotale - (fraisOrganisation + gainVainqueur);
    const gainAjuste = gainVainqueur + difference;

    return {
      fraisOrganisation,
      partJugeAdmin,
      resteOrganisation,
      gainVainqueur: gainAjuste,
      cagnotteTotale,
      tauxFrais: 0.25,
      tauxGain: 0.75
    };
  }

  return {
    fraisOrganisation,
    partJugeAdmin,
    resteOrganisation,
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
  if (!participants || participants.length !== 4) {
    throw new Error('Un débat doit avoir exactement 4 participants');
  }

  const categorie = participants[0].categorie;
  if (!participants.every(p => p.categorie === categorie)) {
    throw new Error('Tous les participants doivent être de la même catégorie');
  }

  const fraisUnitaire = FRAIS_INSCRIPTION[categorie];
  const cagnotteTotale = fraisUnitaire * 4;
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
  const { dateNaissance, nationalite, nomEtablissement, typeCandidat } = donneesCandidat;

  if (nationalite !== "Gabonaise") {
    throw new Error('La nationalité gabonaise est requise');
  }

  if (!nomEtablissement) {
    throw new Error("Le nom de l'établissement est requis");
  }

  // Suppression de la vérification des fichiers

  const { categorie, fraisInscription, age } = determinerCategorieEtFrais(dateNaissance, typeCandidat);

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

/**
 * Crée un débat de défi avec mise en jeu des gains
 */
function creerDebatDefi(participants, miseUnitaire, theme) {
  if (!participants || participants.length !== 4) {
    throw new Error('Un débat doit avoir exactement 4 participants');
  }

  if (miseUnitaire <= 0) {
    throw new Error('La mise unitaire doit être positive');
  }

  const participantsInsuffisants = participants.filter(p => p.soldeActuel < miseUnitaire);
  if (participantsInsuffisants.length > 0) {
    const noms = participantsInsuffisants.map(p => `${p.prenom} ${p.nom}`).join(', ');
    throw new Error(`Solde insuffisant pour: ${noms}`);
  }

  const categorie = participants[0].categorie;
  if (!participants.every(p => p.categorie === categorie)) {
    throw new Error('Tous les participants doivent être de la même catégorie');
  }

  const cagnotteTotale = miseUnitaire * 4;
  const repartition = calculerRepartitionSimple(cagnotteTotale);

  return {
    theme_debat: theme,
    participants_ids: participants.map(p => p._id),
    categorie: categorie,
    type_debat: 'defi',
    cagnotte_totale: repartition.cagnotteTotale,
    frais_organisation: repartition.fraisOrganisation,
    gain_vainqueur: repartition.gainVainqueur,
    source_financement: 'Mise en Jeu',
    frais_unitaire: miseUnitaire,
    statut: 'en_attente'
  };
}

module.exports = {
  FRAIS_INSCRIPTION,
  CATEGORIES_AGE,
  determinerCategorieEtFrais,
  calculerRepartitionSimple,
  organiserNouveauDebatSimple,
  soumettreCandidature,
  calculerGainsDefi,
  creerDebatDefi
};