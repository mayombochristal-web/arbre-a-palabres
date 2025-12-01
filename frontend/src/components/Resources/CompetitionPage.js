import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResourcePages.css';

const CompetitionPage = () => {
    const navigate = useNavigate();

    const rankingFactors = [
        {
            title: "Score final",
            icon: "📊",
            weight: "40%",
            description: "Votre score cumulé de tous vos débats",
            tips: [
                "Gagnez des débats pour augmenter votre score",
                "La qualité de vos arguments compte",
                "Le style et la présentation sont évalués"
            ]
        },
        {
            title: "Taux de victoire",
            icon: "🏅",
            weight: "30%",
            description: "Pourcentage de débats remportés",
            tips: [
                "Visez un taux supérieur à 60%",
                "Préparez-vous bien avant chaque débat",
                "Analysez vos défaites pour vous améliorer"
            ]
        },
        {
            title: "Nombre de victoires",
            icon: "🎯",
            weight: "20%",
            description: "Total de débats gagnés",
            tips: [
                "Participez régulièrement",
                "Chaque victoire compte",
                "Visez la constance"
            ]
        },
        {
            title: "Solde actuel",
            icon: "💎",
            weight: "10%",
            description: "Vos gains accumulés",
            tips: [
                "Gérez bien vos gains",
                "Réinvestissez dans des débats défi",
                "Construisez votre capital"
            ]
        }
    ];

    const strategies = [
        {
            level: "Débutant",
            color: "#4ECDC4",
            goals: [
                "Participer à 5 débats minimum",
                "Remporter au moins 2 victoires",
                "Atteindre un score de 50 points"
            ],
            rewards: "Trophée Bronze + Visibilité"
        },
        {
            level: "Intermédiaire",
            color: "#45B7D1",
            goals: [
                "Maintenir un taux de victoire > 50%",
                "Accumuler 10 victoires",
                "Score total > 200 points"
            ],
            rewards: "Trophée Argent + Débats premium"
        },
        {
            level: "Avancé",
            color: "#96CEB4",
            goals: [
                "Taux de victoire > 70%",
                "20+ victoires",
                "Top 10 de votre catégorie"
            ],
            rewards: "Trophée Or + Reconnaissance"
        },
        {
            level: "Expert",
            color: "#FFD700",
            goals: [
                "Taux de victoire > 80%",
                "50+ victoires",
                "Top 3 de votre catégorie"
            ],
            rewards: "Trophée Platine + Statut légende"
        }
    ];

    return (
        <div className="resource-page">
            <div className="resource-header competition-header">
                <button className="btn-back" onClick={() => navigate('/')}>
                    ← Retour à l'accueil
                </button>
                <h1>🏆 Système de compétition</h1>
                <p className="subtitle">Grimpez dans le classement et devenez une légende</p>
            </div>

            <div className="container">
                <section className="ranking-section">
                    <h2>Comment fonctionne le classement ?</h2>
                    <div className="ranking-grid">
                        {rankingFactors.map((factor, index) => (
                            <div key={index} className="ranking-card">
                                <div className="ranking-icon">{factor.icon}</div>
                                <h3>{factor.title}</h3>
                                <div className="ranking-weight">Poids: {factor.weight}</div>
                                <p className="ranking-description">{factor.description}</p>
                                <ul className="ranking-tips">
                                    {factor.tips.map((tip, i) => (
                                        <li key={i}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="progression-section">
                    <h2>Niveaux de progression</h2>
                    <div className="progression-grid">
                        {strategies.map((strategy, index) => (
                            <div key={index} className="progression-card" style={{ borderLeftColor: strategy.color }}>
                                <div className="progression-level" style={{ color: strategy.color }}>
                                    {strategy.level}
                                </div>
                                <h3>Objectifs</h3>
                                <ul className="progression-goals">
                                    {strategy.goals.map((goal, i) => (
                                        <li key={i}>{goal}</li>
                                    ))}
                                </ul>
                                <div className="progression-rewards">
                                    <strong>Récompenses:</strong> {strategy.rewards}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="tips-section">
                    <h2>💡 Conseils de champions</h2>
                    <div className="champion-tips">
                        <div className="tip-card">
                            <h3>Analysez vos adversaires</h3>
                            <p>Consultez le profil de vos adversaires avant le débat pour comprendre leur style</p>
                        </div>
                        <div className="tip-card">
                            <h3>Spécialisez-vous</h3>
                            <p>Devenez expert dans certains types de sujets pour maximiser vos chances</p>
                        </div>
                        <div className="tip-card">
                            <h3>Apprenez de vos défaites</h3>
                            <p>Chaque défaite est une opportunité d'apprentissage</p>
                        </div>
                        <div className="tip-card">
                            <h3>Restez actif</h3>
                            <p>La régularité est la clé du succès dans le classement</p>
                        </div>
                    </div>
                </section>

                <section className="leaderboard-preview">
                    <h2>Consultez le classement</h2>
                    <p>Voyez où vous vous situez par rapport aux meilleurs orateurs</p>
                    <button className="btn-primary large" onClick={() => navigate('/classement')}>
                        Voir le classement
                    </button>
                </section>
            </div>
        </div>
    );
};

export default CompetitionPage;
