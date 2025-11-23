import React, { useState, useEffect } from 'react';
import { candidatService } from '../../services/api';
import { calculService } from '../../services/calculService';
import { formaterStatut, genererInitiales } from '../../utils/formatters';
import Loading, { LoadingCard } from '../Common/Loading';

const CandidatList = () => {
  const [candidats, setCandidats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    categorie: '',
    statut: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    chargerCandidats();
  }, [filters, pagination.page]);

  const chargerCandidats = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };
      
      const response = await candidatService.getAll(params);
      if (response.data.success) {
        setCandidats(response.data.candidats);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          totalPages: response.data.totalPages
        }));
      }
    } catch (error) {
      console.error('Erreur chargement candidats:', error);
      alert('Erreur lors du chargement des candidats');
    } finally {
      setLoading(false);
    }
  };

  const getStatutBadgeClass = (statut) => {
    const classes = {
      'PAIEMENT_EN_ATTENTE': 'badge-warning',
      'ADMISSIBLE': 'badge-success',
      'ADMIS': 'badge-primary',
      'ELIMINE': 'badge-error',
      'SUSPENDU': 'badge-error'
    };
    return classes[statut] || 'badge-primary';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    chargerCandidats();
  };

  if (loading && candidats.length === 0) {
    return (
      <div className="container">
        <div className="card-grid">
          {[...Array(8)].map((_, index) => (
            <LoadingCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Liste des Candidats</h1>
        <p>Découvrez tous les candidats inscrits sur la plateforme</p>
      </div>

      {/* Filtres et recherche */}
      <div className="filters-card">
        <form onSubmit={handleSearch}>
          <div className="filters-row">
            <div className="filter-group">
              <label>Recherche</label>
              <input
                type="text"
                placeholder="Nom, prénom, email..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>

            <div className="filter-group">
              <label>Catégorie</label>
              <select 
                value={filters.categorie}
                onChange={(e) => setFilters(prev => ({ ...prev, categorie: e.target.value }))}
              >
                <option value="">Toutes catégories</option>
                <option value="Primaire">Primaire</option>
                <option value="College/Lycee">Collège/Lycée</option>
                <option value="Universitaire">Universitaire</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Statut</label>
              <select 
                value={filters.statut}
                onChange={(e) => setFilters(prev => ({ ...prev, statut: e.target.value }))}
              >
                <option value="">Tous statuts</option>
                <option value="PAIEMENT_EN_ATTENTE">Paiement en attente</option>
                <option value="ADMISSIBLE">Admissible</option>
                <option value="ADMIS">Admis</option>
                <option value="ELIMINE">Éliminé</option>
              </select>
            </div>

            <button type="submit" className="btn-primary">
              Appliquer
            </button>

            <button 
              type="button"
              className="btn-secondary"
              onClick={() => {
                setFilters({ search: '', categorie: '', statut: '' });
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              Réinitialiser
            </button>
          </div>
        </form>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{pagination.total}</div>
          <div className="stat-label">Candidats total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {candidats.filter(c => c.statutAdministratif === 'ADMISSIBLE').length}
          </div>
          <div className="stat-label">Candidats admissibles</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {candidats.filter(c => c.fraisInscriptionPayes).length}
          </div>
          <div className="stat-label">Frais payés</div>
        </div>
      </div>

      {/* Liste des candidats */}
      {candidats.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>Aucun candidat trouvé</h3>
          <p>Aucun candidat ne correspond à vos critères de recherche.</p>
        </div>
      ) : (
        <>
          <div className="candidats-grid">
            {candidats.map(candidat => (
              <CandidatCard key={candidat._id} candidat={candidat} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                ← Précédent
              </button>
              
              <div className="pagination-info">
                Page {pagination.page} sur {pagination.totalPages}
              </div>
              
              <button 
                className="pagination-btn"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const CandidatCard = ({ candidat }) => {
  const [showDetails, setShowDetails] = useState(false);

  const tauxVictoire = calculService.calculerTauxVictoire(
    candidat.nombreVictoires, 
    candidat.nombreDefaites
  );

  return (
    <div className="candidat-card">
      <div className="candidat-header">
        <div className="candidat-avatar">
          {genererInitiales(`${candidat.prenom} ${candidat.nom}`)}
        </div>
        
        <div className="candidat-infos">
          <h3 className="candidat-nom">
            {candidat.prenom} {candidat.nom}
          </h3>
          <p className="candidat-email">{candidat.email}</p>
        </div>
      </div>

      <div className="candidat-stats">
        <div className="stat-row">
          <span className="stat-label">Catégorie:</span>
          <span className="stat-value">{candidat.categorie}</span>
        </div>
        
        <div className="stat-row">
          <span className="stat-label">Établissement:</span>
          <span className="stat-value">{candidat.nomEtablissement}</span>
        </div>
        
        <div className="stat-row">
          <span className="stat-label">Solde:</span>
          <span className="stat-value highlight">
            {calculService.formaterMontant(candidat.soldeActuel)}
          </span>
        </div>
      </div>

      <div className="candidat-performance">
        <div className="performance-item">
          <div className="performance-value">{candidat.nombreVictoires}</div>
          <div className="performance-label">Victoires</div>
        </div>
        
        <div className="performance-item">
          <div className="performance-value">{candidat.nombreDefaites}</div>
          <div className="performance-label">Défaites</div>
        </div>
        
        <div className="performance-item">
          <div className="performance-value">{tauxVictoire}%</div>
          <div className="performance-label">Taux victoire</div>
        </div>
      </div>

      <div className="candidat-footer">
        <div className="candidat-statut">
          <span className={`badge ${getStatutBadgeClass(candidat.statutAdministratif)}`}>
            {formaterStatut(candidat.statutAdministratif)}
          </span>
          <span className={`badge ${candidat.fraisInscriptionPayes ? 'badge-success' : 'badge-warning'}`}>
            {candidat.fraisInscriptionPayes ? 'Frais payés' : 'Frais en attente'}
          </span>
        </div>

        <button 
          className="btn-secondary small"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Masquer' : 'Détails'}
        </button>
      </div>

      {showDetails && (
        <div className="candidat-details">
          <div className="detail-section">
            <h4>Informations détaillées</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Téléphone:</strong> {candidat.telephone}
              </div>
              <div className="detail-item">
                <strong>Score final:</strong> {candidat.scoreFinal || 'N/A'}
              </div>
              <div className="detail-item">
                <strong>Date d'inscription:</strong> {calculService.formaterDate(candidat.dateInscription)}
              </div>
              <div className="detail-item">
                <strong>Total gains:</strong> {calculService.formaterMontant(candidat.totalGains || 0)}
              </div>
            </div>
          </div>

          {candidat.tropheeActuel && (
            <div className="trophee-section">
              <h4>🎯 Trophée actuel</h4>
              <div className="trophee-info">
                <strong>{candidat.tropheeActuel.nom}</strong>
                <span>Valeur: {calculService.formaterMontant(candidat.tropheeActuel.valeur)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Fonction helper pour getStatutBadgeClass
const getStatutBadgeClass = (statut) => {
  const classes = {
    'PAIEMENT_EN_ATTENTE': 'badge-warning',
    'ADMISSIBLE': 'badge-success',
    'ADMIS': 'badge-primary',
    'ELIMINE': 'badge-error',
    'SUSPENDU': 'badge-error'
  };
  return classes[statut] || 'badge-primary';
};

export default CandidatList;