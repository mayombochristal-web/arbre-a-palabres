import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Configuration d'axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercepteur pour les requêtes
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

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ Erreur ${error.response?.status} ${error.config?.url}:`, error.response?.data);

    // Gestion des erreurs spécifiques
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/connexion';
    }

    if (error.response?.status === 500) {
      // Erreur serveur
      return Promise.reject(new Error('Une erreur serveur est survenue. Veuillez réessayer.'));
    }

    return Promise.reject(error.response?.data || error);
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