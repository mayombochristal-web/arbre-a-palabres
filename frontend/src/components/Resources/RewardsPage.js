import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResourcePages.css';

const RewardsPage = () => {
    const navigate = useNavigate();

    const strategies = [
        {
            title: "Choisir la bonne catégorie",
            icon: "🎯",
            description: "Inscrivez-vous dans la catégorie correspondant à votre âge et niveau",
            earnings: "Frais d'inscription: 500-5000 FCFA",
            tips: [
                "Primaire: 500 FCFA → Gain possible: 1500 FCFA",
                "Collège/Lycée: 1000 FCFA → Gain possible: 3000 FCFA",
                "Universitaire: 2000 FCFA → Gain possible: 6000 FCFA",
                "Entrepreneur: 5000 FCFA → Gain possible: 15000 FCFA"
            ]
        },
        {
            title: "Participer régulièrement",
            icon: "📈",
            description: "Plus vous participez, plus vous gagnez d'expérience et de revenus",
            earnings: "Potentiel: Illimité",
            tips: [
                "Chaque victoire augmente votre score",
                "Montez dans le classement pour plus de visibilité",
                "Accédez à des débats avec des cagnottes plus importantes",
                "Développez votre réputation"
            ]
        },
        {
            title: "Maîtriser les débats défi",
            icon: "⚡",
            description: "Les débats défi offrent des gains plus élevés",
            earnings: "Gains variables selon la mise",
            tips: [
                "Mise minimum recommandée: votre solde actuel",
                "75% de la cagnotte pour le vainqueur",
                "Risque plus élevé mais récompenses plus grandes",
                "Assurez-vous d'être bien préparé"
            ]
        },
        {
            title: "Optimiser votre profil",
            icon: "⭐",
            description: "Un bon profil attire plus d'opportunités",
            earnings: "Impact indirect sur vos gains",
            tips: [
                "Maintenez un taux de victoire élevé",
                "Accumulez des trophées",
                "Participez aux débats de votre catégorie",
                "Soyez actif et régulier"
            ]
        }
    ];

    const earningsCalculator = {
        primaire: { fee: 500, win: 1500, roi: "200%" },
        college: { fee: 1000, win: 3000, roi: "200%" },
        universitaire: { fee: 2000, win: 6000, roi: "200%" },
        entrepreneur: { fee: 5000, win: 15000, roi: "200%" }
    };

    return (
        <div className="resource-page">
            <div className="resource-header rewards-header">
                <button className="btn-back" onClick={() => navigate('/')}>
                    ← Retour à l'accueil
                </button>
                <h1>💰 Maximisez vos gains</h1>
                <p className="subtitle">Stratégies pour gagner plus d'argent avec vos débats</p>
            </div>

            <div className="container">
                <section className="earnings-overview">
                    <h2>Potentiel de gains par catégorie</h2>
                    <div className="earnings-grid">
                        <div className="earnings-card">
                            <h3>Primaire</h3>
                            <div className="earning-amount">1500 FCFA</div>
                            <div className="earning-detail">Investissement: 500 FCFA</div>
                            <div className="earning-roi">ROI: 200%</div>
                        </div>
                        <div className="earnings-card">
                            <h3>Collège/Lycée</h3>
                            <div className="earning-amount">3000 FCFA</div>
                            <div className="earning-detail">Investissement: 1000 FCFA</div>
                            <div className="earning-roi">ROI: 200%</div>
                        </div>
                        <div className="earnings-card">
                            <h3>Universitaire</h3>
                            <div className="earning-amount">6000 FCFA</div>
                            <div className="earning-detail">Investissement: 2000 FCFA</div>
                            <div className="earning-roi">ROI: 200%</div>
                        </div>
                        <div className="earnings-card featured">
                            <h3>Entrepreneur</h3>
                            <div className="earning-amount">15000 FCFA</div>
                            <div className="earning-detail">Investissement: 5000 FCFA</div>
                            <div className="earning-roi">ROI: 200%</div>
                        </div>
                    </div>
                </section>

                <section className="strategies-section">
                    <h2>Stratégies gagnantes</h2>
                    <div className="strategies-grid">
                        {strategies.map((strategy, index) => (
                            <div key={index} className="strategy-card">
                                <div className="strategy-icon">{strategy.icon}</div>
                                <h3>{strategy.title}</h3>
                                <p className="strategy-description">{strategy.description}</p>
                                <div className="strategy-earnings">{strategy.earnings}</div>
                                <ul className="strategy-tips">
                                    {strategy.tips.map((tip, i) => (
                                        <li key={i}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="tips-section">
                    <h2>💡 Conseils pour maximiser vos revenus</h2>
                    <div className="tips-grid">
                        <div className="tip-card">
                            <strong>Gestion du solde</strong>
                            <p>Ne misez jamais plus de 50% de votre solde dans un débat défi</p>
                        </div>
                        <div className="tip-card">
                            <strong>Préparation</strong>
                            <p>Préparez-vous bien pour chaque débat pour maximiser vos chances de victoire</p>
                        </div>
                        <div className="tip-card">
                            <strong>Régularité</strong>
                            <p>Participez régulièrement pour améliorer vos compétences et vos gains</p>
                        </div>
                    </div>
                </section>

                <section className="cta-section">
                    <h2>Commencez à gagner dès aujourd'hui</h2>
                    <div className="cta-buttons">
                        <button className="btn-primary large" onClick={() => navigate('/inscription')}>
                            S'inscrire
                        </button>
                        <button className="btn-secondary large" onClick={() => navigate('/debats')}>
                            Voir les débats
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default RewardsPage;
