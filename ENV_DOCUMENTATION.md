# ===========================================
# DOCUMENTATION DES VARIABLES D'ENVIRONNEMENT
# ===========================================

## Backend (.env)

### Configuration Serveur
- `NODE_ENV`: Environnement d'exécution (development, production)
- `PORT`: Port du serveur backend (défaut: 5001)

### Base de Données
- `MONGODB_URI`: URI de connexion MongoDB
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`

### Sécurité
- `JWT_SECRET`: Clé secrète pour la signature des tokens JWT
  - **CRITIQUE**: Doit être une chaîne aléatoire forte et unique
  - **Longueur minimale**: 64 caractères (128 caractères recommandé)
  - **Ne JAMAIS utiliser**: le secret d'exemple en production
  
  **Générer un secret sécurisé:**
  
  **Méthode 1 - Node.js (Recommandé):**
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
  
  **Méthode 2 - OpenSSL:**
  ```bash
  openssl rand -hex 64
  ```
  
  **Méthode 3 - PowerShell (Windows):**
  ```powershell
  -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
  ```
  
  > ⚠️ **IMPORTANT**: Générez un secret différent pour chaque environnement (dev, staging, production)

- `JWT_EXPIRE`: Durée de validité des tokens (ex: 30d, 7d, 24h)

### Upload de Fichiers
- `UPLOAD_PATH`: Chemin du dossier de stockage des fichiers uploadés (défaut: ./uploads)
- `MAX_FILE_SIZE`: Taille maximale des fichiers en octets (défaut: 5242880 = 5MB)

---

## Frontend (.env)

### API Configuration
- `REACT_APP_API_URL`: URL de base de l'API backend
  - **Production**: `https://arbre-palabres-backend.onrender.com/api`
  - **Développement local**: `http://localhost:5001/api`

### Fichiers d'Environnement

#### `.env` (Production)
Utilisé pour le déploiement en production (Firebase, Render, etc.)

#### `.env.local` (Développement)
Utilisé pour le développement local. Ce fichier est ignoré par Git.
Créer ce fichier avec:
```
REACT_APP_API_URL=http://localhost:5001/api
```

---

## Configuration Recommandée

### Développement Local
1. Backend: Utiliser `.env` avec `PORT=5001`
2. Frontend: Créer `.env.local` avec `REACT_APP_API_URL=http://localhost:5001/api`

### Production
1. Backend: Configurer les variables d'environnement sur Render/Heroku
2. Frontend: Utiliser `.env` avec l'URL de production

---

## Sécurité

⚠️ **NE JAMAIS COMMITER**:
- Les fichiers `.env` contenant des secrets réels
- Les clés JWT de production
- Les credentials MongoDB

✅ **À COMMITER**:
- `.env.example` avec des valeurs d'exemple
- Cette documentation
