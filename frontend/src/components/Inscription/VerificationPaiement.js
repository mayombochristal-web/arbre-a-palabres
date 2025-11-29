import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import du hook de navigation
import { candidatService } from '../../services/api';
import { calculService } from '../../services/calculService'; // Import du service de calcul

const VerificationPaiement = () => {
  const [candidatId, setCandidatId] = useState('');
  const [candidat, setCandidat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialisation

  const rechercherCandidat = async () => { /* ... (Logique inchangée) ... */ };
  
  // Fonction pour obtenir les frais de manière centralisée
  const getFraisInscription = (categorie) => {
    return calculService.formaterMontant(calculService.FRAIS_INSCRIPTION[categorie] || 0);
  };
  

  return (
    <div className="form-container">
      {/* ... (Formulaire de recherche inchangé) ... */}

        {candidat && (
          <div className="candidat-details card mt-2">
            {/* ... (Détails du candidat inchangés) ... */}

            {!candidat.fraisInscriptionPayes && (
              <div className="payment-reminder alert alert-warning mt-2">
                <h4>Paiement en attente</h4>
                <p>
                  Vos frais d'inscription de **{getFraisInscription(candidat.categorie)}** n'ont pas encore été validés.
                  {/* CORRECTION: Utilisation de la fonction centralisée */}
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
                  // CORRECTION: Remplacement de window.location.href par navigate
                  onClick={() => navigate('/debats')}
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