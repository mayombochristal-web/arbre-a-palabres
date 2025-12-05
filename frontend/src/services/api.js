import axios from 'axios';

import config from '../config';

const API_BASE_URL = config.API_URL;

// Configuration d'axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercepteur pour les requêtes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 sec initial delay

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Intercepteur pour les requêtes - inchangé
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête API:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses avec Retry Logic
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Retry logic pour les erreurs réseau ou 503 (Service Unavailable)
    if (
      (error.message === 'Network Error' || error.response?.status === 503 || error.code === 'ECONNABORTED') &&
      !originalRequest._retry &&
      (originalRequest._retryCount || 0) < MAX_RETRIES
    ) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      const delay = RETRY_DELAY * Math.pow(2, originalRequest._retryCount - 1); // Exponential backoff
      console.log(`⚠️ Tentative de reconnexion ${originalRequest._retryCount}/${MAX_RETRIES} dans ${delay}ms...`);

      await sleep(delay);
      return api(originalRequest);
    }

    console.error(`❌ Erreur ${error.response?.status} ${error.config?.url}:`, error.response?.data);

    // Gestion des erreurs spécifiques
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      if (error.response.status === 401 && !originalRequest.url.includes('/auth/login')) {
        // Don't redirect if it's a login attempt failing
        localStorage.removeItem('authToken');
        window.location.href = '/connexion';
      }

      if (error.response.status === 500) {
        return Promise.reject(new Error('Une erreur serveur est survenue. Veuillez réessayer plus tard.'));
      }

      // Retourner le message d'erreur du backend s'il existe
      const message = error.response.data?.error || error.response.data?.message || 'Une erreur est survenue.';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // La requête a été faite mais pas de réponse (Erreur réseau)
      console.error('Pas de réponse du serveur', error.request);
      return Promise.reject(new Error('Impossible de contacter le serveur. Vérifiez votre connexion internet ou le serveur démarre (attendre ~1min).'));
    } else {
      // Erreur lors de la configuration de la requête
      return Promise.reject(new Error(error.message || 'Une erreur inconnue est survenue.'));
    }
  }
);

// Services pour les candidats
export const candidatService = {
  // Inscription
  inscrire: (candidatData) => {
    const formData = new FormData();
    Object.keys(candidatData).forEach(key => {
      if (key === 'fichiers') {
        Object.keys(candidatData.fichiers).forEach(fileKey => {
          formData.append(fileKey, candidatData.fichiers[fileKey]);
        });
      } else {
        formData.append(key, candidatData[key]);
      }
    });

    return api.post('/candidats/inscription', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Récupération
  getAll: (params = {}) => api.get('/candidats', { params }),
  getById: (id) => api.get(`/candidats/${id}`),
  getStatistiques: (id) => api.get(`/candidats/${id}/statistiques`),

  // Mise à jour
  update: (id, candidatData) => api.put(`/candidats/${id}`, candidatData),
  updateScores: (id, scores) => api.patch(`/candidats/${id}/scores`, scores),
  validerPaiement: (id) => api.patch(`/candidats/${id}/valider-paiement`),

  // Classement
  getClassement: (categorie, params = {}) =>
    api.get(`/candidats/classement/${categorie}`, { params })
};

// Services pour les débats
export const debatService = {
  // Création
  createStandard: (debatData) => api.post('/debats/standard', debatData),
  createDefi: (defiData) => api.post('/debats/defi', defiData),

  // Récupération
  getAll: (params = {}) => api.get('/debats', { params }),
  getById: (id) => api.get(`/debats/${id}`),

  // Actions
  demarrer: (id) => api.patch(`/debats/${id}/demarrer`),
  cloturer: (id, vainqueurId) => api.patch(`/debats/${id}/cloturer`, { vainqueurId }),
  updateScores: (id, scores) => api.patch(`/debats/${id}/scores`, { scores }),

  // Statistiques
  getStatistiques: () => api.get('/debats/statistiques/general')
};

// Services pour les transactions
export const transactionService = {
  // Retraits
  demanderRetrait: (retraitData) => api.post('/transactions/retrait', retraitData),
  validerRetrait: (id) => api.patch(`/transactions/${id}/valider`),
  rejeterRetrait: (id, raison) => api.patch(`/transactions/${id}/rejeter`, { raison }),

  // Récupération
  getByCandidat: (candidatId, params = {}) =>
    api.get(`/transactions/candidat/${candidatId}`, { params }),
  getAll: (params = {}) => api.get('/transactions', { params })
};

// Services pour les trophées
export const tropheeService = {
  // Création et gestion
  create: (tropheeData) => api.post('/trophees', tropheeData),
  getAll: (params = {}) => api.get('/trophees', { params }),
  getHistorique: (id) => api.get(`/trophees/${id}/historique`),

  // Actions
  attribuer: (id, candidatId) => api.patch(`/trophees/${id}/attribuer`, { candidatId }),
  retirer: (id, raison) => api.patch(`/trophees/${id}/retirer`, { raison })
};

// Service de santé
export const healthService = {
  check: () => api.get('/health')
};

// Export par défaut pour une utilisation personnalisée
export default api;