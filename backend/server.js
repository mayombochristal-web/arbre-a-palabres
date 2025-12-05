// ===============================================
// 1. CHARGEMENT DES VARIABLES D'ENVIRONNEMENT
// ===============================================
require("dotenv").config();

// ===============================================
// 2. IMPORTATION DES DÉPENDANCES
// ===============================================
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require('xss-clean');
const compression = require('compression');
const path = require("path");

const connectDB = require("./config/database");
const logger = require('./config/logger');
const { generalLimiter } = require('./middleware/rateLimiter');

// Importation des routes
const candidatsRoutes = require("./routes/candidats");
const debatsRoutes = require("./routes/debats");
const transactionsRoutes = require("./routes/transactions");

const tropheesRoutes = require("./routes/trophees");
const authRoutes = require("./routes/auth");
const healthRoutes = require("./routes/health");
const visitorsRoutes = require("./routes/visitors");
const formationsRoutes = require("./routes/formations");

// Swagger Documentation
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

// ===============================================
// 3. CONFIGURATION
// ===============================================
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:3000",
  "https://arbre-a-palabre-9e83a.web.app",
  "https://arbre-a-palabre-9e83a.firebaseapp.com",
  "https://arbre-palabres-backend.onrender.com",
  "https://arbreapalabres.ga",
  "https://www.arbreapalabres.ga",
  "https://www.arbre-a-palabre-9e83a.web.app"
];

// Connexion DB
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// App
const app = express();

// ===============================================
// 4. MIDDLEWARES DE SÉCURITÉ
// ===============================================

// Helmet - Headers de sécurité HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Sanitization contre les injections NoSQL
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn('Tentative d\'injection NoSQL détectée', { ip: req.ip, key });
  },
}));

// Protection XSS
app.use(xss());

// Rate limiting général
app.use(generalLimiter);

// CORS - Configuration consolidée avec support des variables d'environnement
const envAllowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
const allAllowedOrigins = [...allowedOrigins, ...envAllowedOrigins];

const corsOptions = {
  origin: function (origin, callback) {
    // Permettre les requêtes sans origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allAllowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('Origine CORS non autorisée', { origin });
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Corrige les requêtes preflight OPTIONS
app.options("*", cors(corsOptions));

// Compression des réponses
app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb', charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, limit: '10mb', charset: 'utf-8' }));

// Middleware pour forcer l'encodage UTF-8 dans les réponses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Fichiers statiques uploadés
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===============================================
// 5. ROUTES DE TEST
// ===============================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Arbre à Palabres backend opérationnelle 🚀",
    version: "1.0.0",
    endpoints: {
      candidats: "/api/candidats",
      debats: "/api/debats",
      transactions: "/api/transactions",
      trophees: "/api/trophees",
    },
  });
});

app.get("/sante", (req, res) => {
  res.status(200).json({ status: "OK", ts: Date.now() });
});

// ===============================================
// 6. ROUTES API
// ===============================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use("/api/health", healthRoutes);
app.use("/api/candidats", candidatsRoutes);
app.use("/api/debats", debatsRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/trophees", tropheesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/visitors", visitorsRoutes);
app.use("/api/formations", formationsRoutes);

// ===============================================
// 7. ERREURS
// ===============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route non trouvée: " + req.originalUrl,
  });
});

// ===============================================
// 7. MIDDLEWARE DE GESTION D'ERREURS (DOIT ÊTRE LE DERNIER)
// ===============================================
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// ===============================================
// 8. LANCEMENT
// ===============================================
const { initializeSocket } = require('./config/socket');

// Only start server if run directly
if (require.main === module) {
  const server = app.listen(PORT, () =>
    logger.info(`🚀 Backend opérationnel sur le port ${PORT}`)
  );

  // Initialiser Socket.io
  const io = initializeSocket(server);
  logger.info('✅ Socket.io initialisé');

  process.on("unhandledRejection", (err) => {
    logger.error("Unhandled Promise Rejection:", { error: err.message, stack: err.stack });
    server.close(() => process.exit(1));
  });
}

module.exports = app;

