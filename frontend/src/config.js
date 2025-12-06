const config = {
    // URL Backend modifiée selon demande utilisateur
    API_URL: process.env.REACT_APP_API_URL || 'https://arbre-a-palabres-backend.onrender.com/api',
    // Autres configurations globales
    DEFAULT_PAGINATION: 10,
};

export default config;
