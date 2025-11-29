import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueries } from 'react-query'; // Import de useQueries pour les appels multiples
import { candidatService } from '../../services/api';
import { calculService } from '../../services/calculService';
import { formaterTelephone, formaterDate, formaterStatut } from '../../utils/formatters';
import Loading from '../Common/Loading';

const CandidatProfile = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('profil');

  // Utilisation de useQueries pour charger le candidat et ses stats en parallèle
  const results = useQueries([
    {
      queryKey: ['candidat', id],
      queryFn: async () => {
        const response = await candidatService.getById(id);
        if (response.data.success) {
          return response.data.candidat;
        }
        throw new Error('Candidat non trouvé');
      },
      enabled: !!id // N'exécuter que si l'ID est présent
    },
    {
      queryKey: ['candidatStats', id],
      queryFn: async () => {
        const response = await candidatService.getStatistiques(id);
        if (response.data.success) {
          return response.data.statistiques;
        }
        return null; // Pas obligatoire, on gère si les stats ne sont pas trouvées
      },
      enabled: !!id
    }
  ]);
  
  const candidatQuery = results[0];
  const statsQuery = results[1];

  const isLoading = candidatQuery.isLoading || statsQuery.isLoading;
  const isError = candidatQuery.isError; // Le cas où le candidat n'existe pas

  if (isLoading) {
    return <Loading message={`Chargement du profil du candidat ${id}...`} />;
  }

  if (isError) {
    // CORRECTION: Remplacer l'alerte par un message d'erreur dans l'UI
    return <div className="container alert alert-error mt-5">Erreur: Impossible de charger le profil du candidat.</div>;
  }

  const candidat = candidatQuery.data;
  const statistiques = statsQuery.data;

  // Si le candidat est null (erreur 404/non trouvé)
  if (!candidat) {
     return <div className="container alert alert-warning mt-5">Candidat non trouvé ou ID invalide.</div>;
  }
  
  // Reste du composant (inchangé, utilise maintenant 'candidat' et 'statistiques' directement)
  /* ... */
};

export default CandidatProfile;