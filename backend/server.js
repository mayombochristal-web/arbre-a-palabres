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
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");

const connectDB = require("./config/database");

// Importation des routes
const candidatsRoutes = require("./routes/candidats");
const debatsRoutes = require("./routes/debats");
const transactionsRoutes = require("./routes/transactions");

const tropheesRoutes = require("./routes/trophees");
const authRoutes = require("./routes/auth");

// ===============================================
// 3. CONFIGURATION
// ===============================================
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:3000",
  "https://arbre-a-palabre-9e83a.web.app",
  "https://arbre-palabres-backend.onrender.com"
];

// Connexion DB
connectDB();

// App
const app = express();

// ===============================================
// 4. MIDDLEWARES
// ===============================================

// Body parser
app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

// Middleware pour forcer l'encodage UTF-8 dans les réponses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Sécurité
app.use(helmet());
app.use(mongoSanitize());

// CORS – *IMPORTANT*
// -----------------------------------------------
// CORS – *IMPORTANT*
// -----------------------------------------------
const envAllowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
const allAllowedOrigins = [...allowedOrigins, ...envAllowedOrigins];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman / interne
      if (allAllowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

// Corrige les requêtes preflight OPTIONS
app.options("*", cors());

// Limiteur contre le spam
app.use(
  "/api/",
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Augmenté de 100 à 500 pour permettre l'auto-refresh
    message: "Trop de requêtes, réessayez plus tard.",
  })
);

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
app.use("/api/candidats", candidatsRoutes);
app.use("/api/debats", debatsRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/trophees", tropheesRoutes);
app.use("/api/auth", authRoutes);

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
const logger = require('./config/logger');
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

