import React, { useState } from 'react';
import { calculService } from '../../services/calculService';
import { formaterStatut, formaterDateHeure } from '../../utils/formatters';

// Données de démonstration
const MOCK_DEBATS = [
  {
    _id: '1',
    theme_debat: "L'entrepreneuriat jeune : solution au chômage au Gabon ?",
    categorie: 'Universitaire',
    statut: 'en_attente',
    type_debat: 'standard',
    cagnotte_totale: 8000,
    gain_vainqueur: 6000,
    frais_organisation: 2000,
    participants_ids: [
      { _id: '1', prenom: 'Christelle', nom: 'Mboumba', scoreFinal: null },
      { _id: '2', prenom: 'Junior', nom: 'Ndong', scoreFinal: null },
      { _id: '3', prenom: 'Divine', nom: 'Ella', scoreFinal: null }
    ],
    date_debut: new Date('2024-12-05T15:00:00'),
    vainqueur_id: null
  },
  {
    _id: '2',
    theme_debat: "Les réseaux sociaux : danger ou opportunité pour les jeunes gabonais ?",
    categorie: 'Collège',
    statut: 'en_cours',
    type_debat: 'standard',
    cagnotte_totale: 4000,
    gain_vainqueur: 3000,
    frais_organisation: 1000,
    participants_ids: [
      { _id: '4', prenom: 'Sarah', nom: 'Obiang', scoreFinal: 85 },
      { _id: '5', prenom: 'Kevin', nom: 'Ondo', scoreFinal: 78 },
      { _id: '6', prenom: 'Marie', nom: 'Koumba', scoreFinal: 82 },
      { _id: '7', prenom: 'Paul', nom: 'Nguema', scoreFinal: 75 }
    ],
    date_debut: new Date('2024-11-29T14:00:00'),
    vainqueur_id: null
  },
  {
    _id: '3',
    theme_debat: "La forêt gabonaise : notre trésor à protéger",
    categorie: 'Primaire',
    statut: 'termine',
    type_debat: 'standard',
    cagnotte_totale: 2000,
    gain_vainqueur: 1500,
    frais_organisation: 500,
    participants_ids: [
      { _id: '8', prenom: 'Grace', nom: 'Mbina', scoreFinal: 92 },
      { _id: '9', prenom: 'Axel', nom: 'Nguema', scoreFinal: 88 },
      { _id: '10', prenom: 'Lisa', nom: 'Ondo', scoreFinal: 85 },
      { _id: '11', prenom: 'Marc', nom: 'Ella', scoreFinal: 80 }
    ],
    date_debut: new Date('2024-11-25T10:00:00'),
    vainqueur_id: { _id: '8', prenom: 'Grace', nom: 'Mbina' }
  },
  {
    _id: '4',
    theme_debat: "Entre tradition et modernité : comment trouver notre identité ?",
    categorie: 'Universitaire',
    statut: 'annule',
    type_debat: 'defi',
    cagnotte_totale: 8000,
    gain_vainqueur: 6000,
    frais_organisation: 2000,
    participants_ids: [],
    date_debut: new Date('2024-12-01T16:00:00'),
    vainqueur_id: null
  },
  {
    _id: '5',
    theme_debat: "Comment le sport peut prévenir la violence chez les jeunes",
    categorie: 'Collège',
    statut: 'en_attente',
    type_debat: 'standard',
    cagnotte_totale: 4000,
    gain_vainqueur: 3000,
    frais_organisation: 1000,
    participants_ids: [
      { _id: '12', prenom: 'Ahmed', nom: 'Bongo', scoreFinal: null },
      { _id: '13', prenom: 'Sophie', nom: 'Mba', scoreFinal: null }
    ],
    date_debut: new Date('2024-12-10T14:00:00'),
    vainqueur_id: null
  }
];

