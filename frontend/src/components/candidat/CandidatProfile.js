import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { candidatService } from '../../services/api';
import { calculService } from '../../services/calculService';
import { formaterTelephone, formaterDate, formaterStatut } from '../../utils/formatters';
import Loading from '../Common/Loading';

const CandidatProfile = () => {
  const { id } = useParams();
  const [candidat, setCandidat] = useState(null);
  const [statistiques, setStatistiques] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profil');

  useEffect(() => {
    chargerCandidat();
  }, [id]);

  const chargerCandidat = async () => {
    try {
      setLoading(true);
      const [candidatResponse, statsResponse] = await Promise.all([
        candidatService.getById(id),
        candidatService.getStatistiques(id)
      ]);

      if (candidatResponse.data.success) {
        setCandidat(candidatResponse.data.candidat);
      }
      if (statsResponse.data.success) {
        setStatistiques(statsResponse.data.statistiques);
      }
    } catch (error) {
      console.error('Erreur chargement candidat:', error);
      alert('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Chargement du profil..." />;
  }

  if (!candidat) {
    return (
      <div className="container">
        <div className="error-state">
          <h2>Candidat non trouvé</h2>
          <p>Le candidat que vous recherchez n'existe pas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-large">
            {candidat.prenom[0]}{candidat.nom[0]}
          </div>
        </div>
        
        <div className="profile-info">
          <h1>{candidat.prenom} {candidat.nom}</h1>
          <p className="profile-subtitle">{candidat.nomEtablissement}</p>
          
          <div className="profile-badges">
            <span className="badge badge-primary">{candidat.categorie}</span>
            <span className={`badge ${
              candidat.statutAdministratif === 'ADMISSIBLE' ? 'badge-success' : 'badge-warning'
            }`}>
              {formaterStatut(candidat.statutAdministratif)}
            </span>
            {candidat.fraisInscriptionPayes && (
              <span className="badge badge-success">Frais payés</span>
            )}
          </div>
        </div>

        <div className="profile-stats-quick">
          <div className="stat-quick">
            <div className="stat-value">{calculService.formaterMontant(candidat.soldeActuel)}</div>
            <div className="stat-label">Solde actuel</div>
          </div>
          <div className="stat-quick">
            <div className="stat-value">{candidat.nombreVictoires}</div>
            <div className="stat-label">Victoires</div>
          </div>
          <div className="stat-quick">
            <div className="stat-value">{candidat.scoreFinal || 'N/A'}</div>
            <div className="stat-label">Score final</div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="profile-tabs">
        <button 
          className={activeTab === 'profil' ? 'active' : ''}
          onClick={() => setActiveTab('profil')}
        >
          📋 Profil
        </button>
        <button 
          className={activeTab === 'statistiques' ? 'active' : ''}
          onClick={() => setActiveTab('statistiques')}
        >
          📊 Statistiques
        </button>
        <button 
          className={activeTab === 'performances' ? 'active' : ''}
          onClick={() => setActiveTab('performances')}
        >
          🎯 Performances
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="profile-content">
        {activeTab === 'profil' && <ProfilTab candidat={candidat} />}
        {activeTab === 'statistiques' && <StatistiquesTab statistiques={statistiques} />}
        {activeTab === 'performances' && <PerformancesTab candidat={candidat} />}
      </div>
    </div>
  );
};

const ProfilTab = ({ candidat }) => {
  return (
    <div className="tab-content">
      <div className="info-grid">
        <div className="info-section">
          <h3>Informations Personnelles</h3>
          <div className="info-list">
            <div className="info-item">
              <strong>Email:</strong> {candidat.email}
            </div>
            <div className="info-item">
              <strong>Téléphone:</strong> {formaterTelephone(candidat.telephone)}
            </div>
            <div className="info-item">
              <strong>Date de naissance:</strong> {formaterDate(candidat.dateNaissance)}
            </div>
            <div className="info-item">
              <strong>Âge:</strong> {candidat.age} ans
            </div>
            <div className="info-item">
              <strong>Nationalité:</strong> {candidat.nationalite}
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Informations Scolaires</h3>
          <div className="info-list">
            <div className="info-item">
              <strong>Catégorie:</strong> {candidat.categorie}
            </div>
            <div className="info-item">
              <strong>Établissement:</strong> {candidat.nomEtablissement}
            </div>
            <div className="info-item">
              <strong>Date d'inscription:</strong> {formaterDate(candidat.dateInscription)}
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Scores</h3>
          <div className="scores-grid">
            <div className="score-item">
              <div className="score-label">Écrit</div>
              <div className="score-value">{candidat.scoreEcrit || 'N/A'}/20</div>
            </div>
            <div className="score-item">
              <div className="score-label">Oral</div>
              <div className="score-value">{candidat.scoreOral || 'N/A'}/20</div>
            </div>
            <div className="score-item">
              <div className="score-label">Final</div>
              <div className="score-value">{candidat.scoreFinal || 'N/A'}/20</div>
            </div>
          </div>
        </div>
      </div>

      {candidat.tropheeActuel && (
        <div className="trophee-section">
          <h3>🎯 Trophée Actuel</h3>
          <div className="trophee-card">
            <div className="trophee-info">
              <h4>{candidat.tropheeActuel.nom}</h4>
              <p>{candidat.tropheeActuel.description}</p>
              <div className="trophee-value">
                Valeur: {calculService.formaterMontant(candidat.tropheeActuel.valeur)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatistiquesTab = ({ statistiques }) => {
  if (!statistiques) {
    return (
      <div className="tab-content">
        <div className="empty-state">
          <p>Aucune statistique disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="stats-grid detailed">
        <div className="stat-card detailed">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{calculService.formaterMontant(statistiques.solde_actuel)}</div>
          <div className="stat-label">Solde actuel</div>
        </div>

        <div className="stat-card detailed">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{statistiques.nombre_victoires}</div>
          <div className="stat-label">Victoires</div>
        </div>

        <div className="stat-card detailed">
          <div className="stat-icon">📉</div>
          <div className="stat-value">{statistiques.nombre_defaites}</div>
          <div className="stat-label">Défaites</div>
        </div>

        <div className="stat-card detailed">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{statistiques.taux_victoire}%</div>
          <div className="stat-label">Taux de victoire</div>
        </div>

        <div className="stat-card detailed">
          <div className="stat-icon">💸</div>
          <div className="stat-value">{calculService.formaterMontant(statistiques.total_gains)}</div>
          <div className="stat-label">Total gains</div>
        </div>

        <div className="stat-card detailed">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{statistiques.total_debats}</div>
          <div className="stat-label">Total débats</div>
        </div>
      </div>

      <div className="progress-section">
        <h3>Progression</h3>
        <div className="progress-bars">
          <div className="progress-item">
            <div className="progress-label">
              <span>Taux de victoire</span>
              <span>{statistiques.taux_victoire}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${statistiques.taux_victoire}%` }}
              ></div>
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-label">
              <span>Score final moyen</span>
              <span>{statistiques.score_final}/20</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(statistiques.score_final / 20) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PerformancesTab = ({ candidat }) => {
  return (
    <div className="tab-content">
      <div className="performance-stats">
        <div className="performance-card">
          <h3>Derniers Débats</h3>
          <div className="debats-list">
            <div className="empty-state">
              <p>Historique des débats en cours de développement...</p>
            </div>
          </div>
        </div>

        <div className="performance-card">
          <h3>Objectifs</h3>
          <div className="objectifs-list">
            <div className="objectif-item">
              <div className="objectif-icon">🎯</div>
              <div className="objectif-content">
                <h4>Atteindre le top 10</h4>
                <p>Classement dans le top 10 de votre catégorie</p>
              </div>
            </div>
            
            <div className="objectif-item">
              <div className="objectif-icon">💰</div>
              <div className="objectif-content">
                <h4>Gagner 10,000 FCFA</h4>
                <p>Accumuler 10,000 FCFA de gains</p>
              </div>
            </div>
            
            <div className="objectif-item">
              <div className="objectif-icon">🏆</div>
              <div className="objectif-content">
                <h4>Remporter un trophée</h4>
                <p>Gagner et conserver un trophée</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidatProfile;