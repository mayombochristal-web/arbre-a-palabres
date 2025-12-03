import React, { useState } from 'react';
import { useCandidats, useDebats, usePrefetchCandidat } from '../hooks/useApi';
import './CandidatListOptimized.css';

/**
 * Exemple de composant optimisé utilisant React Query
 * Démontre:
 * - Pagination
 * - Cache automatique
 * - Prefetching au survol
 * - Loading states
 * - Error handling
 */
const CandidatListOptimized = () => {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        categorie: '',
        statut: ''
    });

    // Hook React Query avec pagination et filtres
    const {
        data,
        isLoading,
        isError,
        error,
        isFetching,
        isPreviousData
    } = useCandidats({
        page,
        limit: 20,
        ...filters
    });

    // Hook pour précharger les données au survol
    const prefetchCandidat = usePrefetchCandidat();

    // Gestion du changement de page
    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Gestion des filtres
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setPage(1); // Reset à la page 1 lors du changement de filtre
    };

    // Loading initial
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Chargement des candidats...</p>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="error-container">
                <h3>❌ Erreur</h3>
                <p>{error.message}</p>
                <button onClick={() => window.location.reload()}>
                    Réessayer
                </button>
            </div>
        );
    }

    const { candidats, total, totalPages, currentPage } = data || {};

    return (
        <div className="candidat-list-optimized">
            <div className="header">
                <h1>Liste des Candidats</h1>
                <p className="total-count">
                    {total} candidat{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
                </p>
            </div>

            {/* Filtres */}
            <div className="filters">
                <div className="filter-group">
                    <label>Catégorie:</label>
                    <select
                        value={filters.categorie}
                        onChange={(e) => handleFilterChange('categorie', e.target.value)}
                    >
                        <option value="">Toutes</option>
                        <option value="Primaire">Primaire</option>
                        <option value="College/Lycee">Collège/Lycée</option>
                        <option value="Universitaire">Universitaire</option>
                        <option value="Entrepreneur">Entrepreneur</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Statut:</label>
                    <select
                        value={filters.statut}
                        onChange={(e) => handleFilterChange('statut', e.target.value)}
                    >
                        <option value="">Tous</option>
                        <option value="EN_ATTENTE">En attente</option>
                        <option value="ADMISSIBLE">Admissible</option>
                        <option value="REJETE">Rejeté</option>
                    </select>
                </div>
            </div>

            {/* Indicateur de chargement pendant le fetch */}
            {isFetching && !isLoading && (
                <div className="fetching-indicator">
                    🔄 Mise à jour...
                </div>
            )}

            {/* Liste des candidats */}
            <div className={`candidats-grid ${isPreviousData ? 'loading' : ''}`}>
                {candidats && candidats.length > 0 ? (
                    candidats.map((candidat) => (
                        <div
                            key={candidat._id}
                            className="candidat-card"
                            onMouseEnter={() => prefetchCandidat(candidat._id)}
                            onClick={() => window.location.href = `/candidats/${candidat._id}`}
                        >
                            <div className="candidat-header">
                                <h3>{candidat.prenom} {candidat.nom}</h3>
                                <span className={`badge badge-${candidat.statutAdministratif.toLowerCase()}`}>
                                    {candidat.statutAdministratif}
                                </span>
                            </div>

                            <div className="candidat-info">
                                <p><strong>Catégorie:</strong> {candidat.categorie}</p>
                                <p><strong>Email:</strong> {candidat.email}</p>
                                <p><strong>Score:</strong> {candidat.scoreFinal || 0}</p>
                                <p><strong>Victoires:</strong> {candidat.nombreVictoires || 0}</p>
                                <p><strong>Solde:</strong> {candidat.soldeActuel || 0} FCFA</p>
                            </div>

                            {candidat.fraisInscriptionPayes && (
                                <div className="paid-badge">
                                    ✅ Frais payés
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <p>Aucun candidat trouvé avec ces filtres.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1 || isPreviousData}
                        className="pagination-btn"
                    >
                        ← Précédent
                    </button>

                    <div className="pagination-info">
                        Page {currentPage} sur {totalPages}
                    </div>

                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages || isPreviousData}
                        className="pagination-btn"
                    >
                        Suivant →
                    </button>
                </div>
            )}

            {/* Info cache */}
            <div className="cache-info">
                💡 <strong>Optimisé avec React Query:</strong> Les données sont mises en cache pendant 3 minutes.
                Survolez une carte pour précharger les détails du candidat.
            </div>
        </div>
    );
};

export default CandidatListOptimized;