const DebatList = () => {
  const [filters, setFilters] = useState({
    statut: '',
    categorie: '',
    type: ''
  });

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleParticipate = (debat) => {
    alert(`Participation au débat: ${debat.theme_debat}\n\nPour participer, veuillez:\n1. Payer ${debat.categorie === 'Primaire' ? '500' : debat.categorie === 'Collège' ? '1000' : '2000'} FCFA via Airtel Money\n2. Numéro: +241 77 76 54 96\n3. Envoyer la preuve de paiement`);
  };

  // Filtrer les débats
  const debatsFiltres = MOCK_DEBATS.filter(debat => {
    if (filters.statut && debat.statut !== filters.statut) return false;
    if (filters.categorie && debat.categorie !== filters.categorie) return false;
    if (filters.type && debat.type_debat !== filters.type) return false;
    return true;
  });

  const getStatutBadge = (statut) => {
    const styles = {
      en_attente: { bg: '#fff3cd', color: '#856404', text: '⏳ En attente' },
      en_cours: { bg: '#cfe2ff', color: '#084298', text: '▶️ En cours' },
      termine: { bg: '#d1e7dd', color: '#0f5132', text: '✅ Terminé' },
      annule: { bg: '#f8d7da', color: '#842029', text: '❌ Annulé' }
    };
    const style = styles[statut] || styles.en_attente;
    return (
      <span style={{
        padding: '5px 12px',
        borderRadius: '15px',
        fontSize: '13px',
        fontWeight: 'bold',
        backgroundColor: style.bg,
        color: style.color
      }}>
        {style.text}
      </span>
    );
  };

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#2d5016', marginBottom: '10px' }}>Liste des Débats Disponibles 🗣️</h1>
        <p style={{ color: '#666' }}>Explorez et rejoignez les débats correspondant à votre catégorie!</p>
      </div>

      {/* Zone de Filtrage */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div>
            <label htmlFor="statut" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Statut</label>
            <select
              id="statut"
              name="statut"
              value={filters.statut}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
            >
              <option value="">Tous</option>
              <option value="en_attente">En attente (Ouvert)</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
          <div>
            <label htmlFor="categorie" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Catégorie</label>
            <select
              id="categorie"
              name="categorie"
              value={filters.categorie}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
            >
              <option value="">Toutes</option>
              <option value="Primaire">Primaire</option>
              <option value="Collège">Collège/Lycée</option>
              <option value="Universitaire">Universitaire</option>
            </select>
          </div>
          <div>
            <label htmlFor="type" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Type</label>
            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
            >
              <option value="">Tous</option>
              <option value="standard">Standard</option>
              <option value="trophee">Trophée</option>
              <option value="defi">Défi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des Débats */}
      <div className="debat-list-grid">
        {debatsFiltres.length > 0 ? (
          debatsFiltres.map(debat => (
            <div key={debat._id} style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '15px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#2d5016', fontSize: '18px' }}>{debat.theme_debat}</h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {getStatutBadge(debat.statut)}
                    <span style={{ padding: '5px 12px', borderRadius: '15px', fontSize: '13px', fontWeight: 'bold', backgroundColor: '#e7f3ff', color: '#2d5016' }}>
                      {debat.categorie}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Gain vainqueur</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d5016' }}>
                    {calculService.formaterMontant(debat.gain_vainqueur || 0)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', padding: '15px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Cagnotte Totale</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                    {calculService.formaterMontant(debat.cagnotte_totale || 0)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Participants</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                    {debat.participants_ids?.length || 0}/4
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Date</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                    {formaterDateHeure(debat.date_debut)}
                  </div>
                </div>
              </div>

              {debat.vainqueur_id && (
                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#d1e7dd', borderRadius: '5px' }}>
                  <span style={{ fontWeight: 'bold', color: '#0f5132' }}>
                    🏆 Vainqueur: {debat.vainqueur_id.prenom} {debat.vainqueur_id.nom}
                  </span>
                </div>
              )}

              {debat.statut === 'en_attente' && (
                <div style={{ marginTop: '15px' }}>
                  <button
                    onClick={() => handleParticipate(debat)}
                    disabled={debat.participants_ids?.length >= 4}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: debat.participants_ids?.length >= 4 ? '#ccc' : '#2d5016',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: debat.participants_ids?.length >= 4 ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}
                  >
                    {debat.participants_ids?.length >= 4 ? 'Complet' : 'Participer'}
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>Aucun débat trouvé correspondant aux critères.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebatList;