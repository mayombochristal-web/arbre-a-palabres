# 🔑 Guide Rapide - Obtenir les Clés Firebase

## Étape 1: Accéder à Firebase Console

1. Ouvrir: https://console.firebase.google.com/
2. Se connecter avec votre compte Google (mayombochristal@gmail.com)
3. Cliquer sur votre projet existant

## Étape 2: Obtenir la Configuration Web

### Option A: Si vous avez déjà une app Web configurée

1. Cliquer sur l'icône ⚙️ **Paramètres du projet** (en haut à gauche)
2. Descendre jusqu'à la section **"Vos applications"**
3. Chercher l'application Web (icône `</>`)
4. Cliquer sur **"Config"** ou le nom de l'app
5. Copier les valeurs affichées dans `firebaseConfig`

### Option B: Si vous n'avez pas encore d'app Web

1. Cliquer sur l'icône ⚙️ **Paramètres du projet**
2. Descendre jusqu'à **"Vos applications"**
3. Cliquer sur **"Ajouter une application"**
4. Choisir **Web** (icône `</>`)
5. Remplir:
   - **Surnom de l'application**: `Arbre à Palabres Web`
   - ✅ Cocher **"Configurer également Firebase Hosting"**
6. Cliquer sur **"Enregistrer l'application"**
7. Copier les valeurs de configuration affichées

## Étape 3: Copier les Valeurs

Vous verrez quelque chose comme:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};
```

## Étape 4: Mettre à Jour .env.production

Ouvrir le fichier: `frontend/.env.production`

Remplacer les valeurs DEMO par vos vraies valeurs:

```env
# Backend API URL (ne pas changer)
REACT_APP_API_URL=https://arbre-palabres-backend.onrender.com/api

# Firebase Configuration (REMPLACER avec vos vraies valeurs)
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=votre-projet
REACT_APP_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789
```

## Étape 5: Rebuild et Déployer

Une fois `.env.production` mis à jour:

```powershell
# Aller dans le dossier frontend
cd "c:\Users\MAYOMBO\Desktop\arbre-a-palabres - Copie\frontend"

# Rebuild avec les vraies clés
npm run build

# Se connecter à Firebase (si pas déjà fait)
firebase login

# Sélectionner votre projet
firebase use --add
# Choisir votre projet dans la liste
# Alias: default

# Déployer!
firebase deploy --only hosting
```

## ✅ Vérification

Après le déploiement, Firebase affichera:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/votre-projet/overview
Hosting URL: https://votre-projet.web.app
```

Ouvrir l'URL Hosting dans votre navigateur pour vérifier!

---

## 🆘 Aide Rapide

**Problème: "Firebase project not found"**
```powershell
firebase projects:list
firebase use votre-projet-id
```

**Problème: "Not logged in"**
```powershell
firebase logout
firebase login
```

**Problème: "Build failed"**
```powershell
# Vérifier que .env.production est bien mis à jour
cat .env.production

# Rebuild
npm run build
```
