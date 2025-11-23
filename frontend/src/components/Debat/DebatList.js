import React, { useState, useEffect } from 'react';
import { debatService } from '../../services/api';
import { calculService } from '../../services/calculService';
import { formaterStatut, formaterDateHeure } from '../../utils/formatters';
import Loading, { LoadingCard } from '../Common/Loading';

const DebatList = () => {
  const [debats, setDebats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    statut: '',
    categorie: '',
    type: ''
  });

  useEffect(() => {
    chargerDebats();
  }, [filters]);

  const chargerDebats = async () => {
    try {
      setLoading(true);
      const response = await debatService.getAll(filters);
      if (response.data.success) {
        setDebats(response.data.debats);
      }
    } catch (error) {
      console.error('Erreur chargement débats:', error);
      alert('Erreur lors du chargement des débats');
    } finally {
      setLoading(false);
    }
  };

  const getStatutBadgeClass = (statut) => {
    const classes = {
      'en_attente': 'badge-warning',
      'en_cours': 'badge-primary',
      'termine': 'badge-success',
      'annule': 'badge-error'
    };
    return classes[statut] || 'badge-primary';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card-grid">
          {[...Array(6)].map((_, index) => (
            <LoadingCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Liste des Débats</h1>
        <p>Découvrez tous les débats organisés sur la plateforme</p>
      </div>

      {/* Filtres */}
      <div className="filters-card">
        <h3>Filtres</h3>
        <div className="filters-row">
          <div className="filter-group">
            <label>Statut</label>
            <select 
              value={filters.statut}
              onChange={(e) => setFilters(prev => ({ ...prev, statut: e.target.value }))}
            >
              <option value="">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminés</option>
            </select>
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
            <label>Type</label>
            <select 
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">Tous types</option>
              <option value="standard">Standard</option>
              <option value="defi">Défi</option>
              <option value="tournoi">Tournoi</option>
            </select>
          </div>

          <button 
            className="btn-secondary"
            onClick={() => setFilters({ statut: '', categorie: '', type: '' })}
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Liste des débats */}
      {debats.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>Aucun débat trouvé</h3>
          <p>Aucun débat ne correspond à vos critères de recherche.</p>
        </div>
      ) : (
        <div className="debats-grid">
          {debats.map(debat => (
            <DebatCard key={debat._id} debat={debat} />
          ))}
        </div>
      )}
    </div>
  );
};

const DebatCard = ({ debat }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`debat-card ${debat.statut}`}>
      <div className="debat-header">
        <div className="debat-title">
          <h3>{debat.theme_debat}</h3>
          <div className="debat-meta">
            <span className="categorie-tag">{debat.categorie}</span>
            <span className="type-tag">{debat.type_debat}</span>
          </div>
        </div>
        <div className="debat-statut">
          <span className={`badge ${getStatutBadgeClass(debat.statut)}`}>
            {formaterStatut(debat.statut)}
          </span>
        </div>
      </div>

      <div className="debat-info">
        <div className="info-item">
          <span className="label">Cagnotte:</span>
          <span className="value">{calculService.formaterMontant(debat.cagnotte_totale)}</span>
        </div>
        <div className="info-item">
          <span className="label">Gain vainqueur:</span>
          <span className="value highlight">{calculService.formaterMontant(debat.gain_vainqueur)}</span>
        </div>
        <div className="info-item">
          <span className="label">Participants:</span>
          <span className="value">{debat.participants_ids?.length || 0}/4</span>
        </div>
        <div className="info-item">
          <span className="label">Date:</span>
          <span className="value">{formaterDateHeure(debat.date_debut)}</span>
        </div>
      </div>

      {debat.vainqueur_id && (
        <div className="vainqueur-section">
          <div className="vainqueur-label">🏆 Vainqueur</div>
          <div className="vainqueur-name">
            {debat.vainqueur_id.prenom} {debat.vainqueur_id.nom}
          </div>
        </div>
      )}

      <div className="debat-actions">
        <button 
          className="btn-secondary small"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Masquer' : 'Voir'} détails
        </button>
        
        {debat.statut === 'en_attente' && (
          <button className="btn-primary small">
            S'inscrire
          </button>
        )}
      </div>

      {showDetails && (
        <div className="debat-details">
          <h4>Participants</h4>
          <div className="participants-list">
            {debat.participants_ids?.map(participant => (
              <div key={participant._id} className="participant-item">
                <span className="participant-name">
                  {participant.prenom} {participant.nom}
                </span>
                <span className="participant-score">
                  Score: {participant.scoreFinal || 'N/A'}
                </span>
              </div>
            ))}
          </div>

          <div className="repartition-details">
            <h4>Répartition financière</h4>
            <div className="repartition-visuelle">
              <div className="portion frais" style={{ width: '25%' }}>
                <span>Frais org. (25%)</span>
                <span>{calculService.formaterMontant(debat.frais_organisation)}</span>
              </div>
              <div className="portion gain" style={{ width: '75%' }}>
                <span>Gain vainqueur (75%)</span>
                <span>{calculService.formaterMontant(debat.gain_vainqueur)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Fonction helper pour getStatutBadgeClass
const getStatutBadgeClass = (statut) => {
  const classes = {
    'en_attente': 'badge-warning',
    'en_cours': 'badge-primary',
    'termine': 'badge-success',
    'annule': 'badge-error'
  };
  return classes[statut] || 'badge-primary';
};

export default DebatList;