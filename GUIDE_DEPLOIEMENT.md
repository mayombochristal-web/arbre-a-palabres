# 🚀 Guide de Déploiement Production

## 📋 Checklist Pré-Déploiement

### Fichiers Modifiés (Semaines 1-4)

**Backend:**
- ✅ `server.js` - CORS consolidé
- ✅ `models/Debat.js` - Validation 75/25
- ✅ `.env.example` - ALLOWED_ORIGINS mis à jour
- ✅ `scripts/optimizeIndexes.js` - Nouveau script

**Frontend:**
- ✅ `hooks/useApi.js` - React Query hooks
- ✅ `components/Common/ErrorBoundary.jsx` - Error handling
- ✅ `index.js` - ErrorBoundary wrapper
- ✅ `public/images/categories/` - 4 images
- ✅ `netlify.toml` - CDN config

**Documentation:**
- ✅ `README.md` - URL Firebase
- ✅ `ENV_VARIABLES_DOCUMENTATION.md`
- ✅ `SOLUTION_FIREBASE.md`
- ✅ `DOMAINE_CONFIG.md`

---

## 🔧 Étape 1: Commit et Push

### Commandes Git

```bash
# Vérifier les changements
git status

# Ajouter tous les fichiers modifiés
git add backend/server.js
git add backend/models/Debat.js
git add backend/.env.example
git add backend/scripts/optimizeIndexes.js
git add frontend/src/hooks/useApi.js
git add frontend/src/components/Common/ErrorBoundary.*
git add frontend/src/index.js
git add frontend/public/images/categories/
git add frontend/netlify.toml
git add README.md
git add *.md

# Commit avec message descriptif
git commit -m "feat: complete optimization plan (weeks 1-4) + Firebase migration

- Week 1: CORS consolidation, financial validation, env docs
- Week 2: React Query hooks, pagination, category images
- Week 3: ErrorBoundary, tests, comprehensive env documentation
- Week 4: MongoDB indexes, CDN config, service worker
- Migration: Switch to Firebase Hosting (Netlify suspended)
- Update: ALLOWED_ORIGINS for Firebase URL"

# Push vers GitHub
git push origin main
```

---

## 🌐 Étape 2: Render Backend

### Auto-Deploy

Render détecte automatiquement les push sur `main` et redéploie.

**Vérification:**
1. Aller sur: https://dashboard.render.com
2. Sélectionner votre service backend
3. Onglet **Events** - Vérifier "Deploy started"
4. Attendre 2-3 minutes pour le build

### Mettre à Jour ALLOWED_ORIGINS

**CRITIQUE:** Sans cela, le frontend ne peut pas appeler l'API !

1. **Dashboard Render** → Votre service
2. **Environment** (menu gauche)
3. Trouver `ALLOWED_ORIGINS`
4. **Modifier:**
   ```bash
   ALLOWED_ORIGINS=https://arbre-a-palabre-9e83a.web.app,http://localhost:3000
   ```
5. **Save Changes**
6. Le service redémarre automatiquement

### Vérifier le Déploiement

```bash
# Test health endpoint
curl https://arbre-palabres-backend.onrender.com/api/health

# Devrait retourner:
# {"status":"ok","timestamp":"...","uptime":...}
```

---

## 🔥 Étape 3: Firebase Frontend

### Déployer sur Firebase

```bash
# Aller dans le dossier frontend
cd frontend

# Build de production
npm run build

# Déployer sur Firebase
firebase deploy --only hosting

# Ou si firebase-tools n'est pas installé:
npx firebase-tools deploy --only hosting
```

### Vérifier le Déploiement

```bash
# Ouvrir dans le navigateur
start https://arbre-a-palabre-9e83a.web.app

# Ou tester avec curl
curl -I https://arbre-a-palabre-9e83a.web.app
# Devrait retourner: HTTP/2 200
```

---

## 🧪 Étape 4: Tests de Vérification

### Test 1: API Health

```bash
curl https://arbre-palabres-backend.onrender.com/api/health
```

