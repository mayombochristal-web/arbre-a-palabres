# 📚 Documentation des Variables d'Environnement

## Backend (.env)

### Variables Requises

```bash
# ============================================
# CONFIGURATION DE LA BASE DE DONNÉES
# ============================================

# URI de connexion MongoDB Atlas
# Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
# Obtenir depuis: https://cloud.mongodb.com
MONGO_URI=mongodb+srv://votre_utilisateur:votre_mot_de_passe@cluster.mongodb.net/arbre_palabres?retryWrites=true&w=majority

# ============================================
# SÉCURITÉ ET AUTHENTIFICATION
# ============================================

# Secret JWT pour signer les tokens
# Générer avec: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# IMPORTANT: Ne JAMAIS partager cette clé
JWT_SECRET=votre_secret_jwt_tres_long_et_securise_genere_avec_crypto

# Durée de validité des tokens JWT
# Formats acceptés: 60, "2 days", "10h", "7d"
JWT_EXPIRE=30d

# ============================================
# CONFIGURATION SERVEUR
# ============================================

# Port du serveur (Render utilise 10000 par défaut)
PORT=5001

# Environnement d'exécution
# Valeurs: development, production, test
NODE_ENV=production

# ============================================
# CORS ET ORIGINES AUTORISÉES
# ============================================

# URL du frontend principal
FRONTEND_URL=https://arbre-a-palabre-9e83a.web.app

# Origines supplémentaires autorisées (séparées par des virgules)
# Exemple: https://domain1.com,https://domain2.com
ALLOWED_ORIGINS=https://arbre-a-palabres7.netlify.app,https://arbreapalabres.ga,http://localhost:3000

# ============================================
# UPLOAD DE FICHIERS
# ============================================

# Chemin de stockage des fichiers uploadés
# En production (Render): /tmp/uploads
# En local: ./uploads
UPLOAD_PATH=/tmp/uploads

# Taille maximale des fichiers (en bytes)
# 5MB = 5242880 bytes
MAX_FILE_SIZE=5242880

# ============================================
# MONITORING ET ERREURS (Optionnel)
# ============================================

# Sentry DSN pour le monitoring des erreurs
# Obtenir depuis: https://sentry.io
# Format: https://[key]@[organization].ingest.sentry.io/[project]
SENTRY_DSN=

# Environnement Sentry
SENTRY_ENVIRONMENT=production

# Taux d'échantillonnage des traces (0.0 à 1.0)
SENTRY_TRACES_SAMPLE_RATE=0.1
```

---

## Frontend (.env.local)

### Variables Requises

```bash
# ============================================
# API BACKEND
# ============================================

# URL de l'API backend
# Production: https://arbre-palabres-backend.onrender.com/api
# Local: http://localhost:5001/api
REACT_APP_API_URL=https://arbre-palabres-backend.onrender.com/api

# ============================================
# MONITORING (Optionnel)
# ============================================

# Sentry DSN pour le monitoring frontend
REACT_APP_SENTRY_DSN=

# Environnement Sentry
REACT_APP_SENTRY_ENVIRONMENT=production

# ============================================
# CONFIGURATION FIREBASE (Si utilisé)
# ============================================

REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

---

## 🔐 Sécurité des Variables

### ⚠️ Ne JAMAIS committer

- ❌ `.env` (backend)
- ❌ `.env.local` (frontend)
- ❌ `.env.production` avec des vraies valeurs

### ✅ Committer uniquement

- ✅ `.env.example` (backend)
- ✅ `.env.production.example` (frontend)

### 🔒 Bonnes Pratiques

1. **Générer des secrets forts**
   ```bash
   # JWT Secret (64 bytes)
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Rotation régulière**
   - Changer `JWT_SECRET` tous les 3-6 mois
   - Invalider tous les tokens existants lors du changement

3. **Accès restreint**
   - Limiter l'accès aux variables de production
   - Utiliser des secrets managers (Render Secrets, AWS Secrets Manager)

4. **Validation**
   - Vérifier que toutes les variables requises sont définies au démarrage
   - Utiliser des valeurs par défaut sécurisées quand possible

---

## 🚀 Configuration par Environnement

### Développement Local

**Backend (.env)**
```bash
MONGO_URI=mongodb://localhost:27017/arbre_palabres_dev
JWT_SECRET=dev_secret_not_for_production
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
```

**Frontend (.env.local)**
```bash
REACT_APP_API_URL=http://localhost:5001/api
```

### Production (Render + Netlify)

**Backend (Render Environment Variables)**
```bash
MONGO_URI=mongodb+srv://prod_user:***@cluster.mongodb.net/arbre_palabres
JWT_SECRET=*** (généré avec crypto.randomBytes)
PORT=10000
NODE_ENV=production
FRONTEND_URL=https://arbre-a-palabre-9e83a.web.app
ALLOWED_ORIGINS=https://arbre-a-palabres7.netlify.app,https://arbreapalabres.ga
SENTRY_DSN=https://***@***.ingest.sentry.io/***
```

**Frontend (Netlify Environment Variables)**
```bash
REACT_APP_API_URL=https://arbre-palabres-backend.onrender.com/api
REACT_APP_SENTRY_DSN=https://***@***.ingest.sentry.io/***
REACT_APP_SENTRY_ENVIRONMENT=production
```

---

## 📝 Checklist de Configuration

### Backend
- [ ] `MONGO_URI` configuré et testé
- [ ] `JWT_SECRET` généré avec crypto (64 bytes minimum)
- [ ] `PORT` défini (10000 pour Render)
- [ ] `NODE_ENV=production`
- [ ] `ALLOWED_ORIGINS` inclut tous les domaines frontend
- [ ] `SENTRY_DSN` configuré (optionnel mais recommandé)

### Frontend
- [ ] `REACT_APP_API_URL` pointe vers le backend correct
- [ ] Variables Firebase configurées (si utilisé)
- [ ] `REACT_APP_SENTRY_DSN` configuré (optionnel)
- [ ] Build testé avec les variables de production

---

## 🔍 Vérification

### Test Backend
```bash
cd backend
node -e "require('dotenv').config(); console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Défini' : '❌ Manquant'); console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Défini' : '❌ Manquant');"
```

### Test Frontend
```bash
cd frontend
npm run build
# Vérifier qu'aucune erreur de variable manquante
```

---

## 📞 Support

En cas de problème avec les variables d'environnement:
1. Vérifier `.env.example` pour la liste complète
2. Consulter les logs de déploiement (Render/Netlify)
3. Contacter: mayombochristal@gmail.com
