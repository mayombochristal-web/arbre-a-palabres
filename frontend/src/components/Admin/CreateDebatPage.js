import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateDebatPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        theme: '',
        category: 'Universitaire',
        date: '',
        time: '',
        participants: ['', '', '', ''],
        rules: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleParticipantChange = (index, value) => {
        const newParticipants = [...formData.participants];
        newParticipants[index] = value;
        setFormData({
            ...formData,
            participants: newParticipants
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement API call to create debate
        console.log('Creating debate:', formData);
        alert('Débat créé avec succès !');
        navigate('/admin/debats');
    };

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: '#2d5016', marginBottom: '30px' }}>🎯 Créer un Nouveau Débat</h1>

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
                        <option value="Collège">Collège/Lycée (13-18 ans) - 1 000 FCFA</option>
                        <option value="Universitaire">Universitaire (19-40 ans) - 2 000 FCFA</option>
                    </select>
                </div>

                {/* Date et Heure */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                            📅 Date *
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '16px'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                            🕐 Heure *
                        </label>
                        <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '16px'
                            }}
                        />
                    </div>
                </div>

                {/* Participants */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                        👥 Participants (4 requis) *
                    </label>
                    {formData.participants.map((participant, index) => (
                        <input
                            key={index}
                            type="text"
                            value={participant}
                            onChange={(e) => handleParticipantChange(index, e.target.value)}
                            required
                            placeholder={`Participant ${index + 1} (ID ou Email)`}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '16px',
                                marginBottom: '10px'
                            }}
                        />
                    ))}
                </div>

                {/* Règles spécifiques */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                        📋 Règles Spécifiques (optionnel)
                    </label>
                    <textarea
                        name="rules"
                        value={formData.rules}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Ajoutez des règles spécifiques pour ce débat..."
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px',
                            resize: 'vertical'
                        }}
                    />
                </div>

                {/* Informations de paiement */}
                <div style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #b3d9ff' }}>
                    <h3 style={{ marginTop: 0, color: '#2d5016' }}>💰 Informations de Paiement</h3>
                    <p style={{ margin: '10px 0' }}>
                        <strong>Méthode :</strong> Airtel Money uniquement
                    </p>
                    <p style={{ margin: '10px 0' }}>
                        <strong>Numéro :</strong> +241 77 76 54 96
                    </p>
                    <p style={{ margin: '10px 0', color: '#666' }}>
                        Les participants devront envoyer une preuve de paiement pour validation.
                    </p>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        style={{
                            padding: '12px 30px',
                            backgroundColor: '#ccc',
                            color: '#333',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        style={{
                            padding: '12px 30px',
                            backgroundColor: '#2d5016',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Créer le Débat
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateDebatPage;
