import React, { useState, useEffect } from 'react';
import './FormationsPage.css';
import config from '../../config';

const API_BASE_URL = config.API_URL;

export default function FormationsPage() {
    const [formations, setFormations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedFormation, setSelectedFormation] = useState(null);
    const [showInscriptionModal, setShowInscriptionModal] = useState(false);

    useEffect(() => {
        fetchFormations();
    }, []);

    const fetchFormations = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/formations`);
            const data = await response.json();

            if (data.success) {
                setFormations(data.formations);
            } else {
                setError('Erreur lors du chargement des formations');
            }
        } catch (err) {
            setError('Impossible de charger les formations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openInscriptionModal = (formation) => {
        setSelectedFormation(formation);
        setShowInscriptionModal(true);
    };

    const closeInscriptionModal = () => {
        setShowInscriptionModal(false);
        setSelectedFormation(null);
    };

    if (loading) {
        return (
            <div className="formations-page">
                <div className="loading">⏳ Chargement des formations...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="formations-page">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="formations-page">
            <div className="formations-header">
                <h1>📚 Nos Formations</h1>
                <p className="header-subtitle">
                    Développez vos compétences en éloquence avec nos programmes exclusifs
                </p>
            </div>

            <div className="formations-grid">
                {formations.map((formation) => (
                    <div key={formation._id} className="formation-card">
                        <div className="formation-badge">{formation.niveauRequis}</div>

                        <h2>{formation.titre}</h2>
                        <p className="formation-description-short">
                            {formation.descriptionCourte || formation.description.substring(0, 150) + '...'}
                        </p>

                        <div className="formation-details">
                            <div className="detail-item">
                                <span className="icon">💰</span>
                                <span className="label">Prix:</span>
                                <span className="value">{formation.prix.toLocaleString('fr-FR')} FCFA</span>
                            </div>

                            <div className="detail-item">
                                <span className="icon">⏱️</span>
                                <span className="label">Durée:</span>
                                <span className="value">{formation.duree} heures</span>
                            </div>

                            <div className="detail-item">
                                <span className="icon">📊</span>
                                <span className="label">Niveau:</span>
                                <span className="value">{formation.niveauRequis}</span>
                            </div>

                            {formation.modules && formation.modules.length > 0 && (
                                <div className="detail-item">
                                    <span className="icon">📖</span>
                                    <span className="label">Modules:</span>
                                    <span className="value">{formation.modules.length}</span>
                                </div>
                            )}
                        </div>

                        {formation.objectifs && formation.objectifs.length > 0 && (
                            <div className="formation-objectifs">
                                <h4>🎯 Objectifs:</h4>
                                <ul>
                                    {formation.objectifs.slice(0, 3).map((obj, index) => (
                                        <li key={index}>{obj}</li>
                                    ))}
                                    {formation.objectifs.length > 3 && (
                                        <li className="more">+ {formation.objectifs.length - 3} autres...</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        <button
                            className="btn-inscription"
                            onClick={() => openInscriptionModal(formation)}
                        >
                            S'inscrire maintenant
                        </button>
                    </div>
                ))}
            </div>

            {formations.length === 0 && (
                <div className="no-formations">
                    <p>Aucune formation disponible pour le moment.</p>
                    <p>Revenez bientôt ! 🌟</p>
                </div>
            )}

            {showInscriptionModal && selectedFormation && (
                <InscriptionModal
                    formation={selectedFormation}
                    onClose={closeInscriptionModal}
                />
            )}
        </div>
    );
}

function InscriptionModal({ formation, onClose }) {
    const [formData, setFormData] = useState({
        visitor_id: '',
        candidat_id: '',
        paymentMessage: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/formations/${formation._id}/inscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                setMessage(data.message);
            } else {
                setMessage(data.error || 'Erreur lors de l\'inscription');
            }
        } catch (err) {
            setMessage('Impossible de contacter le serveur');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <h2>Inscription : {formation.titre}</h2>
                <p className="modal-prix">Prix: {formation.prix.toLocaleString('fr-FR')} FCFA</p>

                {message && (
                    <div className={`message ${isSuccess ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                {!isSuccess && (
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Votre ID Visiteur (si vous êtes inscrit comme visiteur)</label>
                            <input
                                type="text"
                                name="visitor_id"
                                value={formData.visitor_id}
                                onChange={handleChange}
                                placeholder="ID Visiteur (optionnel)"
                            />
                        </div>

                        <div className="input-group">
                            <label>Votre ID Candidat (si vous êtes candidat)</label>
                            <input
                                type="text"
                                name="candidat_id"
                                value={formData.candidat_id}
                                onChange={handleChange}
                                placeholder="ID Candidat (optionnel)"
                            />
                        </div>

                        <div className="payment-info">
                            <h4>💳 Paiement</h4>
                            <p>Envoyez <strong>{formation.prix.toLocaleString('fr-FR')} FCFA</strong> par Airtel Money au <strong>077 76 54 96</strong></p>
                        </div>

                        <div className="input-group">
                            <label>Preuve de paiement (SMS Airtel Money)</label>
                            <textarea
                                name="paymentMessage"
                                value={formData.paymentMessage}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Copiez ici le SMS de confirmation Airtel Money..."
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-submit">
                            {loading ? 'Inscription en cours...' : 'Valider l\'inscription'}
                        </button>
                    </form>
                )}

                {isSuccess && (
                    <div className="success-actions">
                        <button onClick={onClose} className="btn-close-modal">
                            Fermer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
