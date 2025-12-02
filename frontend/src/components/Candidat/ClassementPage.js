import React, { useState, useEffect } from 'react';
import { candidatService } from '../../services/api';
import { formatCategorie } from '../../formatters';
import './ClassementPage.css';

const ClassementPage = () => {
    const [categorie, setCategorie] = useState('Primaire');
    const [classement, setClassement] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        page: 1,
        totalPages: 1
    });

    const categories = ['Primaire', 'College/Lycee', 'Universitaire'];

    useEffect(() => {
        fetchClassement();
    }, [categorie]);

    const fetchClassement = async (page = 1) => {
        setLoading(true);
        setError('');

        try {
            const response = await candidatService.getClassement(categorie, {
                page,
                limit: 50
            });

            if (response.data.success) {
                setClassement(response.data.classement);
                setStats({
                    total: response.data.total,
                    page: response.data.page,
                    totalPages: response.data.totalPages
                });
            }
        } catch (err) {
            console.error('Erreur récupération classement:', err);
            setError(err.response?.data?.error || 'Erreur lors du chargement du classement');
        } finally {
            setLoading(false);
        }
    };

    const handleCategorieChange = (newCategorie) => {
        setCategorie(newCategorie);
    };

    const getMedalIcon = (rang) => {
        switch (rang) {
            case 1:
                return '🥇';
            case 2:
                return '🥈';
            case 3:
                return '🥉';
            default:
                return `#${rang}`;
        }
    };

    const getProgressBarColor = (tauxVictoire) => {
        if (tauxVictoire >= 70) return '#27ae60';
        if (tauxVictoire >= 50) return '#f39c12';
        return '#e74c3c';
    };

    return (
        <div className="classement-page">
            <div className="container">
                <div className="classement-header">
                    <h1>🏆 Classement Général</h1>
                    <p className="subtitle">Les meilleurs débatteurs par catégorie</p>
                </div>

                {/* Sélecteur de catégorie */}
                <div className="category-selector">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`category-btn ${categorie === cat ? 'active' : ''}`}
                            onClick={() => handleCategorieChange(cat)}
                        >
                            {formatCategorie(cat)}
                        </button>
                    ))}
                </div>

                {/* Statistiques */}
                {!loading && classement.length > 0 && (
                    <div className="stats-bar">
                        <div className="stat-item">
                            <span className="stat-label">Total Candidats:</span>
                            <span className="stat-value">{stats.total}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Catégorie:</span>
                            <span className="stat-value">{formatCategorie(categorie)}</span>
                        </div>
                    </div>
                )}

                {/* Messages d'erreur */}
                {error && (
                    <div className="error-message">
                        ❌ {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Chargement du classement...</p>
                    </div>
                )}

                {/* Classement */}
                {!loading && !error && classement.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">📊</div>
                        <h3>Aucun candidat dans cette catégorie</h3>
                        <p>Le classement sera disponible dès qu'il y aura des candidats admissibles.</p>
                    </div>
                )}

                {!loading && !error && classement.length > 0 && (
                    <div className="classement-container">
                        {/* Podium (Top 3) */}
                        {classement.length >= 3 && (
                            <div className="podium">
                                {/* 2ème place */}
                                <div className="podium-item second">
                                    <div className="medal">🥈</div>
                                    <div className="podium-info">
                                        <h3>{classement[1].prenom} {classement[1].nom}</h3>
                                        <div className="score">{classement[1].scoreFinal}/20</div>
                                        <div className="victories">{classement[1].nombreVictoires} victoires</div>
                                    </div>
                                </div>

                                {/* 1ère place */}
                                <div className="podium-item first">
                                    <div className="medal">🥇</div>
                                    <div className="crown">👑</div>
                                    <div className="podium-info">
                                        <h3>{classement[0].prenom} {classement[0].nom}</h3>
                                        <div className="score">{classement[0].scoreFinal}/20</div>
                                        <div className="victories">{classement[0].nombreVictoires} victoires</div>
                                    </div>
                                </div>

                                {/* 3ème place */}
                                <div className="podium-item third">
                                    <div className="medal">🥉</div>
                                    <div className="podium-info">
                                        <h3>{classement[2].prenom} {classement[2].nom}</h3>
                                        <div className="score">{classement[2].scoreFinal}/20</div>
                                        <div className="victories">{classement[2].nombreVictoires} victoires</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Liste complète */}
                        <div className="classement-list">
                            <h2>Classement Complet</h2>
                            <div className="table-responsive">
                                <table className="classement-table">
                                    <thead>
                                        <tr>
                                            <th>Rang</th>
                                            <th>Candidat</th>
                                            <th>Score</th>
                                            <th>Débats</th>
                                            <th>Victoires</th>
                                            <th>Taux de Victoire</th>
                                            <th>Solde</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classement.map((candidat) => (
                                            <tr key={candidat._id} className={candidat.rang <= 3 ? 'top-three' : ''}>
                                                <td className="rang-cell">
                                                    <span className="rang-badge">
                                                        {getMedalIcon(candidat.rang)}
                                                    </span>
                                                </td>
                                                <td className="candidat-cell">
                                                    <div className="candidat-name">
                                                        {candidat.prenom} {candidat.nom}
                                                    </div>
                                                    {candidat.tropheeActuel && (
                                                        <div className="trophee-badge">
                                                            🏆 {candidat.tropheeActuel.nom}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="score-cell">
                                                    <div className="score-badge">
                                                        {candidat.scoreFinal}/20
                                                    </div>
                                                </td>
                                                <td>{candidat.nombreDebatsTotal}</td>
                                                <td className="victoires-cell">
                                                    <span className="victoires-badge">
                                                        {candidat.nombreVictoires}
                                                    </span>
                                                </td>
                                                <td className="taux-cell">
                                                    <div className="progress-bar-container">
                                                        <div
                                                            className="progress-bar"
                                                            style={{
                                                                width: `${candidat.tauxVictoire}%`,
                                                                backgroundColor: getProgressBarColor(parseFloat(candidat.tauxVictoire))
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="taux-text">{candidat.tauxVictoire}%</span>
                                                </td>
                                                <td className="solde-cell">
                                                    {candidat.soldeActuel.toLocaleString()} FCFA
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {stats.totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => fetchClassement(stats.page - 1)}
                                    disabled={stats.page === 1}
                                    className="pagination-btn"
                                >
                                    ← Précédent
                                </button>
                                <span className="page-info">
                                    Page {stats.page} sur {stats.totalPages}
                                </span>
                                <button
                                    onClick={() => fetchClassement(stats.page + 1)}
                                    disabled={stats.page === stats.totalPages}
                                    className="pagination-btn"
                                >
                                    Suivant →
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassementPage;
