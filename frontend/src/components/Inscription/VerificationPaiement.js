import React, { useState } from 'react';
import { candidatService } from '../../services/api';

const VerificationPaiement = () => {
  const [candidatId, setCandidatId] = useState('');
  const [candidat, setCandidat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const rechercherCandidat = async () => {
    if (!candidatId.trim()) {
      setMessage('Veuillez entrer un ID candidat');
      return;
    }

    setLoading(true);
    try {
      const response = await candidatService.getById(candidatId);
      if (response.data.success) {
        setCandidat(response.data.candidat);
        setMessage('');
      } else {
        setCandidat(null);
        setMessage('Candidat non trouvé');
      }
    } catch (error) {
      setCandidat(null);
      setMessage('Erreur lors de la recherche du candidat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Vérification du Statut de Paiement</h2>
        <p className="help-text">
          Entrez votre ID candidat pour vérifier le statut de votre paiement et inscription.
        </p>

        <div className="form-group">
          <label htmlFor="candidatId">ID Candidat *</label>
          <input
            id="candidatId"
            type="text"
            value={candidatId}
            onChange={(e) => setCandidatId(e.target.value)}
            placeholder="Ex: 507f1f77bcf86cd799439011"
          />
          <div className="help-text">
            Vous avez reçu cet ID par email après votre inscription
          </div>
        </div>

        <button 
          onClick={rechercherCandidat}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Recherche...' : 'Vérifier le Statut'}
        </button>

        {message && (
          <div className="alert alert-error mt-2">
            {message}
          </div>
        )}

        {candidat && (
          <div className="candidat-status mt-3">
            <h3>Statut de votre inscription</h3>
            <div className="status-card">
              <div className="status-item">
                <strong>Nom:</strong> {candidat.prenom} {candidat.nom}
              </div>
              <div className="status-item">
                <strong>Catégorie:</strong> {candidat.categorie}
              </div>
              <div className="status-item">
                <strong>Email:</strong> {candidat.email}
              </div>
              <div className="status-item">
                <strong>Statut administratif:</strong>
                <span className={`badge badge-${candidat.statutAdministratif === 'ADMISSIBLE' ? 'success' : 'warning'}`}>
                  {candidat.statutAdministratif}
                </span>
              </div>
              <div className="status-item">
                <strong>Frais payés:</strong>
                <span className={`badge ${candidat.fraisInscriptionPayes ? 'badge-success' : 'badge-error'}`}>
                  {candidat.fraisInscriptionPayes ? '✅ Payés' : '❌ En attente'}
                </span>
              </div>
              <div className="status-item">
                <strong>Date d'inscription:</strong> {new Date(candidat.dateInscription).toLocaleDateString('fr-FR')}
              </div>
            </div>

            {!candidat.fraisInscriptionPayes && (
              <div className="payment-reminder alert alert-warning mt-2">
                <h4>Paiement en attente</h4>
                <p>
                  Vos frais d'inscription de {candidat.categorie === 'Primaire' ? '500' : 
                  candidat.categorie === 'College/Lycee' ? '1,000' : '2,000'} FCFA n'ont pas encore été validés.
                </p>
                <p>
                  <strong>Numéro Airtel Money:</strong> +241 77 765 496<br/>
                  <strong>Référence:</strong> {candidat._id.slice(-6)}
                </p>
              </div>
            )}

            {candidat.statutAdministratif === 'ADMISSIBLE' && (
              <div className="success-message alert alert-success mt-2">
                <h4>✅ Inscription Validée!</h4>
                <p>
                  Félicitations! Votre inscription a été validée. Vous pouvez maintenant participer aux débats.
                </p>
                <button 
                  className="btn-primary"
                  onClick={() => window.location.href = '/debats'}
                >
                  Voir les Débats Disponibles
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPaiement;