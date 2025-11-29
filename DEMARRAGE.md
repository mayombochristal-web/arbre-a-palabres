# 🚀 Guide de Démarrage - L'Arbre à Palabres

## Prérequis

Avant de lancer l'application, assurez-vous d'avoir installé:
- **Node.js** (version 14 ou supérieure)
- **MongoDB** (version 4.4 ou supérieure)
- **npm** ou **yarn**

---

## 📋 Étapes de Démarrage

### 1️⃣ Configuration de la Base de Données

**Démarrer MongoDB:**

```powershell
# Si MongoDB est installé comme service Windows
net start MongoDB

# OU démarrer manuellement
mongod --dbpath "C:\data\db"
```

**Vérifier la connexion:**
```powershell
mongo
# Vous devriez voir le shell MongoDB
```

---

### 2️⃣ Configuration du Backend

**a) Renommer le fichier de configuration:**
```powershell
cd "c:\Users\MAYOMBO\Desktop\arbre-a-palabres - Copie\backend"
ren .env.txt .env
```

**b) Installer les dépendances:**
```powershell
npm install
```

**c) Démarrer le serveur backend:**
```powershell
# Mode développement (avec auto-reload)
npm run dev

# OU mode production
npm start
```

Le backend devrait démarrer sur **http://localhost:5000**

---

### 3️⃣ Configuration du Frontend

**a) Ouvrir un nouveau terminal et naviguer vers le frontend:**
```powershell
cd "c:\Users\MAYOMBO\Desktop\arbre-a-palabres - Copie\frontend"
```

**b) Installer les dépendances:**
```powershell
npm install
```

**c) Démarrer le serveur de développement:**
```powershell
npm start
```

Le frontend devrait s'ouvrir automatiquement sur **http://localhost:3000**

---

## ✅ Vérification

Une fois les deux serveurs lancés, vous devriez voir:

### Backend (Terminal 1)
```
🌳 L'Arbre à Palabres Backend
✓ MongoDB connecté
✓ Serveur démarré sur le port 5000
```

### Frontend (Terminal 2)
```
Compiled successfully!
You can now view arbre-a-palabres in the browser.
  Local:            http://localhost:3000
```

---

## 🔧 Commandes Utiles

### Backend
```powershell
cd backend
npm run dev      # Démarrage en mode développement
npm start        # Démarrage en mode production
npm test         # Lancer les tests
```

### Frontend
```powershell
cd frontend
npm start        # Démarrage du serveur de développement
npm run build    # Créer une version de production
npm test         # Lancer les tests
```

---

## 🐛 Dépannage

### Problème: MongoDB ne démarre pas
**Solution:**
```powershell
# Créer le dossier de données si nécessaire
mkdir C:\data\db

# Démarrer MongoDB manuellement
mongod --dbpath "C:\data\db"
```

### Problème: Port 5000 déjà utilisé
**Solution:** Modifier le port dans `backend\.env`
```
PORT=5001
```

### Problème: Erreur "Cannot find module"
**Solution:** Réinstaller les dépendances
```powershell
rm -r node_modules
npm install
```

### Problème: CORS errors
**Solution:** Vérifier que le backend est bien démarré sur le port 5000

---

## 📱 Accès à l'Application

Une fois tout démarré:

1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:5000/api
3. **Statistiques**: http://localhost:5000/api/debats/statistiques/general

---

## 🎯 Prochaines Étapes

1. Créer un compte administrateur
2. Ajouter des candidats
3. Créer votre premier débat
4. Tester le système de défi avec mise en jeu

Bon débat! 🌳
