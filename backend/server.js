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
// Import custom rate limiter to fix Render 429 errors
const { generalLimiter } = require('./middleware/rateLimiter');

// Importation des routes
const candidatsRoutes = require("./routes/candidats");
const debatsRoutes = require("./routes/debats");
const transactionsRoutes = require("./routes/transactions");
const tropheesRoutes = require("./routes/trophees");
const authRoutes = require("./routes/auth");
const visitorsRoutes = require("./routes/visitors");
const formationsRoutes = require("./routes/formations");
const healthRoutes = require("./routes/health");
// 🔧 1. Importer la route (Requested by User)
const testEmailRoute = require("./routes/testEmail");

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

// Middleware de Logging (Recommandé pour debugging)
app.use((req, res, next) => {
  if (req.url !== '/health' && req.url !== '/sante') {
    logger.info(`${req.method} ${req.url} | Origin: ${req.headers.origin || 'N/A'}`);
  }
  next();
});

// ===============================================
// 4. MIDDLEWARES DE SÉCURITÉ
// ===============================================

// Helmet
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

// Sanitization
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn('Tentative d\'injection NoSQL détectée', { ip: req.ip, key });
  },
}));

// XSS
app.use(xss());

// Rate limiting (Uses the custom one with SKIP for /health)
app.use(generalLimiter);

// CORS
const envAllowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
const allAllowedOrigins = [...allowedOrigins, ...envAllowedOrigins];

const corsOptions = {
  origin: function (origin, callback) {
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
app.options("*", cors(corsOptions));

app.use(compression());
app.use(express.json({ limit: '10mb', charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, limit: '10mb', charset: 'utf-8' }));

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

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

// Standard Health Check (Recommended)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'backend-api'
  });
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

// 🔧 2. Activer la route (Requested by User)
app.use("/api/test-email", testEmailRoute);

// ===============================================
// 7. ERREURS
// ===============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route non trouvée: " + req.originalUrl,
  });
});

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// ===============================================
// 8. LANCEMENT
// ===============================================
const { initializeSocket } = require('./config/socket');

if (require.main === module) {
  const server = app.listen(PORT, () =>
    logger.info(`🚀 Backend opérationnel sur le port ${PORT}`)
  );

  const io = initializeSocket(server);
  logger.info('✅ Socket.io initialisé');

  process.on("unhandledRejection", (err) => {
    logger.error("Unhandled Promise Rejection:", { error: err.message, stack: err.stack });
    server.close(() => process.exit(1));
  });
}

module.exports = app;
"// force redeploy" 
