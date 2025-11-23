const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');

// Connexion à la base de données
connectDB();

const app = express();

// Middleware de sécurité
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par windowMs
});
app.use(limiter);

// Middleware CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statics
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/candidats', require('./routes/candidats'));
app.use('/api/debats', require('./routes/debats'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/trophees', require('./routes/trophees'));

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    message: 'L\'Arbre à Palabres API est en ligne',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Route pour les informations sur l'API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    name: 'L\'Arbre à Palabres API',
    version: '1.0.0',
    description: 'API pour la plateforme de débats éducatifs',
    endpoints: {
      candidats: '/api/candidats',
      debats: '/api/debats',
      transactions: '/api/transactions',
      trophees: '/api/trophees'
    },
    documentation: '/api/docs'
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route non trouvée' 
  });
});

// Gestionnaire d'erreurs global
app.use((error, req, res, next) => {
  console.error('Erreur non gérée:', error);
  
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: messages.join(', ')
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'ID invalide'
    });
  }
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue'
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 Environnement: ${process.env.NODE_ENV}`);
  console.log(`🔗 API disponible sur: http://localhost:${PORT}/api`);
  console.log(`❤️  Route de santé: http://localhost:${PORT}/api/health`);
});

module.exports = app;