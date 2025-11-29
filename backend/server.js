// ===============================================
// 1. CHARGEMENT DES VARIABLES D'ENVIRONNEMENT (DOIT ÊTRE LA PREMIÈRE LIGNE EXÉCUTABLE)
// ===============================================
require('dotenv').config();

// ===============================================
// 2. IMPORTATION DES DÉPENDANCES
// ===============================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

// Fichier de configuration de la base de données
const connectDB = require('./config/database');

// Importation des routes
const candidatsRoutes = require('./routes/candidats');
const debatsRoutes = require('./routes/debats');
const transactionsRoutes = require('./routes/transactions');
const tropheesRoutes = require('./routes/trophees');

// ===============================================
// 3. CONFIGURATION ET CONNEXION
// ===============================================

// Définition des variables d'environnement
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const UPLOAD_PATH = process.env.UPLOAD_PATH || 'uploads';

// Exécute la connexion à la base de données
connectDB();

// Initialisation de l'application
const app = express();

// ===============================================
// 4. MIDDLEWARES GLOBAUX ET DE SÉCURITÉ
// ===============================================

// Body parser
app.use(express.json());

// Nettoyage des données pour prévenir la NoSQL Injection
app.use(mongoSanitize());

// Configuration CORS (Cross-Origin Resource Sharing)
const corsOptions = {
  origin: FRONTEND_URL,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Sécurité HTTP Header avec Helmet
app.use(helmet());

// Limitation de débit (Rate Limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre (15 minutes)
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer après 15 minutes',
});
app.use('/api/', limiter); // Applique le limiteur à toutes les routes API

// Servir les fichiers statiques (images/documents uploadés)
app.use(`/${UPLOAD_PATH}`, express.static(path.join(__dirname, UPLOAD_PATH)));

// ===============================================
// 5. ROUTES DE BASE ET SANTÉ
// ===============================================

// Route racine
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Arbre à Palabres backend opérationnelle 🚀',
    version: '1.0.0',
    endpoints: {
      candidats: '/api/candidats',
      debats: '/api/debats',
      transactions: '/api/transactions',
      trophees: '/api/trophees'
    }
  });
});

// Route de santé pour Render
app.get('/sante', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===============================================
// 6. MONTAGE DES ROUTES API
// ===============================================

app.use('/api/candidats', candidatsRoutes);
app.use('/api/debats', debatsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/trophees', tropheesRoutes);

// ===============================================
// 7. GESTION DES ERREURS
// ===============================================

// Gestion des routes non trouvées (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée: ' + req.originalUrl,
  });
});

// Gestionnaire d'erreurs global (Express le reconnaît par ses 4 arguments)
app.use((error, req, res, next) => {
  console.error('Erreur non gérée:', error.message, error.stack);

  // Erreurs Mongoose/Validation
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: `Erreur de validation: ${messages.join(', ')}`,
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'ID ou format de donnée invalide.',
    });
  }

  // Erreur Générique
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Erreur interne du serveur',
  });
});

// ===============================================
// 8. DÉMARRAGE DU SERVEUR
// ===============================================

const server = app.listen(PORT, () => {
  console.log(
    `✅ Serveur démarré en mode ${process.env.NODE_ENV} sur le port ${PORT}`
  );
});

// Gérer les rejets de promesses non gérés
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Erreur: ${err.message}`);
  // Fermer le serveur et quitter le processus
  server.close(() => process.exit(1));
});

// Exportez l'application pour Supertest
module.exports = app;