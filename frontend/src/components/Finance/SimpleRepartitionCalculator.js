import React, { useState, useEffect } from 'react';
import { calculService } from '../../services/calculService';

const SimpleRepartitionCalculator = () => {
  const [categorie, setCategorie] = useState('College/Lycee');
  const [nombreParticipants, setNombreParticipants] = useState(4);
  const [investissementOrga, setInvestissementOrga] = useState(0);
  const [repartition, setRepartition] = useState(null);

  useEffect(() => {
    calculerRepartition();
  }, [categorie, nombreParticipants, investissementOrga]);

  const calculerRepartition = () => {
    const fraisUnitaire = calculService.FRAIS_INSCRIPTION[categorie];
    const cagnotteCandidats = fraisUnitaire * nombreParticipants;
    const cagnotteTotale = cagnotteCandidats + investissementOrga;
    
    const resultat = calculService.calculerRepartitionSimple(cagnotteTotale);
    setRepartition({
      ...resultat,
      fraisUnitaire,
      cagnotteCandidats
    });
  };

  const categories = [
    { value: 'Primaire', label: 'Primaire (10-12 ans)', frais: 500 },
    { value: 'College/Lycee', label: 'Collège/Lycée (13-18 ans)', frais: 1000 },
    { value: 'Universitaire', label: 'Universitaire (19-40 ans)', frais: 2000 }
  ];

  return (
    <div className="container">
      <div className="page-header">
        <h1>Calculateur de Répartition</h1>
        <p>Simulez la répartition 25%/75% des gains pour vos débats</p>
      </div>

      <div className="calculator-container">
        <div className="calculator-form">
          <h3>Paramètres du Débat</h3>
          
          <div className="form-group">
            <label>Catégorie</label>
            <select 
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label} - {calculService.formaterMontant(cat.frais)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Nombre de participants</label>
            <input
              type="number"
              min="2"
              max="8"
              value={nombreParticipants}
              onChange={(e) => setNombreParticipants(parseInt(e.target.value))}
            />
            <div className="help-text">Entre 2 et 8 participants</div>
          </div>

          <div className="form-group">
            <label>Investissement organisation (FCFA)</label>
            <input
              type="number"
              min="0"
              value={investissementOrga}
              onChange={(e) => setInvestissementOrga(parseInt(e.target.value) || 0)}
              placeholder="0"
            />
            <div className="help-text">Optionnel - Bonus de l'organisation</div>
          </div>
        </div>

        {repartition && (
          <div className="calculator-results">
            <h3>Résultats de la Répartition</h3>
            
            <div className="results-grid">
              <div className="result-card total">
                <div className="result-label">Cagnotte Totale</div>
                <div className="result-value">
                  {calculService.formaterMontant(repartition.cagnotteTotale)}
                </div>
                <div className="result-details">
                  <span>{nombreParticipants} × {calculService.formaterMontant(repartition.fraisUnitaire)}</span>
                  {investissementOrga > 0 && (
                    <span>+ {calculService.formaterMontant(investissementOrga)} bonus</span>
                  )}
                </div>
              </div>

              <div className="result-card frais">
                <div className="result-label">Frais Organisation (25%)</div>
                <div className="result-value">
                  {calculService.formaterMontant(repartition.fraisOrganisation)}
                </div>
                <div className="result-details">
                  Pour couvrir les coûts d'organisation
                </div>
              </div>

              <div className="result-card gain">
                <div className="result-label">Gain Vainqueur (75%)</div>
                <div className="result-value highlight">
                  {calculService.formaterMontant(repartition.gainVainqueur)}
                </div>
                <div className="result-details">
                  Montant attribué au gagnant du débat
                </div>
              </div>
            </div>

            {/* Visualisation graphique */}
            <div className="visualisation-section">
              <h4>Répartition Visuelle</h4>
              <div className="repartition-chart">
                <div 
                  className="chart-bar frais"
                  style={{ width: '25%' }}
                  title={`Frais Organisation: ${calculService.formaterMontant(repartition.fraisOrganisation)}`}
                >
                  <div className="chart-label">
                    <span>25%</span>
                    <span>Frais</span>
                  </div>
                </div>
                <div 
                  className="chart-bar gain"
                  style={{ width: '75%' }}
                  title={`Gain Vainqueur: ${calculService.formaterMontant(repartition.gainVainqueur)}`}
                >
                  <div className="chart-label">
                    <span>75%</span>
                    <span>Gain</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Détails de calcul */}
            <div className="calculation-details">
              <h4>Détails du Calcul</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <span>Frais unitaire:</span>
                  <span>{calculService.formaterMontant(repartition.fraisUnitaire)}</span>
                </div>
                <div className="detail-item">
                  <span>Total candidats:</span>
                  <span>{calculService.formaterMontant(repartition.cagnotteCandidats)}</span>
                </div>
                {investissementOrga > 0 && (
                  <div className="detail-item">
                    <span>Investissement organisation:</span>
                    <span>+ {calculService.formaterMontant(investissementOrga)}</span>
                  </div>
                )}
                <div className="detail-item total">
                  <span>Cagnotte totale:</span>
                  <span>{calculService.formaterMontant(repartition.cagnotteTotale)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exemples prédéfinis */}
        <div className="examples-section">
          <h3>Exemples de Répartition par Catégorie</h3>
          <div className="examples-grid">
            {categories.map(cat => {
              const exemple = calculService.calculerGainsDebat(cat.value, 4);
              return (
                <div key={cat.value} className="example-card">
                  <h4>{cat.label}</h4>
                  <div className="example-details">
                    <div className="example-item">
                      <span>Frais/Participant:</span>
                      <span>{calculService.formaterMontant(cat.frais)}</span>
                    </div>
                    <div className="example-item">
                      <span>Cagnotte totale:</span>
                      <span>{calculService.formaterMontant(exemple.cagnotteTotale)}</span>
                    </div>
                    <div className="example-item">
                      <span>Frais organisation:</span>
                      <span>{calculService.formaterMontant(exemple.fraisOrganisation)}</span>
                    </div>
                    <div className="example-item highlight">
                      <span>Gain vainqueur:</span>
                      <span>{calculService.formaterMontant(exemple.gainVainqueur)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Informations sur le système */}
        <div className="info-section">
          <h3>💡 Comment fonctionne le système ?</h3>
          <div className="info-grid">
            <div className="info-card">
              <h4>Transparence</h4>
              <p>La répartition 25%/75% est fixe et transparente pour tous les participants</p>
            </div>
            <div className="info-card">
              <h4>Équité</h4>
              <p>Chaque participant contribue équitablement à la cagnotte</p>
            </div>
            <div className="info-card">
              <h4>Motivation</h4>
              <p>Le gain important motive l'excellence et la participation</p>
            </div>
            <div className="info-card">
              <h4>Durabilité</h4>
              <p>Les frais couvrent les coûts d'organisation pour la pérennité</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleRepartitionCalculator;