import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { debatService, candidatService } from '../../services/api';
import { calculService } from '../../services/calculService';
import Loading from '../Common/Loading';

const AdminPanel = () => {
  const { user } = useAuth();
  const [statistiques, setStatistiques] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerStatistiques();
  }, []);

  const chargerStatistiques = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques des débats
      const [debatsResponse, candidatsResponse] = await Promise.all([
        debatService.getStatistiques(),
        candidatService.getAll({ limit: 1 })
      ]);

      if (debatsResponse.data.success) {
        setStatistiques(debatsResponse.data.statistiques);
      }

    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Chargement du tableau de bord..." />;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Tableau de Bord Administrateur</h1>
        <p>Bienvenue, {user?.name}. Gérez l'ensemble de la plateforme.</p>
      </div>

      {/* Cartes de statistiques */}
      <div className="stats-grid admin-stats">
        <div className="stat-card admin">
          <div className="stat-icon">💬</div>
          <div className="stat-value">{statistiques.totalDebats || 0}</div>
          <div className="stat-label">Débats total</div>
        </div>

        <div className="stat-card admin">
          <div className="stat-icon">⚡</div>
          <div className="stat-value">{statistiques.debatsEnCours || 0}</div>
          <div className="stat-label">Débats en cours</div>
        </div>

        <div className="stat-card admin">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{statistiques.debatsTermines || 0}</div>
          <div className="stat-label">Débats terminés</div>
        </div>

        <div className="stat-card admin">
          <div className="stat-icon">💰</div>
          <div className="stat-value">
            {calculService.formaterMontant(statistiques.gainsDistribues || 0)}
          </div>
          <div className="stat-label">Gains distribués</div>
        </div>

        <div className="stat-card admin">
          <div className="stat-icon">🏢</div>
          <div className="stat-value">
            {calculService.formaterMontant(statistiques.fraisOrganisation || 0)}
          </div>
          <div className="stat-label">Frais organisation</div>
        </div>

        <div className="stat-card admin">
          <div className="stat-icon">👥</div>
          <div className="stat-value">-</div>
          <div className="stat-label">Candidats total</div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="admin-actions">
        <h2>Actions Rapides</h2>
        <div className="actions-grid">
          <div 
            className="action-card" 
            onClick={() => window.location.href = '/admin/nouveau-debat'}
          >
            <div className="action-icon">➕</div>
            <h3>Créer un débat</h3>
            <p>Organiser un nouveau débat</p>
          </div>

          <div 
            className="action-card"
            onClick={() => window.location.href = '/admin/validation'}
          >
            <div className="action-icon">✅</div>
            <h3>Valider paiements</h3>
            <p>Valider les paiements en attente</p>
          </div>

          <div 
            className="action-card"
            onClick={() => window.location.href = '/admin/debats'}
          >
            <div className="action-icon">🎯</div>
            <h3>Gérer débats</h3>
            <p>Superviser les débats en cours</p>
          </div>

          <div 
            className="action-card"
            onClick={() => window.location.href = '/transactions'}
          >
            <div className="action-icon">💸</div>
            <h3>Transactions</h3>
            <p>Voir toutes les transactions</p>
          </div>

          <div 
            className="action-card"
            onClick={() => window.location.href = '/candidats'}
          >
            <div className="action-icon">👥</div>
            <h3>Candidats</h3>
            <p>Gérer tous les candidats</p>
          </div>

          <div 
            className="action-card"
            onClick={() => window.location.href = '/classement'}
          >
            <div className="action-icon">🏆</div>
            <h3>Classement</h3>
            <p>Voir les classements</p>
          </div>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="admin-details">
        <div className="detail-section">
          <h3>Répartition par Catégorie</h3>
          <div className="categories-stats">
            {statistiques.debatsParCategorie?.map((categorie, index) => (
              <div key={index} className="categorie-stat">
                <div className="categorie-name">{categorie._id}</div>
                <div className="categorie-count">{categorie.count} débats</div>
              </div>
            )) || (
              <div className="empty-state">
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h3>Performances Financières</h3>
          <div className="financial-stats">
            <div className="financial-item">
              <div className="financial-label">Total des transactions</div>
              <div className="financial-value">
                {calculService.formaterMontant(
                  (statistiques.gainsDistribues || 0) + (statistiques.fraisOrganisation || 0)
                )}
              </div>
            </div>
            <div className="financial-item">
              <div className="financial-label">Gains moyens par débat</div>
              <div className="financial-value">
                {statistiques.debatsTermines > 0 ? 
                  calculService.formaterMontant((statistiques.gainsDistribues || 0) / statistiques.debatsTermines) 
                  : '0 FCFA'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;