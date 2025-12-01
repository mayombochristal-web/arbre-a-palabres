# 🔒 Guide de Sécurité - Arbre à Palabres

## Table des Matières

1. [Gestion des Secrets](#gestion-des-secrets)
2. [Configuration CORS](#configuration-cors)
3. [Authentification JWT](#authentification-jwt)
4. [Sécurité des API](#sécurité-des-api)
5. [Règles Firebase](#règles-firebase)
6. [Best Practices](#best-practices)

---

## Gestion des Secrets

### Variables d'Environnement

**❌ NE JAMAIS commiter:**
- `.env`
- `.env.local`
- `.env.production`
- `google-services.json`
- Keystores (`.keystore`, `.jks`)
- Fichiers de configuration OAuth

**✅ Commiter:**
- `.env.example`
- `.env.production.example`
- Documentation des variables requises

### Fichier .gitignore

Vérifier que ces lignes sont présentes:

```gitignore
# Environment variables
.env
.env.local
.env.production
.env.*.local

# Firebase
.firebase/
firebase-debug.log
.firebaserc

# Android
*.keystore
*.jks
google-services.json
GoogleService-Info.plist

# Secrets
secrets/
*.pem
*.key
```

### Stockage des Secrets

#### Développement Local
```bash
# Backend
backend/.env

# Frontend
frontend/.env.local
```

#### Production

**GitHub Secrets** (pour CI/CD):
- `FIREBASE_SERVICE_ACCOUNT`
- `FIREBASE_TOKEN`
- `MONGODB_URI`
- `JWT_SECRET`
- `REACT_APP_API_URL`
- `REACT_APP_FIREBASE_API_KEY`
- etc.

**Render** (pour backend):
- Configurer dans Dashboard > Environment
- Utiliser "Secret Files" pour fichiers sensibles

**Firebase** (pour frontend):
- Les clés Firebase publiques sont OK dans le code
- Protéger avec Firebase App Check

---

## Configuration CORS

### Backend (server.js)

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://arbre-a-palabre-9e83a.web.app',
  'https://arbre-a-palabre-9e83a.firebaseapp.com',
  // Ajouter d'autres domaines si nécessaire
];

app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
}));
```

### Vérification CORS

```bash
# Test depuis le frontend déployé
curl -H "Origin: https://arbre-a-palabre-9e83a.web.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://arbre-palabres-backend.onrender.com/api/candidats
```

---

## Authentification JWT

### Génération du Secret

```bash
# Générer un secret fort
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Configuration

```javascript
// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};
```

### Expiration des Tokens

```javascript
// Créer un token avec expiration
const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '30d' }
);
```

---

## Sécurité des API

### Rate Limiting

```javascript
// backend/server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requêtes par fenêtre
  message: 'Trop de requêtes, réessayez plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

### Validation des Inputs

```javascript
// Utiliser express-validator
const { body, validationResult } = require('express-validator');

router.post('/inscription',
  [
    body('email').isEmail().normalizeEmail(),
    body('telephone').matches(/^(06|07)\d{7}$/),
    body('nom').trim().isLength({ min: 2, max: 50 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ...
  }
);
```

### Sanitization

```javascript
// backend/server.js
const mongoSanitize = require('express-mongo-sanitize');

app.use(mongoSanitize()); // Prévient les injections NoSQL
```

### Headers de Sécurité

```javascript
// backend/server.js
const helmet = require('helmet');

app.use(helmet());
```

---

## Règles Firebase

### Firestore Rules (si utilisé)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Candidats: lecture publique, écriture authentifiée
    match /candidats/{candidatId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
    
    // Débats: lecture publique, écriture admin
    match /debats/{debatId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Transactions: admin seulement
    match /transactions/{transactionId} {
      allow read, write: if isAdmin();
    }
    
    // Users: lecture/écriture propre profil, admin pour tous
    match /users/{userId} {
      allow read: if isAuthenticated() && 
                     (request.auth.uid == userId || isAdmin());
      allow write: if isAuthenticated() && 
                      (request.auth.uid == userId || isAdmin());
    }
  }
}
```

### Storage Rules (si utilisé)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isValidImage() {
      return request.resource.size < 5 * 1024 * 1024 && // 5MB max
             request.resource.contentType.matches('image/.*');
    }
    
    // Uploads de cartes d'étudiant
    match /uploads/cartes-etudiant/{userId}/{fileName} {
      allow read: if true;
      allow write: if isAuthenticated() && 
                      request.auth.uid == userId &&
                      isValidImage();
    }
    
    // Photos de profil
    match /uploads/profiles/{userId}/{fileName} {
      allow read: if true;
      allow write: if isAuthenticated() && 
                      request.auth.uid == userId &&
                      isValidImage();
    }
  }
}
```

---

## Best Practices

### 1. Principe du Moindre Privilège

- Donner uniquement les permissions nécessaires
- Utiliser des rôles (admin, user, candidat)
- Vérifier les permissions à chaque requête

### 2. Validation Côté Serveur

- Ne JAMAIS faire confiance aux données client
- Valider tous les inputs
- Sanitizer les données avant insertion en DB

### 3. HTTPS Partout

- Forcer HTTPS en production
- Utiliser HSTS headers
- Vérifier les certificats SSL

### 4. Logs et Monitoring

```javascript
// backend/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Log des tentatives de connexion
logger.info('Login attempt', { email, ip: req.ip });

// Log des erreurs
logger.error('Database error', { error: err.message, stack: err.stack });
```

### 5. Rotation des Secrets

- Changer le JWT_SECRET régulièrement
- Utiliser des tokens à courte durée de vie
- Implémenter un système de refresh tokens

### 6. Protection contre les Attaques

**XSS (Cross-Site Scripting):**
```javascript
// Échapper les données utilisateur
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
```

**CSRF (Cross-Site Request Forgery):**
```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);
```

**SQL/NoSQL Injection:**
```javascript
// Utiliser les requêtes paramétrées
// Mongoose le fait automatiquement
const user = await User.findOne({ email: req.body.email });
```

### 7. Audit de Sécurité

```bash
# Vérifier les vulnérabilités npm
npm audit

# Corriger automatiquement
npm audit fix

# Forcer les corrections (attention aux breaking changes)
npm audit fix --force
```

### 8. Backup et Recovery

- Sauvegarder régulièrement la base de données
- Tester les procédures de restauration
- Avoir un plan de disaster recovery

---

## Checklist de Sécurité

- [ ] Tous les secrets sont dans .env (pas dans le code)
- [ ] .env est dans .gitignore
- [ ] CORS configuré correctement
- [ ] Rate limiting activé
- [ ] Helmet.js configuré
- [ ] JWT avec expiration
- [ ] Validation des inputs
- [ ] Sanitization MongoDB
- [ ] HTTPS forcé en production
- [ ] Logs configurés
- [ ] npm audit sans vulnérabilités critiques
- [ ] Règles Firebase configurées (si utilisé)
- [ ] Backup automatique de la DB
- [ ] Monitoring des erreurs (Sentry, etc.)

---

## Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
