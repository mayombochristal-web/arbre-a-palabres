import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Données de démonstration - mêmes que DebatList
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

const GestionDebatsPage = () => {
    const navigate = useNavigate();
    const [debats, setDebats] = useState(MOCK_DEBATS);
    const [selectedDebat, setSelectedDebat] = useState(null);

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

    const handleChangeStatut = (debatId, newStatut) => {
        setDebats(debats.map(d =>
            d._id === debatId ? { ...d, statut: newStatut } : d
        ));
        alert(`Statut du débat changé en: ${newStatut}`);
    };

    const handleDeleteDebat = (debatId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce débat ?')) {
            setDebats(debats.filter(d => d._id !== debatId));
            setSelectedDebat(null);
            alert('Débat supprimé avec succès');
        }
    };

    const handleSelectWinner = (debatId, participantId) => {
        const participant = debats.find(d => d._id === debatId)?.participants_ids.find(p => p._id === participantId);
        if (participant && window.confirm(`Désigner ${participant.prenom} ${participant.nom} comme vainqueur ?`)) {
            setDebats(debats.map(d =>
                d._id === debatId ? { ...d, vainqueur_id: participant, statut: 'termine' } : d
            ));
            alert(`${participant.prenom} ${participant.nom} désigné(e) comme vainqueur !`);
        }
    };

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ color: '#2d5016', marginBottom: '10px' }}>🎯 Gestion des Débats</h1>
                    <p style={{ color: '#666' }}>Gérez tous les débats de la plateforme</p>
                </div>
                <button
                    onClick={() => navigate('/admin/nouveau-debat')}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#2d5016',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    + Nouveau Débat
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedDebat ? '1fr 1fr' : '1fr', gap: '20px' }}>
                {/* Liste des débats */}
                <div>
                    <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#2d5016' }}>
                        Tous les Débats ({debats.length})
                    </h2>

                    {debats.map(debat => (
                        <div
                            key={debat._id}
                            onClick={() => setSelectedDebat(debat)}
                            style={{
                                backgroundColor: selectedDebat?._id === debat._id ? '#e7f3ff' : '#fff',
                                padding: '20px',
                                borderRadius: '10px',
                                marginBottom: '15px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                border: selectedDebat?._id === debat._id ? '2px solid #2d5016' : '2px solid transparent'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#2d5016' }}>
                                        {debat.theme_debat}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {getStatutBadge(debat.statut)}
                                        <span style={{ padding: '5px 12px', borderRadius: '15px', fontSize: '13px', fontWeight: 'bold', backgroundColor: '#e7f3ff', color: '#2d5016' }}>
                                            {debat.categorie}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Participants</div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2d5016' }}>
                                        {debat.participants_ids?.length || 0}/4
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Détails du débat sélectionné */}
                {selectedDebat && (
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '30px',
                        borderRadius: '10px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        position: 'sticky',
                        top: '20px',
                        maxHeight: 'calc(100vh - 100px)',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#2d5016' }}>
                            Détails du Débat
                        </h2>

                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{selectedDebat.theme_debat}</h3>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                {getStatutBadge(selectedDebat.statut)}
                                <span style={{ padding: '5px 12px', borderRadius: '15px', fontSize: '13px', fontWeight: 'bold', backgroundColor: '#e7f3ff', color: '#2d5016' }}>
                                    {selectedDebat.categorie}
                                </span>
                            </div>
                        </div>

                        {/* Changer le statut */}
                        <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                                Changer le statut
                            </label>
                            <select
                                value={selectedDebat.statut}
                                onChange={(e) => handleChangeStatut(selectedDebat._id, e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    fontSize: '16px'
                                }}
                            >
                                <option value="en_attente">En attente</option>
                                <option value="en_cours">En cours</option>
                                <option value="termine">Terminé</option>
                                <option value="annule">Annulé</option>
                            </select>
                        </div>

                        {/* Participants */}
                        <div style={{ marginBottom: '25px' }}>
                            <h4 style={{ marginBottom: '15px', fontSize: '16px', color: '#2d5016' }}>
                                Participants ({selectedDebat.participants_ids?.length || 0}/4)
                            </h4>
                            {selectedDebat.participants_ids?.map(participant => (
                                <div
                                    key={participant._id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '5px',
                                        marginBottom: '10px'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>
                                            {participant.prenom} {participant.nom}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#666' }}>
                                            Score: {participant.scoreFinal || 'N/A'}
                                        </div>
                                    </div>
                                    {selectedDebat.statut === 'en_cours' && !selectedDebat.vainqueur_id && (
                                        <button
                                            onClick={() => handleSelectWinner(selectedDebat._id, participant._id)}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#28a745',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '5px',
                                                fontSize: '14px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Désigner vainqueur
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Vainqueur */}
                        {selectedDebat.vainqueur_id && (
                            <div style={{
                                padding: '15px',
                                backgroundColor: '#d1e7dd',
                                borderRadius: '8px',
                                marginBottom: '25px'
                            }}>
                                <div style={{ fontWeight: 'bold', color: '#0f5132', marginBottom: '5px' }}>
                                    🏆 Vainqueur
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f5132' }}>
                                    {selectedDebat.vainqueur_id.prenom} {selectedDebat.vainqueur_id.nom}
                                </div>
                            </div>
                        )}

                        {/* Informations financières */}
                        <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                            <h4 style={{ marginBottom: '15px', fontSize: '16px', color: '#2d5016' }}>
                                Informations Financières
                            </h4>
                            <div style={{ marginBottom: '10px' }}>
                                <span style={{ color: '#666' }}>Cagnotte totale: </span>
                                <span style={{ fontWeight: 'bold' }}>{selectedDebat.cagnotte_totale} FCFA</span>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <span style={{ color: '#666' }}>Gain vainqueur (75%): </span>
                                <span style={{ fontWeight: 'bold', color: '#28a745' }}>{selectedDebat.gain_vainqueur} FCFA</span>
                            </div>
                            <div>
                                <span style={{ color: '#666' }}>Frais organisation (25%): </span>
                                <span style={{ fontWeight: 'bold' }}>{selectedDebat.frais_organisation} FCFA</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => handleDeleteDebat(selectedDebat._id)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    backgroundColor: '#dc3545',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '5px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                🗑️ Supprimer
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestionDebatsPage;
