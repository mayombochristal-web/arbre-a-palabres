import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const API_BASE_URL = config.API_URL;

const CreateDebatPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        theme: '',
        category: 'Universitaire',
        participantsIds: []
    });

    const [availableCandidates, setAvailableCandidates] = useState([]);

    // Charger les candidats admissibles quand la catégorie change
    useEffect(() => {
        loadCandidates();
    }, [formData.category]);

    const loadCandidates = async () => {
        try {
            setLoadingCandidates(true);
            const response = await axios.get(`${API_BASE_URL}/candidats`, {
                params: {
                    categorie: formData.category,
                    statut: 'ADMISSIBLE',
                    limit: 100
                }
            });

            if (response.data && response.data.candidats) {
                setAvailableCandidates(response.data.candidats);
            }
        } catch (err) {
            console.error('Erreur chargement candidats:', err);
            setError('Impossible de charger les candidats');
        } finally {
            setLoadingCandidates(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    const toggleCandidate = (candidateId) => {
        const newParticipants = formData.participantsIds.includes(candidateId)
            ? formData.participantsIds.filter(id => id !== candidateId)
            : [...formData.participantsIds, candidateId];

        setFormData({
            ...formData,
            participantsIds: newParticipants
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validation
        if (formData.participantsIds.length !== 4) {
            setError('Vous devez sélectionner exactement 4 participants');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/debats/standard`,
                {
                    participantsIds: formData.participantsIds,
                    theme: formData.theme
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setSuccess('✅ Débat créé avec succès !');
                setTimeout(() => {
                    navigate('/admin/debats');
                }, 1500);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Erreur lors de la création du débat';
            setError(`❌ ${errorMsg}`);
            console.error('Erreur création débat:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ color: '#2d5016', marginBottom: '10px' }}>🎯 Créer un Nouveau Débat</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Sélectionnez un thème et 4 candidats admissibles de la même catégorie
            </p>

            {error && (
                <div style={{
                    backgroundColor: '#ffe6e6',
                    color: '#d32f2f',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #ffcdd2'
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    backgroundColor: '#e8f5e9',
                    color: '#388e3c',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #c8e6c9'
                }}>
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>

                {/* Thème */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                        📝 Thème du Débat *
                    </label>
                    <input
                        type="text"
                        name="theme"
                        value={formData.theme}
                        onChange={handleChange}
                        required
                        placeholder="Ex: L'entrepreneuriat jeune au Gabon"
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px'
                        }}
                    />
                </div>

                {/* Catégorie */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                        🎓 Catégorie *
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px'
                        }}
                    >
                        <option value="Primaire">Primaire (10-12 ans) - 500 FCFA</option>
                        <option value="College/Lycee">Collège/Lycée (13-17 ans) - 1000 FCFA</option>
                        <option value="Universitaire">Universitaire (18-25 ans) - 2000 FCFA</option>
                        <option value="Entrepreneur">Entrepreneur (26+ ans) - 5000 FCFA</option>
                    </select>
                    <small style={{ color: '#666', fontSize: '13px', marginTop: '5px', display: 'block' }}>
                        Seuls les candidats admissibles avec frais payés de cette catégorie seront affichés
                    </small>
                </div>

                {/* Sélection des Participants */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                        👥 Participants ({formData.participantsIds.length}/4 sélectionnés) *
                    </label>

                    {loadingCandidates ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                            ⏳ Chargement des candidats...
                        </div>
                    ) : availableCandidates.length === 0 ? (
                        <div style={{
                            backgroundColor: '#fff3cd',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #ffc107',
                            color: '#856404'
                        }}>
                            ⚠️ Aucun candidat admissible dans cette catégorie. Les candidats doivent
                            avoir payé leurs frais d'inscription.
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                            gap: '15px',
                            marginTop: '15px'
                        }}>
                            {availableCandidates.map((candidate) => (
                                <div
                                    key={candidate._id}
                                    onClick={() => toggleCandidate(candidate._id)}
                                    style={{
                                        padding: '15px',
                                        border: formData.participantsIds.includes(candidate._id)
                                            ? '2px solid #2d5016'
                                            : '1px solid #ddd',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        backgroundColor: formData.participantsIds.includes(candidate._id)
                                            ? '#e8f5e9'
                                            : '#fff',
                                        transition: 'all 0.2s',
                                        ':hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                        }
                                    }}
                                >
                                    <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
                                        {formData.participantsIds.includes(candidate._id) && '✅ '}
                                        {candidate.nom} {candidate.prenom}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                                        {candidate.nomEtablissement}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#999' }}>
                                        Score: {candidate.scoreFinal || 0} | Solde: {candidate.soldeActuel || 0} FCFA
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Informations de paiement */}
                <div style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #b3d9ff' }}>
                    <h3 style={{ marginTop: 0, color: '#2d5016' }}>💰 Informations Importantes</h3>
                    <p style={{ margin: '10px 0' }}>
                        <strong>Répartition des gains :</strong> 75% au vainqueur, 25% pour l'organisation
                    </p>
                    <p style={{ margin: '10px 0' }}>
                        <strong>Frais par participant :</strong>
                        {formData.category === 'Primaire' && ' 500 FCFA'}
                        {formData.category === 'College/Lycee' && ' 1000 FCFA'}
                        {formData.category === 'Universitaire' && ' 2000 FCFA'}
                        {formData.category === 'Entrepreneur' && ' 5000 FCFA'}
                    </p>
                    <p style={{ margin: '10px 0', color: '#666', fontSize: '14px' }}>
                        Les participants sélectionnés ont déjà payé leurs frais d'inscription.
                    </p>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        disabled={loading}
                        style={{
                            padding: '12px 30px',
                            backgroundColor: '#ccc',
                            color: '#333',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '16px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading || formData.participantsIds.length !== 4}
                        style={{
                            padding: '12px 30px',
                            backgroundColor: (loading || formData.participantsIds.length !== 4) ? '#ccc' : '#2d5016',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: (loading || formData.participantsIds.length !== 4) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? '⏳ Création en cours...' : 'Créer le Débat'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateDebatPage;
