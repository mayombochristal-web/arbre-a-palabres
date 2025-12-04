import React, { useState } from 'react';
import './VisitorRegistration.css';
import config from '../../config';

const API_BASE_URL = config.API_URL;

export default function VisitorRegistration() {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        preferences: {
            nouveauxDebats: true,
            resultatsDebats: true,
            offresFormation: true,
            newsletter: true
        }
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePreferenceChange = (e) => {
        setFormData({
            ...formData,
            preferences: {
                ...formData.preferences,
                [e.target.name]: e.target.checked
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsSuccess(false);

        try {
            const response = await fetch(`${API_BASE_URL}/visitors/inscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                setMessage(data.message || 'Inscription réussie ! Vérifiez votre email. 📧');

                // Reset form
                setFormData({
                    nom: '',
                    prenom: '',
                    email: '',
                    telephone: '',
                    preferences: {
                        nouveauxDebats: true,
                        resultatsDebats: true,
                        offresFormation: true,
                        newsletter: true
                    }
                });
            } else {
                setMessage(data.error || 'Une erreur est survenue.');
            }
        } catch (err) {
            console.error(err);
            setMessage('Impossible de contacter le serveur.');
        }

        setLoading(false);
    };

    if (isSuccess) {
        return (
            <div className="visitor-registration-container">
                <div className="visitor-registration-card success-view">
                    <div className="success-icon">🎉</div>
                    <h2>Inscription Réussie !</h2>
                    <p className="success-message">
                        Bienvenue <strong>{formData.prenom}</strong> !<br />
                        Votre inscription a bien été prise en compte.
                    </p>

                    <div className="next-steps">
                        <h3>🚀 Et maintenant ?</h3>
                        <ul>
                            <li>📧 Vérifiez votre boîte mail (y compris les spams) pour votre cadeau de bienvenue.</li>
                            <li>📚 Découvrez notre formation exclusive à 10 000 FCFA.</li>
                            <li>🎤 Explorez les débats en cours.</li>
                        </ul>
                    </div>

                    <div className="action-buttons">
                        <a href="/formations" className="btn-primary">Voir les Formations</a>
                        <a href="/" className="btn-secondary">Retour à l'Accueil</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="visitor-registration-container">
            <div className="visitor-registration-card">
                <h2>📬 Restez Informé(e)</h2>
                <p className="subtitle">
                    Inscrivez-vous gratuitement pour recevoir toutes les actualités de L'Arbre à Palabres
                </p>

                {message && !isSuccess && (
                    <div className={`message ${isSuccess ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="input-group">
                            <label>Nom *</label>
                            <input
                                type="text"
                                name="nom"
                                value={formData.nom}
                                onChange={handleChange}
                                required
                                placeholder="Votre nom"
                            />
                        </div>

                        <div className="input-group">
                            <label>Prénom *</label>
                            <input
                                type="text"
                                name="prenom"
                                value={formData.prenom}
                                onChange={handleChange}
                                required
                                placeholder="Votre prénom"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="votre.email@exemple.com"
                        />
                    </div>

                    <div className="input-group">
                        <label>Téléphone (optionnel)</label>
                        <input
                            type="tel"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            placeholder="+241 XX XX XX XX"
                        />
                    </div>

                    <div className="preferences-section">
                        <h3>📢 Je souhaite recevoir :</h3>

                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="nouveauxDebats"
                                    checked={formData.preferences.nouveauxDebats}
                                    onChange={handlePreferenceChange}
                                />
                                <span>🎤 Notifications de nouveaux débats</span>
                            </label>

                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="resultatsDebats"
                                    checked={formData.preferences.resultatsDebats}
                                    onChange={handlePreferenceChange}
                                />
                                <span>🏆 Résultats des compétitions</span>
                            </label>

                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="offresFormation"
                                    checked={formData.preferences.offresFormation}
                                    onChange={handlePreferenceChange}
                                />
                                <span>📚 Offres de formation exclusive</span>
                            </label>

                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="newsletter"
                                    checked={formData.preferences.newsletter}
                                    onChange={handlePreferenceChange}
                                />
                                <span>📰 Newsletter et actualités</span>
                            </label>
                        </div>
                    </div>

                    <div className="benefits-section">
                        <h3>🎁 En vous inscrivant, vous bénéficiez de :</h3>
                        <ul>
                            <li>✨ Accès prioritaire aux informations sur les débats</li>
                            <li>💰 Offres spéciales sur nos formations (dont notre formation à 10 000 FCFA)</li>
                            <li>🎯 Conseils et astuces en éloquence</li>
                            <li>🌟 Invitations à des événements exclusifs</li>
                        </ul>
                    </div>

                    <button type="submit" disabled={loading} className="submit-btn">
                        {loading ? '⏳ Inscription en cours...' : '✅ S\'inscrire gratuitement'}
                    </button>

                    <p className="privacy-note">
                        🔒 Vos données sont protégées. Vous pouvez vous désabonner à tout moment.
                    </p>
                </form>
            </div>
        </div>
    );
}
