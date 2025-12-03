import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, PlayCircle, CheckCircle, Layers } from 'lucide-react';
import DebatCard from './DebatCard';
import './DebatList.css';

import config from '../../config';

const API_URL = config.API_URL;

const DebatList = () => {
  const [debats, setDebats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('tous');
  const navigate = useNavigate();

  // Fonction pour charger les débats
  const loadDebats = async () => {
    try {
      const params = filter !== 'tous' ? { statut: filter } : {};
      const response = await axios.get(`${API_URL}/debats`, { params });

      if (response.data.success) {
        setDebats(response.data.debats);
        setError(null);
      }
    } catch (err) {
      console.error('Erreur chargement débats:', err);
      setError('Impossible de charger les débats');
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    loadDebats();
  }, [filter]);

  // Auto-refresh toutes les 10 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      loadDebats();
    }, 10000); // 10 secondes

    return () => clearInterval(interval);
  }, [filter]);

  const handleViewDetails = (debat) => {
    navigate(`/debats/${debat._id}`);
  };

  const filteredDebats = debats;

  if (loading && debats.length === 0) {
    return (
      <div className="debat-list-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Chargement des débats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="debat-list-container">
      <div className="debat-list-header">
        <h1>📢 Débats Disponibles</h1>
        <p className="subtitle">Participez aux débats et gagnez de l'argent</p>

        <div className="filter-buttons">
          <button
            className={filter === 'tous' ? 'active' : ''}
            onClick={() => setFilter('tous')}
            aria-pressed={filter === 'tous'}
          >
            <Layers size={18} style={{ marginRight: '8px' }} />
            Tous
          </button>
          <button
            className={filter === 'en_attente' ? 'active' : ''}
            onClick={() => setFilter('en_attente')}
            aria-pressed={filter === 'en_attente'}
          >
            <Clock size={18} style={{ marginRight: '8px' }} />
            En attente
          </button>
          <button
            className={filter === 'en_cours' ? 'active' : ''}
            onClick={() => setFilter('en_cours')}
            aria-pressed={filter === 'en_cours'}
          >
            <PlayCircle size={18} style={{ marginRight: '8px' }} />
            En cours
          </button>
          <button
            className={filter === 'termine' ? 'active' : ''}
            onClick={() => setFilter('termine')}
            aria-pressed={filter === 'termine'}
          >
            <CheckCircle size={18} style={{ marginRight: '8px' }} />
            Terminés
          </button>
        </div>

        <div className="auto-refresh-indicator">
          <span className="refresh-dot"></span>
          Actualisation automatique
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={loadDebats}>Réessayer</button>
        </div>
      )}

      {filteredDebats.length === 0 ? (
        <div className="no-debats">
          <p>
            {filter === 'tous' && "Aucun débat disponible pour le moment."}
            {filter === 'en_attente' && "Aucun débat en attente de participants."}
            {filter === 'en_cours' && "Aucun débat n'est en cours actuellement."}
            {filter === 'termine' && "Aucun débat terminé à afficher."}
          </p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Retour à l'accueil
          </button>
        </div>
      ) : (
        <div className="debats-grid">
          {filteredDebats.map((debat) => (
            <DebatCard
              key={debat._id}
              debat={debat}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DebatList;