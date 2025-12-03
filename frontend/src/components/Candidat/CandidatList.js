import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { debatService } from '../../services/api';
import { formaterStatut, formaterDateHeure } from '../../utils/formatters';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Loading, { LoadingCard } from '../Common/Loading';

const CandidatList = () => {
  const [filters, setFilters] = useState({
    categorie: '',
    statut: '' // Statut du débat
  });

  // Récupérer les débats (qui contiennent les participants)
  const { data, isLoading, isError, error } = useQuery(
    ['debats_candidats', filters],
    async () => {
      const response = await debatService.getAll({
        ...filters,
        limit: 50 // On veut voir un bon nombre de débats pour la vue d'ensemble
      });
      return response.data;
    },
    { keepPreviousData: true }
  );

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  if (isLoading) {
    return (
      <div className="container card-grid">
        <LoadingCard /><LoadingCard /><LoadingCard />
      </div>
    );
  }

  if (isError) {
    return <div className="alert alert-error">Erreur: {error.message}</div>;
  }

  const debats = data?.debats || [];

  // Grouper les débats par catégorie pour l'affichage
  const debatsParCategorie = debats.reduce((acc, debat) => {
    const cat = debat.categorie || 'Autre';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(debat);
    return acc;
  }, {});

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#2d5016', marginBottom: '10px' }}>Candidats par Débat 👥</h1>
        <p style={{ color: '#666' }}>Découvrez les participants organisés par débat et par catégorie.</p>
      </div>

      {/* Filtres */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div>
            <label htmlFor="categorie" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Catégorie</label>
            <select
              id="categorie"
              name="categorie"
              value={filters.categorie}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            >
              <option value="">Toutes les catégories</option>
              <option value="Primaire">Primaire</option>
              <option value="College/Lycee">Collège/Lycée</option>
              <option value="Universitaire">Universitaire</option>
            </select>
          </div>
          <div>
            <label htmlFor="statut" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Statut du Débat</label>
            <select
              id="statut"
              name="statut"
              value={filters.statut}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            >
              <option value="">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste groupée */}
      {Object.keys(debatsParCategorie).length > 0 ? (
        Object.entries(debatsParCategorie).map(([categorie, debatsList]) => (
          <div key={categorie} style={{ marginBottom: '40px' }}>
            <h2 style={{
              borderBottom: '2px solid #2d5016',
              paddingBottom: '10px',
              color: '#2d5016',
              marginBottom: '20px'
            }}>
              {categorie}
            </h2>

            <div className="debats-grid" style={{ display: 'grid', gap: '20px' }}>
              {debatsList.map(debat => (
                <div key={debat._id} style={{
                  backgroundColor: '#fff',
                  borderRadius: '10px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  borderLeft: `5px solid ${debat.statut === 'en_cours' ? '#007bff' : debat.statut === 'termine' ? '#28a745' : '#ffc107'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>{debat.theme_debat}</h3>
                    <span style={{ fontSize: '12px', color: '#666' }}>{formaterDateHeure(debat.date_debut)}</span>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: '#f0f0f0',
                      fontWeight: 'bold'
                    }}>
                      {formaterStatut(debat.statut)}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '10px', textTransform: 'uppercase' }}>Participants ({debat.participants_ids?.length || 0}/4)</h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                    {debat.participants_ids && debat.participants_ids.length > 0 ? (
                      debat.participants_ids.map(participant => (
                        <div key={participant._id} style={{
                          padding: '10px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '5px',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}>
                          <div style={{ width: '50px', height: '50px', marginBottom: '8px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#e0e0e0' }}>
                            <LazyLoadImage
                              alt={`${participant.prenom} ${participant.nom}`}
                              src={participant.photoUrl || `https://ui-avatars.com/api/?name=${participant.prenom}+${participant.nom}&background=random`}
                              effect="blur"
                              width="100%"
                              height="100%"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                          <div style={{ fontWeight: 'bold', color: '#2d5016', fontSize: '14px' }}>{participant.prenom} {participant.nom}</div>
                          {participant.scoreFinal > 0 && (
                            <div style={{ fontSize: '12px', color: '#666' }}>Score: {participant.scoreFinal}/20</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ color: '#999', fontStyle: 'italic', fontSize: '13px' }}>Aucun participant inscrit</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>Aucun débat trouvé avec ces critères.</p>
        </div>
      )}
    </div>
  );
};

export default CandidatList;