**Attendu:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-03T...",
  "uptime": 123.45
}
```

### Test 2: CORS depuis Frontend

Ouvrir https://arbre-a-palabre-9e83a.web.app et dans la console (F12):

```javascript
fetch('https://arbre-palabres-backend.onrender.com/api/candidats')
  .then(r => r.json())
  .then(data => console.log('✅ CORS OK:', data))
  .catch(err => console.error('❌ CORS Error:', err))
```

**Attendu:** Liste des candidats sans erreur CORS

### Test 3: Inscription Candidat

1. Aller sur: https://arbre-a-palabre-9e83a.web.app/inscription
2. Remplir le formulaire
3. Soumettre
4. Vérifier dans la console Network (F12) que la requête POST réussit

### Test 4: Connexion Admin

1. Aller sur: https://arbre-a-palabre-9e83a.web.app/admin
2. Login: mayombochristal@gmail.com
3. Vérifier que le dashboard charge

---

## 🔍 Vérification Render Dashboard

### Variables d'Environnement Requises

Vérifier que TOUTES ces variables sont définies:

```bash
# Base de données
MONGO_URI=mongodb+srv://...

# Sécurité
JWT_SECRET=...
JWT_EXPIRE=30d

# Serveur
PORT=10000
NODE_ENV=production

# Frontend
FRONTEND_URL=https://arbre-a-palabre-9e83a.web.app
ALLOWED_ORIGINS=https://arbre-a-palabre-9e83a.web.app,http://localhost:3000

# Upload
UPLOAD_PATH=/tmp/uploads
MAX_FILE_SIZE=5242880

# Optionnel: Monitoring
SENTRY_DSN=...
```

---

## 📊 Checklist Post-Déploiement

### Backend
- [ ] Auto-deploy Render complété
- [ ] `ALLOWED_ORIGINS` mis à jour avec Firebase URL
- [ ] API health endpoint répond
- [ ] Logs Render sans erreurs

### Frontend
- [ ] Build Firebase réussi
- [ ] Site accessible sur Firebase URL
- [ ] HTTPS actif (cadenas vert)
- [ ] Pas d'erreurs dans la console

### Fonctionnalités
- [ ] Inscription candidat fonctionne
- [ ] Connexion admin fonctionne
- [ ] API calls depuis frontend réussissent
- [ ] Images de catégories s'affichent
- [ ] Navigation fluide (React Query cache)

---

## 🚨 Dépannage

### Erreur CORS

**Symptôme:** `Access-Control-Allow-Origin` error dans la console

**Solution:**
1. Vérifier `ALLOWED_ORIGINS` sur Render
2. Doit inclure: `https://arbre-a-palabre-9e83a.web.app`
3. Redémarrer le service Render

### Build Firebase Échoue

**Symptôme:** `firebase deploy` erreur

**Solution:**
```bash
# Vérifier firebase.json existe
cat firebase.json

# Re-login Firebase
firebase login

# Réessayer
firebase deploy --only hosting
```

### Backend Ne Démarre Pas

**Symptôme:** Render service "Deploy failed"

**Solution:**
1. Vérifier les logs Render
2. Vérifier `MONGO_URI` est correct
3. Vérifier `JWT_SECRET` est défini

---

## 📝 Commandes Rapides

### Déploiement Complet

```bash
# Backend (auto via Git)
git add .
git commit -m "feat: production deployment"
git push origin main

# Frontend (Firebase)
cd frontend
npm run build
firebase deploy --only hosting
```

### Vérification Rapide

```bash
# Backend health
curl https://arbre-palabres-backend.onrender.com/api/health

# Frontend
curl -I https://arbre-a-palabre-9e83a.web.app
```

---

## 🎯 URL Finales

**Site Public:**
```
https://arbre-a-palabre-9e83a.web.app
```

**Espace Admin:**
```
https://arbre-a-palabre-9e83a.web.app/admin
```

**API Backend:**
```
https://arbre-palabres-backend.onrender.com/api
```

---

**Prêt pour le déploiement !** Suivez les étapes dans l'ordre.
