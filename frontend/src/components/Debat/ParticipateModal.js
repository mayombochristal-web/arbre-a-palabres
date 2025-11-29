import React, { useState } from 'react';

const ParticipateModal = ({ debat, onClose, onConfirm }) => {
    const [candidatInfo, setCandidatInfo] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(candidatInfo);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#fff',
                padding: '30px',
                borderRadius: '10px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <h2 style={{ marginTop: 0, color: '#2d5016' }}>
                    Participer au Débat
                </h2>

                <div style={{
                    padding: '15px',
                    backgroundColor: '#e7f3ff',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{debat.theme_debat}</h3>
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                        <strong>Catégorie:</strong> {debat.categorie}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                        <strong>Frais d'inscription:</strong> {
                            debat.categorie === 'Primaire' ? '500 FCFA' :
                                debat.categorie === 'Collège' ? '1 000 FCFA' :
                                    '2 000 FCFA'
                        }
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Nom *
                        </label>
                        <input
                            type="text"
                            required
                            value={candidatInfo.nom}
                            onChange={(e) => setCandidatInfo({ ...candidatInfo, nom: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Prénom *
                        </label>
                        <input
                            type="text"
                            required
                            value={candidatInfo.prenom}
                            onChange={(e) => setCandidatInfo({ ...candidatInfo, prenom: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Email *
                        </label>
                        <input
                            type="email"
                            required
                            value={candidatInfo.email}
                            onChange={(e) => setCandidatInfo({ ...candidatInfo, email: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Téléphone *
                        </label>
                        <input
                            type="tel"
                            required
                            value={candidatInfo.telephone}
                            onChange={(e) => setCandidatInfo({ ...candidatInfo, telephone: e.target.value })}
                            placeholder="+241 XX XX XX XX"
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div style={{
                        padding: '15px',
                        backgroundColor: '#fff3cd',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        border: '1px solid #ffc107'
                    }}>
                        <h4 style={{ marginTop: 0, fontSize: '14px', color: '#856404' }}>
                            💰 Informations de Paiement
                        </h4>
                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#856404' }}>
                            <strong>Méthode:</strong> Airtel Money uniquement
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#856404' }}>
                            <strong>Numéro:</strong> +241 77 76 54 96
                        </p>
                        <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#856404' }}>
                            Après validation, vous recevrez un email avec les instructions de paiement.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: '#6c757d',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: '#2d5016',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Confirmer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ParticipateModal;
