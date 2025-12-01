import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResourcePages.css';

const EducationPage = () => {
    const navigate = useNavigate();

    const skills = [
        {
            title: "Structurer son argumentation",
            icon: "📝",
            tips: [
                "Utilisez la méthode QQOQCP (Qui, Quoi, Où, Quand, Comment, Pourquoi)",
                "Commencez par une thèse claire et concise",
                "Développez 3 arguments principaux maximum",
                "Concluez en rappelant votre position"
            ]
        },
        {
            title: "Maîtriser l'expression orale",
            icon: "🎤",
            tips: [
                "Articulez clairement chaque mot",
                "Variez le ton et le rythme de votre voix",
                "Utilisez des pauses stratégiques",
                "Maintenez un contact visuel avec l'audience"
            ]
        },
        {
            title: "Gérer le stress",
            icon: "🧘",
            tips: [
                "Respirez profondément avant de parler",
                "Préparez-vous en répétant à voix haute",
                "Visualisez votre succès",
                "Transformez le stress en énergie positive"
            ]
        },
        {
            title: "Contre-argumenter efficacement",
            icon: "⚔️",
            tips: [
                "Écoutez attentivement votre adversaire",
                "Identifiez les failles dans son raisonnement",
                "Répondez avec des faits et des exemples",
                "Restez courtois et respectueux"
            ]
        }
    ];

    const exercises = [
        {
            title: "Exercice quotidien",
            description: "Argumentez sur un sujet d'actualité pendant 2 minutes devant un miroir"
        },
        {
            title: "Lecture active",
            description: "Lisez des articles de presse et résumez les arguments principaux"
        },
        {
            title: "Débat avec des amis",
            description: "Organisez des mini-débats informels pour vous entraîner"
        }
    ];

    return (
        <div className="resource-page">
            <div className="resource-header">
                <button className="btn-back" onClick={() => navigate('/')}>
                    ← Retour à l'accueil
                </button>
                <h1>🎓 Développez vos compétences</h1>
                <p className="subtitle">Maîtrisez l'art de l'argumentation et de l'expression orale</p>
            </div>

            <div className="container">
                <section className="skills-section">
                    <h2>Compétences clés</h2>
                    <div className="skills-grid">
                        {skills.map((skill, index) => (
                            <div key={index} className="skill-card">
                                <div className="skill-icon">{skill.icon}</div>
                                <h3>{skill.title}</h3>
                                <ul className="tips-list">
                                    {skill.tips.map((tip, i) => (
                                        <li key={i}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="exercises-section">
                    <h2>Exercices pratiques</h2>
                    <div className="exercises-grid">
                        {exercises.map((exercise, index) => (
                            <div key={index} className="exercise-card">
                                <h3>{exercise.title}</h3>
                                <p>{exercise.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="cta-section">
                    <h2>Prêt à mettre en pratique ?</h2>
                    <p>Inscrivez-vous et participez à votre premier débat</p>
                    <button className="btn-primary large" onClick={() => navigate('/inscription')}>
                        S'inscrire maintenant
                    </button>
                </section>
            </div>
        </div>
    );
};

export default EducationPage;
