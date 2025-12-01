import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResourcePages.css';

const CulturePage = () => {
    const navigate = useNavigate();

    return (
        <div className="resource-page">
            <div className="resource-header culture-header">
                <button className="btn-back" onClick={() => navigate('/')}>
                    ← Retour à l'accueil
                </button>
                <h1>🌍 L'Arbre à Palabres</h1>
                <p className="subtitle">Valorisez la tradition africaine du dialogue</p>
            </div>

            <div className="container">
                <section className="culture-intro">
                    <div className="intro-content">
                        <h2>Une tradition millénaire</h2>
                        <p className="lead">
                            L'arbre à palabres est un lieu de rassemblement traditionnel en Afrique où la communauté
                            se réunit pour discuter, débattre et résoudre les conflits par le dialogue.
                        </p>
                    </div>
                </section>

                <section className="values-section">
                    <h2>Les valeurs de l'Arbre à Palabres</h2>
                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-icon">🤝</div>
                            <h3>Respect mutuel</h3>
                            <p>Chaque voix compte et mérite d'être entendue avec attention et respect</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">💬</div>
                            <h3>Dialogue constructif</h3>
                            <p>Le but n'est pas de vaincre mais de comprendre et de trouver des solutions</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">👥</div>
                            <h3>Sagesse collective</h3>
                            <p>La communauté est plus sage que l'individu seul</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">⚖️</div>
                            <h3>Justice et équité</h3>
                            <p>Tous sont égaux sous l'arbre, du plus jeune au plus âgé</p>
                        </div>
                    </div>
                </section>

                <section className="modern-adaptation">
                    <h2>Adaptation moderne</h2>
                    <div className="adaptation-content">
                        <div className="adaptation-card">
                            <h3>🌳 Tradition</h3>
                            <ul>
                                <li>Rassemblement physique sous un arbre</li>
                                <li>Discussions orales en cercle</li>
                                <li>Anciens comme médiateurs</li>
                                <li>Décisions par consensus</li>
                            </ul>
                        </div>
                        <div className="arrow">→</div>
                        <div className="adaptation-card">
                            <h3>💻 Plateforme digitale</h3>
                            <ul>
                                <li>Espace virtuel accessible à tous</li>
                                <li>Débats structurés et notés</li>
                                <li>Jury et modérateurs</li>
                                <li>Récompenses pour l'excellence</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="impact-section">
                    <h2>Impact sur la jeunesse gabonaise</h2>
                    <div className="impact-grid">
                        <div className="impact-card">
                            <h3>Préservation culturelle</h3>
                            <p>Transmettre les valeurs africaines aux nouvelles générations</p>
                        </div>
                        <div className="impact-card">
                            <h3>Développement personnel</h3>
                            <p>Renforcer la confiance en soi et les compétences oratoires</p>
                        </div>
                        <div className="impact-card">
                            <h3>Cohésion sociale</h3>
                            <p>Créer des liens entre jeunes de différents horizons</p>
                        </div>
                        <div className="impact-card">
                            <h3>Innovation</h3>
                            <p>Allier tradition et technologie pour un avenir meilleur</p>
                        </div>
                    </div>
                </section>

                <section className="cta-section">
                    <h2>Rejoignez la communauté</h2>
                    <p>Participez à cette tradition vivante et contribuez au dialogue gabonais</p>
                    <button className="btn-primary large" onClick={() => navigate('/inscription')}>
                        Devenir membre
                    </button>
                </section>
            </div>
        </div>
    );
};

export default CulturePage;
