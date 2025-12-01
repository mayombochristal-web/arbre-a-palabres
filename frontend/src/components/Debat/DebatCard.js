import React from 'react';
import { calculService } from '../../services/calculService';
import { formaterDateHeure, formaterStatut } from '../../utils/formatters';

const DebatCard = ({ debat, onViewDetails, onParticipate }) => {
  const getStatutBadgeClass = (statut) => {
    const classes = {
      'en_attente': 'badge-warning',
      'en_cours': 'badge-primary',
      'termine': 'badge-success',
      'annule': 'badge-error'
    };
    return classes[statut] || 'badge-primary';
  };

  return (
    <div className={`debat-card ${debat.statut}`}>
      <div className="debat-header">
        <div className="debat-infos">
          <h3 className="debat-theme">{debat.theme_debat}</h3>
          <div className="debat-meta">
            <span className={`statut-badge ${getStatutBadgeClass(debat.statut)}`}>
              {formaterStatut(debat.statut)}
            </span>
            <span className="categorie-badge">{debat.categorie}</span>
            {debat.type_debat !== 'standard' && (
              <span className="type-badge">{debat.type_debat}</span>
            )}
          </div>
        </div>

        <div className="debat-gain">
          <div className="gain-label">Gain du vainqueur</div>
          <div className="gain-montant">
            {calculService.formaterMontant(debat.gain_vainqueur)}
          </div>
        </div>
      </div>

      <div className="debat-body">
        <div className="debat-stats">
          <div className="stat">
            <div className="stat-label">💰 Cagnotte totale</div>
            <div className="stat-value">
              {calculService.formaterMontant(debat.cagnotte_totale)}
            </div>
          </div>

          <div className="stat">
            <div className="stat-label">👥 Participants</div>
            <div className="stat-value">
              {debat.participants_ids?.length || 0}/4
            </div>
          </div>

          <div className="stat">
            <div className="stat-label">📅 Date</div>
            <div className="stat-value">
              {formaterDateHeure(debat.date_debut)}
            </div>
          </div>
        </div>

        {/* Liste des participants */}
        {debat.participants_ids && debat.participants_ids.length > 0 && (
          <div className="participants-list">
            <div className="participants-header">
              <strong>Participants inscrits:</strong>
            </div>
            <div className="participants-grid">
              {debat.participants_ids.map((participant, index) => (
                <div key={participant._id || index} className="participant-item">
                  <span className="participant-number">{index + 1}</span>
                  <span className="participant-name">
                    {participant.prenom} {participant.nom}
                  </span>
                  {participant.scoreFinal !== undefined && (
                    <span className="participant-score">
                      {participant.scoreFinal} pts
                    </span>
                  )}
                </div>
              ))}
              {/* Afficher les places vides */}
              {[...Array(4 - debat.participants_ids.length)].map((_, index) => (
                <div key={`empty-${index}`} className="participant-item empty">
                  <span className="participant-number">{debat.participants_ids.length + index + 1}</span>
                  <span className="participant-name">Place disponible</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Répartition financière */}
        <div className="financial-breakdown">
          <div className="financial-item">
            <span>Frais d'organisation (25%)</span>
            <strong>{calculService.formaterMontant(debat.frais_organisation)}</strong>
          </div>
          <div className="financial-item">
            <span>Frais unitaire par participant</span>
            <strong>{calculService.formaterMontant(debat.frais_unitaire)}</strong>
          </div>
        </div>

        {debat.vainqueur_id && (
          <div className="vainqueur-info">
            <div className="vainqueur-label">🏆 Vainqueur</div>
            <div className="vainqueur-nom">
              {debat.vainqueur_id.prenom} {debat.vainqueur_id.nom}
            </div>
          </div>
        )}

        {debat.trophee_en_jeu && (
          <div className="trophee-info">
            <div className="trophee-label">🎯 Trophée en jeu</div>
            <div className="trophee-nom">{debat.trophee_en_jeu.nom}</div>
          </div>
        )}
      </div>

      <div className="debat-actions">
        <button
          className="btn-secondary"
          onClick={() => onViewDetails(debat)}
        >
          Voir détails
        </button>

        {debat.statut === 'en_attente' && onParticipate && (
          <button
            className="btn-primary"
            onClick={() => onParticipate(debat)}
            disabled={debat.participants_ids?.length >= 4}
          >
            {debat.participants_ids?.length >= 4 ? 'Complet' : 'Participer'}
          </button>
        )}
      </div>
    </div>
  );
};

export default DebatCard;