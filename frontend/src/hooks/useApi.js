import { useQuery, useMutation, useQueryClient } from 'react-query';
import { candidatService, debatService, transactionService } from '../services/api';

// ============================================
// HOOKS POUR LES CANDIDATS
// ============================================

/**
 * Hook pour récupérer tous les candidats avec pagination
 * @param {Object} params - Paramètres de pagination et filtres
 * @param {number} params.page - Numéro de page (défaut: 1)
 * @param {number} params.limit - Nombre d'éléments par page (défaut: 20)
 * @param {string} params.categorie - Filtre par catégorie
 * @param {string} params.statut - Filtre par statut
 */
export const useCandidats = (params = {}) => {
    return useQuery(
        ['candidats', params],
        () => candidatService.getAll(params),
        {
            staleTime: 3 * 60 * 1000, // 3 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
            keepPreviousData: true, // Garde les données précédentes pendant le chargement
            select: (response) => response.data
        }
    );
};

/**
 * Hook pour récupérer un candidat par ID
 */
export const useCandidat = (id, options = {}) => {
    return useQuery(
        ['candidat', id],
        () => candidatService.getById(id),
        {
            enabled: !!id, // Ne lance la requête que si l'ID existe
            staleTime: 5 * 60 * 1000,
            select: (response) => response.data,
            ...options
        }
    );
};

/**
 * Hook pour récupérer le classement par catégorie
 */
export const useClassement = (categorie, params = {}) => {
    return useQuery(
        ['classement', categorie, params],
        () => candidatService.getClassement(categorie, params),
        {
            enabled: !!categorie,
            staleTime: 2 * 60 * 1000, // 2 minutes (classement change fréquemment)
            select: (response) => response.data
        }
    );
};

/**
 * Hook pour récupérer les statistiques d'un candidat
 */
export const useCandidatStats = (id) => {
    return useQuery(
        ['candidat-stats', id],
        () => candidatService.getStatistiques(id),
        {
            enabled: !!id,
            staleTime: 5 * 60 * 1000,
            select: (response) => response.data
        }
    );
};

// ============================================
// HOOKS POUR LES DÉBATS
// ============================================

/**
 * Hook pour récupérer tous les débats avec pagination
 */
export const useDebats = (params = {}) => {
    return useQuery(
        ['debats', params],
        () => debatService.getAll(params),
        {
            staleTime: 2 * 60 * 1000, // 2 minutes
            keepPreviousData: true,
            select: (response) => response.data
        }
    );
};

/**
 * Hook pour récupérer un débat par ID
 */
export const useDebat = (id, options = {}) => {
    return useQuery(
        ['debat', id],
        () => debatService.getById(id),
        {
            enabled: !!id,
            staleTime: 1 * 60 * 1000, // 1 minute (débats actifs changent vite)
            refetchInterval: options.autoRefresh ? 30000 : false, // Auto-refresh toutes les 30s si activé
            select: (response) => response.data,
            ...options
        }
    );
};

/**
 * Hook pour récupérer les statistiques générales des débats
 */
export const useDebatsStats = () => {
    return useQuery(
        ['debats-stats'],
        () => debatService.getStatistiques(),
        {
            staleTime: 5 * 60 * 1000,
            select: (response) => response.data
        }
    );
};

// ============================================
// HOOKS POUR LES TRANSACTIONS
// ============================================

/**
 * Hook pour récupérer les transactions d'un candidat
 */
export const useTransactions = (candidatId, params = {}) => {
    return useQuery(
        ['transactions', candidatId, params],
        () => transactionService.getByCandidat(candidatId, params),
        {
            enabled: !!candidatId,
            staleTime: 3 * 60 * 1000,
            keepPreviousData: true,
            select: (response) => response.data
        }
    );
};

/**
 * Hook pour récupérer toutes les transactions (admin)
 */
export const useAllTransactions = (params = {}) => {
    return useQuery(
        ['all-transactions', params],
        () => transactionService.getAll(params),
        {
            staleTime: 2 * 60 * 1000,
            keepPreviousData: true,
            select: (response) => response.data
        }
    );
};

// ============================================
// MUTATIONS (Actions avec invalidation du cache)
// ============================================

/**
 * Hook pour créer un débat
 */
export const useCreateDebat = () => {
    const queryClient = useQueryClient();

    return useMutation(
        (debatData) => debatService.createStandard(debatData),
        {
            onSuccess: () => {
                // Invalide le cache des débats pour forcer un refresh
                queryClient.invalidateQueries(['debats']);
                queryClient.invalidateQueries(['debats-stats']);
            }
        }
    );
};

/**
 * Hook pour clôturer un débat
 */
export const useCloturerDebat = () => {
    const queryClient = useQueryClient();

    return useMutation(
        ({ id, vainqueurId }) => debatService.cloturer(id, vainqueurId),
        {
            onSuccess: (data, variables) => {
                // Invalide les caches pertinents
                queryClient.invalidateQueries(['debat', variables.id]);
                queryClient.invalidateQueries(['debats']);
                queryClient.invalidateQueries(['candidat', variables.vainqueurId]);
                queryClient.invalidateQueries(['classement']);
                queryClient.invalidateQueries(['transactions']);
            }
        }
    );
};

/**
 * Hook pour valider un paiement
 */
export const useValiderPaiement = () => {
    const queryClient = useQueryClient();

    return useMutation(
        (candidatId) => candidatService.validerPaiement(candidatId),
        {
            onSuccess: (data, candidatId) => {
                queryClient.invalidateQueries(['candidat', candidatId]);
                queryClient.invalidateQueries(['candidats']);
            }
        }
    );
};

/**
 * Hook pour demander un retrait
 */
export const useDemanderRetrait = () => {
    const queryClient = useQueryClient();

    return useMutation(
        (retraitData) => transactionService.demanderRetrait(retraitData),
        {
            onSuccess: (data, variables) => {
                queryClient.invalidateQueries(['transactions', variables.candidatId]);
                queryClient.invalidateQueries(['candidat', variables.candidatId]);
            }
        }
    );
};

/**
 * Hook pour mettre à jour les scores d'un débat
 */
export const useUpdateScoresDebat = () => {
    const queryClient = useQueryClient();

    return useMutation(
        ({ debatId, scores }) => debatService.updateScores(debatId, scores),
        {
            onSuccess: (data, variables) => {
                queryClient.invalidateQueries(['debat', variables.debatId]);
            }
        }
    );
};

// ============================================
// HOOKS UTILITAIRES
// ============================================

/**
 * Hook pour précharger les données d'un candidat
 * Utile pour améliorer l'UX lors de la navigation
 */
export const usePrefetchCandidat = () => {
    const queryClient = useQueryClient();

    return (id) => {
        queryClient.prefetchQuery(
            ['candidat', id],
            () => candidatService.getById(id),
            {
                staleTime: 5 * 60 * 1000
            }
        );
    };
};

/**
 * Hook pour précharger les données d'un débat
 */
export const usePrefetchDebat = () => {
    const queryClient = useQueryClient();

    return (id) => {
        queryClient.prefetchQuery(
            ['debat', id],
            () => debatService.getById(id),
            {
                staleTime: 1 * 60 * 1000
            }
        );
    };
};
