# 🚀 Guide de Démarrage Rapide - Déploiement Google Cloud & Firebase

## Commandes Essentielles

### 1. Installation Firebase CLI

```bash
npm install -g firebase-tools
firebase --version
firebase login
```

### 2. Déploiement Frontend (Firebase Hosting)

```bash
# Aller dans le dossier frontend
cd frontend

# Installer les dépendances
npm ci

# Créer le build de production
npm run build

# Déployer sur Firebase
firebase deploy --only hosting

# URL: https://arbre-a-palabre-9e83a.web.app
```

### 3. Configuration des Secrets GitHub

```bash
# Obtenir le token Firebase pour CI/CD
firebase login:ci

# Copier le token et l'ajouter dans GitHub:
# Repository > Settings > Secrets > Actions > New repository secret
# Name: FIREBASE_TOKEN
# Value: [COLLER LE TOKEN]
```

### 4. Générer JWT Secret

```bash
# Générer un secret fort pour JWT
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copier le résultat et l'ajouter dans:
# - backend/.env (local)
# - Render Dashboard > Environment Variables (production)
# - GitHub Secrets (CI/CD)
```

### 5. Générer SHA Keys pour Android

```bash
# Windows (PowerShell)
cd "c:\Users\MAYOMBO\Desktop\arbre-a-palabres - Copie"

# Créer le keystore
keytool -genkey -v -keystore arbre-palabres.keystore -alias arbre-palabres -keyalg RSA -keysize 2048 -validity 10000

# Extraire SHA-1
keytool -list -v -keystore arbre-palabres.keystore -alias arbre-palabres | findstr SHA1

# Extraire SHA-256
keytool -list -v -keystore arbre-palabres.keystore -alias arbre-palabres | findstr SHA256
```

### 6. Tests Avant Déploiement

```bash
# Backend tests
cd backend
npm test -- --runInBand

# Frontend build
cd frontend
npm run build

# Test local Firebase
firebase serve
```

### 7. Vérification Post-Déploiement

```bash
# Test santé backend
curl https://arbre-palabres-backend.onrender.com/sante

# Test frontend
curl -I https://arbre-a-palabre-9e83a.web.app

# Test API
curl https://arbre-palabres-backend.onrender.com/api/candidats/classement/Primaire
```

---

## URLs Importantes

- **Frontend Production**: https://arbre-a-palabre-9e83a.web.app
- **Backend Production**: https://arbre-palabres-backend.onrender.com
- **Firebase Console**: https://console.firebase.google.com/project/arbre-a-palabre-9e83a
- **Google Cloud Console**: https://console.cloud.google.com/
- **Render Dashboard**: https://dashboard.render.com
- **GitHub Repository**: https://github.com/mayombochristal-web/arbre-a-palabres

---

## Secrets à Configurer

### GitHub Secrets (pour CI/CD)

```
FIREBASE_SERVICE_ACCOUNT=<JSON du service account>
FIREBASE_TOKEN=<Token de firebase login:ci>
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<Secret généré>
REACT_APP_API_URL=https://arbre-palabres-backend.onrender.com/api
REACT_APP_FIREBASE_API_KEY=<Depuis Firebase Console>
REACT_APP_FIREBASE_AUTH_DOMAIN=arbre-a-palabre-9e83a.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=arbre-a-palabre-9e83a
REACT_APP_FIREBASE_STORAGE_BUCKET=arbre-a-palabre-9e83a.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<Depuis Firebase Console>
REACT_APP_FIREBASE_APP_ID=<Depuis Firebase Console>
```

### Render Environment Variables

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<Même que GitHub>
JWT_EXPIRE=30d
FRONTEND_URL=https://arbre-a-palabre-9e83a.web.app
UPLOAD_PATH=/tmp/uploads
MAX_FILE_SIZE=5242880
```

---

## Workflow de Déploiement

1. **Développement Local**
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend (nouveau terminal)
   cd frontend && npm start
   ```

2. **Commit et Push**
   ```bash
   git add .
   git commit -m "feat: nouvelle fonctionnalité"
   git push origin main
   ```

3. **CI/CD Automatique**
   - GitHub Actions exécute les tests
   - Si tests OK, déploie frontend sur Firebase
   - Backend auto-déployé par Render

4. **Vérification**
   - Vérifier les workflows GitHub Actions
   - Tester l'application en production
   - Vérifier les logs

---

## Résolution Rapide des Erreurs

### Erreur: "Firebase project not found"
```bash
firebase projects:list
firebase use arbre-a-palabre-9e83a
```

### Erreur: "CORS blocked"
- Vérifier `backend/server.js` → `allowedOrigins`
- Ajouter l'URL Firebase si manquante
- Redéployer le backend

### Erreur: "Build failed"
```bash
cd frontend
rm -rf node_modules build
npm install
npm run build
```

### Erreur: "Tests failed"
```bash
cd backend
npm test -- --runInBand --verbose
# Corriger les erreurs affichées
```

---

## Checklist Rapide

- [ ] Firebase CLI installé
- [ ] Connecté à Firebase (`firebase login`)
- [ ] Secrets GitHub configurés
- [ ] Variables Render configurées
- [ ] Frontend build OK
- [ ] Backend tests OK
- [ ] Déployé sur Firebase
- [ ] Backend sur Render OK
- [ ] Tests post-déploiement OK

---

## Support

- **Documentation complète**: Voir `DEPLOIEMENT_GOOGLE.md`
- **Sécurité**: Voir `SECURITE.md`
- **Checklist détaillée**: Voir `CHECKLIST_DEPLOIEMENT.md`
- **Contact**: mayombochristal@gmail.com
