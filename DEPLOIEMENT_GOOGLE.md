# 🚀 Guide de Déploiement Complet - Google Cloud & Firebase

## Table des Matières

1. [Configuration Google Cloud Console](#1-configuration-google-cloud-console)
2. [Configuration Firebase](#2-configuration-firebase)
3. [Configuration OAuth 2.0](#3-configuration-oauth-20)
4. [Génération des Clés SHA (Android)](#4-génération-des-clés-sha-android)
5. [Déploiement Frontend (Firebase Hosting)](#5-déploiement-frontend-firebase-hosting)
6. [Déploiement Backend](#6-déploiement-backend)
7. [Configuration CI/CD](#7-configuration-cicd)
8. [Sécurité et Règles](#8-sécurité-et-règles)
9. [Tests et Validation](#9-tests-et-validation)
10. [Résolution des Erreurs](#10-résolution-des-erreurs)

---

## 1. Configuration Google Cloud Console

### 1.1 Créer/Accéder au Projet

1. **Accéder à Google Cloud Console**
   - Aller sur https://console.cloud.google.com/
   - Se connecter avec votre compte Google (mayombochristal@gmail.com)

2. **Créer un nouveau projet** (si nécessaire)
   - Cliquer sur le sélecteur de projet (en haut)
   - Cliquer sur "Nouveau projet"
   - Nom: `arbre-a-palabres`
   - ID du projet: `arbre-a-palabre-9e83a` (ou similaire)
   - Cliquer sur "Créer"

### 1.2 Activer les APIs Nécessaires

Aller dans **APIs & Services > Bibliothèque** et activer:

```bash
# APIs essentielles pour Firebase
- Firebase Hosting API
- Firebase Management API
- Cloud Resource Manager API
- Identity Toolkit API (pour OAuth)

# APIs optionnelles (si migration vers Cloud Run)
- Cloud Run API
- Cloud Build API
- Container Registry API
- Secret Manager API
```

**Via gcloud CLI:**
```bash
gcloud services enable firebase.googleapis.com
gcloud services enable firebasehosting.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable identitytoolkit.googleapis.com
```

### 1.3 Configurer IAM et Permissions

1. **Aller dans IAM & Admin > IAM**
2. **Ajouter des membres** (si nécessaire)
   - Votre compte: `mayombochristal@gmail.com`
   - Rôles recommandés:
     - `Firebase Admin`
     - `Cloud Run Admin` (si migration backend)
     - `Storage Admin` (si utilisation de Storage)

---

## 2. Configuration Firebase

### 2.1 Créer/Configurer le Projet Firebase

1. **Accéder à Firebase Console**
   - Aller sur https://console.firebase.google.com/
   - Se connecter avec le même compte Google

2. **Ajouter un projet**
   - Si le projet Google Cloud existe déjà:
     - Sélectionner "Ajouter Firebase à un projet Google Cloud existant"
     - Choisir `arbre-a-palabre-9e83a`
   - Sinon:
     - Créer un nouveau projet Firebase
     - Nom: `Arbre à Palabres`

3. **Configurer Google Analytics** (optionnel)
   - Activer Google Analytics si souhaité
   - Créer ou sélectionner un compte Analytics

### 2.2 Installer Firebase CLI

```bash
# Installer Firebase CLI globalement
npm install -g firebase-tools

# Vérifier l'installation
firebase --version

# Se connecter à Firebase
firebase login
```

### 2.3 Initialiser Firebase dans le Projet

```bash
# À la racine du projet
cd "c:\Users\MAYOMBO\Desktop\arbre-a-palabres - Copie"

# Initialiser Firebase
firebase init

# Sélectionner:
# [x] Hosting: Configure files for Firebase Hosting
# [ ] Firestore (si vous voulez utiliser Firestore au lieu de MongoDB)
# [ ] Storage (si vous voulez utiliser Firebase Storage)

# Projet Firebase:
# > Use an existing project
# > Sélectionner arbre-a-palabre-9e83a

# Public directory: frontend/build
# Configure as single-page app: Yes
# Set up automatic builds with GitHub: No (on le fera manuellement)
```

### 2.4 Configurer Firebase Hosting

Le fichier `frontend/firebase.json` existe déjà. Vérifier la configuration:

```json
{
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

---

## 3. Configuration OAuth 2.0

### 3.1 Configurer OAuth Consent Screen

1. **Aller dans Google Cloud Console**
   - APIs & Services > OAuth consent screen

2. **Configurer l'écran de consentement**
   - Type d'utilisateur: `External` (ou `Internal` si G Suite)
   - Nom de l'application: `L'Arbre à Palabres`
   - E-mail d'assistance utilisateur: `mayombochristal@gmail.com`
   - Logo de l'application: (optionnel)
   - Domaine de l'application: `arbre-a-palabre-9e83a.web.app`
   - Domaines autorisés: 
     - `arbre-a-palabre-9e83a.web.app`
     - `arbre-a-palabre-9e83a.firebaseapp.com`

3. **Scopes** (portées)
   - Ajouter les scopes nécessaires:
     - `email`
     - `profile`
     - `openid`

4. **Utilisateurs de test** (si en mode test)
   - Ajouter votre email et ceux des testeurs

### 3.2 Créer des Identifiants OAuth 2.0

1. **Aller dans APIs & Services > Identifiants**

2. **Créer des identifiants > ID client OAuth 2.0**

3. **Pour l'application Web:**
   - Type d'application: `Application Web`
   - Nom: `Arbre à Palabres Web`
   - Origines JavaScript autorisées:
     ```
     http://localhost:3000
     https://arbre-a-palabre-9e83a.web.app
     https://arbre-a-palabre-9e83a.firebaseapp.com
     ```
   - URI de redirection autorisés:
     ```
     http://localhost:3000/auth/callback
     https://arbre-a-palabre-9e83a.web.app/auth/callback
     ```

4. **Pour l'application Android** (si déploiement mobile):
   - Type d'application: `Android`
   - Nom: `Arbre à Palabres Android`
   - Nom du package: `com.arbreapala bres.app` (voir capacitor.config.json)
   - Empreinte du certificat SHA-1: (voir section 4)

5. **Sauvegarder les identifiants**
   - Télécharger le fichier JSON des identifiants
   - Le stocker de manière sécurisée (NE PAS commiter sur GitHub)

---

## 4. Génération des Clés SHA (Android)

### 4.1 Générer le Keystore

```bash
# Créer un keystore pour signer l'application Android
keytool -genkey -v -keystore arbre-palabres.keystore -alias arbre-palabres -keyalg RSA -keysize 2048 -validity 10000

# Répondre aux questions:
# - Mot de passe du keystore: [CHOISIR UN MOT DE PASSE FORT]
# - Nom et prénom: Arbre à Palabres
# - Unité organisationnelle: Development
# - Organisation: Arbre à Palabres
# - Ville: Libreville
# - État: Estuaire
# - Code pays: GA
```

**⚠️ IMPORTANT**: Sauvegarder le keystore et le mot de passe de manière sécurisée!

### 4.2 Extraire SHA-1 et SHA-256

```bash
# Obtenir SHA-1
keytool -list -v -keystore arbre-palabres.keystore -alias arbre-palabres | findstr SHA1

# Obtenir SHA-256
keytool -list -v -keystore arbre-palabres.keystore -alias arbre-palabres | findstr SHA256
```

**Exemple de sortie:**
```
SHA1: A1:B2:C3:D4:E5:F6:07:08:09:0A:1B:2C:3D:4E:5F:60:71:82:93:A4
SHA256: B1:C2:D3:E4:F5:06:17:28:39:4A:5B:6C:7D:8E:9F:A0:B1:C2:D3:E4:F5:06:17:28:39:4A:5B:6C:7D:8E:9F:A0
```

### 4.3 Ajouter les SHA dans Firebase

1. **Aller dans Firebase Console**
   - Sélectionner votre projet
   - Paramètres du projet (icône engrenage)

2. **Ajouter une application Android**
   - Nom du package Android: `com.arbreapala bres.app`
   - Surnom de l'application: `Arbre à Palabres Android`
   - Certificat de signature SHA-1: [COLLER LE SHA-1]
   - Cliquer sur "Enregistrer l'application"

3. **Télécharger google-services.json**
   - Firebase génère automatiquement le fichier
   - Le placer dans `android/app/google-services.json`

---

## 5. Déploiement Frontend (Firebase Hosting)

### 5.1 Préparer le Build de Production

```bash
# Aller dans le dossier frontend
cd frontend

# Créer le fichier .env.production
echo REACT_APP_API_URL=https://arbre-palabres-backend.onrender.com/api > .env.production

# Installer les dépendances (si nécessaire)
npm install

# Créer le build de production
npm run build
```

### 5.2 Tester Localement

```bash
# Servir le build localement avec Firebase
firebase serve --only hosting

# Ouvrir http://localhost:5000 dans le navigateur
# Vérifier que tout fonctionne correctement
```

### 5.3 Déployer sur Firebase Hosting

```bash
# Déployer
firebase deploy --only hosting

# Attendre la fin du déploiement
# Firebase affichera l'URL de déploiement
```

**URL de déploiement:**
- Hosting URL: https://arbre-a-palabre-9e83a.web.app
- Console: https://console.firebase.google.com/project/arbre-a-palabre-9e83a/hosting/sites

### 5.4 Configurer un Domaine Personnalisé (Optionnel)

1. **Dans Firebase Console > Hosting**
2. **Ajouter un domaine personnalisé**
3. **Suivre les instructions pour configurer les DNS**

---

## 6. Déploiement Backend

### Option A: Garder Render (Recommandé)

Votre backend est déjà déployé sur Render. Aucune action nécessaire.

**URL actuelle:** https://arbre-palabres-backend.onrender.com

**Vérifier le déploiement:**
```bash
curl https://arbre-palabres-backend.onrender.com/sante
```

### Option B: Migrer vers Google Cloud Run

#### 6.1 Préparer le Backend

```bash
cd backend

# Créer un Dockerfile optimisé pour Cloud Run
# (voir fichier Dockerfile.cloudrun dans les fichiers à créer)
```

#### 6.2 Build et Push de l'Image

```bash
# Configurer gcloud
gcloud config set project arbre-a-palabre-9e83a

# Build l'image avec Cloud Build
gcloud builds submit --tag gcr.io/arbre-a-palabre-9e83a/backend

# Ou build localement et push
docker build -t gcr.io/arbre-a-palabre-9e83a/backend .
docker push gcr.io/arbre-a-palabre-9e83a/backend
```

#### 6.3 Déployer sur Cloud Run

```bash
gcloud run deploy arbre-palabres-backend \
  --image gcr.io/arbre-a-palabre-9e83a/backend \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-secrets MONGODB_URI=mongodb-uri:latest,JWT_SECRET=jwt-secret:latest
```

#### 6.4 Configurer les Secrets

```bash
# Créer les secrets dans Secret Manager
echo -n "your-mongodb-uri" | gcloud secrets create mongodb-uri --data-file=-
echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-

# Donner accès à Cloud Run
gcloud secrets add-iam-policy-binding mongodb-uri \
  --member=serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

---

## 7. Configuration CI/CD

### 7.1 Configurer les Secrets GitHub

1. **Aller sur GitHub**
   - Repository > Settings > Secrets and variables > Actions

2. **Ajouter les secrets:**
   ```
   FIREBASE_TOKEN: [Obtenu via 'firebase login:ci']
   MONGODB_URI: [Votre URI MongoDB Atlas]
   JWT_SECRET: [Votre secret JWT]
   ```

3. **Obtenir le Firebase Token:**
   ```bash
   firebase login:ci
   # Copier le token affiché
   ```

### 7.2 Workflows GitHub Actions

Les workflows seront créés dans `.github/workflows/`:
- `deploy-frontend.yml` - Déploiement automatique du frontend
- `deploy-backend.yml` - Déploiement automatique du backend (si Cloud Run)
- `tests.yml` - Tests automatiques

### 7.3 Tester le CI/CD

```bash
# Créer une branche de test
git checkout -b test-cicd

# Faire un changement mineur
echo "# Test CI/CD" >> README.md

# Commit et push
git add .
git commit -m "test: CI/CD workflow"
git push origin test-cicd

# Créer une Pull Request sur GitHub
# Vérifier que les workflows s'exécutent
```

---

## 8. Sécurité et Règles

### 8.1 Sécuriser les API Keys

**Frontend (.env.production):**
```env
# Ne jamais commiter ce fichier!
REACT_APP_API_URL=https://arbre-palabres-backend.onrender.com/api
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=arbre-a-palabre-9e83a.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=arbre-a-palabre-9e83a
```

**Backend (.env):**
```env
# Ne jamais commiter ce fichier!
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
PORT=10000
```

### 8.2 Configurer CORS

Le backend doit autoriser les requêtes depuis Firebase Hosting:

```javascript
// backend/server.js
const allowedOrigins = [
  'http://localhost:3000',
  'https://arbre-a-palabre-9e83a.web.app',
  'https://arbre-a-palabre-9e83a.firebaseapp.com'
];
```

### 8.3 Règles de Sécurité Firebase (si Firestore/Storage utilisés)

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles par défaut: lecture publique, écriture authentifiée
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

---

## 9. Tests et Validation

### 9.1 Tests Locaux

```bash
# Backend
cd backend
npm test -- --runInBand

# Frontend
cd frontend
npm test
npm run build
```

### 9.2 Tests Post-Déploiement

```bash
# Test de santé du backend
curl https://arbre-palabres-backend.onrender.com/sante

# Test du frontend
curl -I https://arbre-a-palabre-9e83a.web.app

# Test d'une API
curl https://arbre-palabres-backend.onrender.com/api/candidats/classement/Primaire
```

### 9.3 Tests Manuels

1. **Ouvrir l'application:** https://arbre-a-palabre-9e83a.web.app
2. **Tester l'inscription** d'un nouveau candidat
3. **Tester la connexion** admin
4. **Créer un débat**
5. **Vérifier le classement**

---

## 10. Résolution des Erreurs

### Erreur: "Firebase project not found"

**Solution:**
```bash
# Vérifier les projets disponibles
firebase projects:list

# Utiliser le bon projet
firebase use arbre-a-palabre-9e83a
```

### Erreur: "CORS policy blocked"

**Solution:**
- Vérifier que le backend autorise l'origine Firebase dans `server.js`
- Redéployer le backend après modification

### Erreur: "Build failed"

**Solution:**
```bash
# Nettoyer le cache
cd frontend
rm -rf node_modules build
npm install
npm run build
```

### Erreur: "Authentication required"

**Solution:**
```bash
# Se reconnecter à Firebase
firebase logout
firebase login
```

### Erreur: "Quota exceeded"

**Solution:**
- Vérifier les quotas dans Google Cloud Console
- Passer à un plan payant si nécessaire (Blaze)

### Erreur: "Module not found"

**Solution:**
```bash
# Réinstaller les dépendances
npm install
```

---

## Commandes Rapides de Référence

```bash
# Firebase
firebase login
firebase init
firebase deploy --only hosting
firebase serve
firebase projects:list

# gcloud
gcloud auth login
gcloud config set project arbre-a-palabre-9e83a
gcloud services list --enabled
gcloud run deploy

# Tests
npm test
npm run build
curl https://arbre-a-palabre-9e83a.web.app
```

---

## Checklist Finale

- [ ] Projet Google Cloud créé
- [ ] APIs activées
- [ ] Projet Firebase configuré
- [ ] Firebase CLI installé et connecté
- [ ] OAuth 2.0 configuré
- [ ] SHA-1/SHA-256 générés (si mobile)
- [ ] Frontend déployé sur Firebase Hosting
- [ ] Backend déployé (Render ou Cloud Run)
- [ ] Secrets GitHub configurés
- [ ] Workflows CI/CD fonctionnels
- [ ] Tests passent
- [ ] Application accessible en production
- [ ] CORS configuré correctement
- [ ] Variables d'environnement sécurisées

---

**🎉 Félicitations! Votre application est maintenant déployée sur l'écosystème Google!**
