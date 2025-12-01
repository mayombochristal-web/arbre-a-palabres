# 🌳 L'Arbre à Palabres

Plateforme éducative de débats pour la jeunesse gabonaise avec système de récompenses financières transparent.

> **"Le dialogue, au cœur du vivre-ensemble"**

## 🎯 Vue d'ensemble

L'Arbre à Palabres est une plateforme moderne qui digitalise la tradition africaine du dialogue sous l'arbre. Elle permet aux jeunes Gabonais de développer leurs compétences oratoires tout en gagnant de l'argent à travers des débats structurés.

## ✨ Fonctionnalités Principales

### 🎓 Pour les Candidats
- **Inscription simplifiée** avec 4 catégories (Primaire, Collège/Lycée, Universitaire, Entrepreneur)
- **Paiement automatisé** via Airtel Money avec parsing automatique des SMS
- **Profil TikTok** pour valoriser sa présence en ligne
- **Participation aux débats** avec système de notation transparent
- **Gains financiers** : 75% de la cagnotte pour le vainqueur
- **Système de classement** avec trophées et progression
- **Ressources éducatives** pour développer son éloquence
- **Retrait des gains** avec gestion de solde

### 👑 Pour l'Administration
- **Compte admin principal** : mayombochristal@gmail.com
- **Gestion multi-administrateurs** avec possibilité d'ajouter des admins
- **Validation des paiements** automatique et manuelle
- **Création de débats** avec sélection de 4 participants
- **Tableau de bord** avec statistiques en temps réel
- **Gestion des transactions** et historique complet
- **Supervision des débats** avec statuts (en_attente, en_cours, terminé)

### 🎭 Pour le Jury
- **Notation des débats** (0-10 points)
- **Rôles ludiques** : Le Sage, Le Visionnaire, Le Critique, Le Médiateur, L'Analyste
- **Commentaires** sur les performances
- **Espace observateurs** pour commentaires publics

## 💰 Structure Financière

| Catégorie | Âge | Frais | Gain Potentiel | ROI |
|-----------|-----|-------|----------------|-----|
| Primaire | 10-12 ans | 500 FCFA | 1,500 FCFA | 200% |
| Collège/Lycée | 13-18 ans | 1,000 FCFA | 3,000 FCFA | 200% |
| Universitaire | 19-40 ans | 2,000 FCFA | 6,000 FCFA | 200% |
| Entrepreneur | Tous âges | 5,000 FCFA | 15,000 FCFA | 200% |

**Répartition des gains :**
- 75% → Vainqueur du débat
- 25% → Organisation (dont 10% pour le Juge Administratif)

## 🏗️ Architecture Technique

### Backend (Node.js/Express)
```
backend/
├── models/          # Schémas MongoDB (User, Candidat, Debat, Transaction)
├── routes/          # API endpoints (auth, candidats, debats, transactions)
├── controllers/     # Logique métier (authController)
├── middleware/      # Auth JWT, error handling
├── utils/           # Helpers (calculsFinanciers, paymentParser)
└── config/          # Database, logger
```

**Technologies :**
- Express.js 4.18+
- MongoDB + Mongoose
- JWT pour authentification
- Bcrypt pour hashing
- Helmet + CORS pour sécurité
- Winston pour logging

### Frontend (React)
```
frontend/
├── components/
│   ├── Admin/       # Panels admin, création débats
│   ├── Auth/        # Login, registration
│   ├── Candidat/    # Profils, classement
│   ├── Debat/       # Liste, cartes, participation
│   ├── Finance/     # Transactions, retraits
│   ├── Inscription/ # Formulaire inscription
│   ├── Resources/   # Pages éducatives
│   └── Common/      # Header, Footer, Navbar
├── services/        # API calls
└── contexts/        # State management
```

**Technologies :**
- React 18
- React Router DOM v6
- Axios pour HTTP
- CSS3 avec variables
- Responsive design

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 16+
- MongoDB 4.4+
- npm ou yarn

### Installation Rapide

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurer JWT_SECRET, MONGO_URI, PORT
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
# Créer .env.local avec REACT_APP_API_URL
npm start
```

### Variables d'environnement

**Backend (.env)**
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=votre_secret_jwt
PORT=5001
NODE_ENV=development
```

**Frontend (.env.local)**
```env
REACT_APP_API_URL=http://localhost:5001/api
```

## 📚 Documentation Complémentaire

- [DEMARRAGE.md](./DEMARRAGE.md) - Guide de démarrage détaillé
- [GUIDE_TEST.md](./GUIDE_TEST.md) - Scénarios de test
- [REGLEMENT_DEBATS.md](./REGLEMENT_DEBATS.md) - Règles des débats
- [THEMES_DEBATS.md](./THEMES_DEBATS.md) - Thèmes suggérés
- [ENV_DOCUMENTATION.md](./ENV_DOCUMENTATION.md) - Configuration environnement

## 🎨 Pages et Routes

### Pages Publiques
- `/` - Accueil avec catégories et pricing
- `/inscription` - Formulaire d'inscription
- `/debats` - Liste des débats
- `/candidats` - Liste des candidats
- `/classement` - Classement par catégorie

### Pages Ressources
- `/ressources/education` - Développer son éloquence
- `/ressources/recompenses` - Maximiser ses gains
- `/ressources/culture` - Tradition de l'arbre à palabres
- `/ressources/competition` - Système de classement

### Pages Admin
- `/admin` - Dashboard principal
- `/admin/nouveau-debat` - Créer un débat
- `/admin/validation` - Valider les paiements
- `/admin/debats` - Gérer les débats

## 🔐 Sécurité

- ✅ Authentification JWT
- ✅ Hashing bcrypt des mots de passe
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet.js pour headers sécurisés
- ✅ MongoDB sanitization
- ✅ CORS configuré
- ✅ Validation des inputs

## 🌐 Déploiement

### Backend (Render)
- Service Web avec build automatique
- Variables d'environnement configurées
- MongoDB Atlas pour la base de données

### Frontend (Firebase/Vercel)
- Build optimisé pour production
- CDN pour assets statiques
- HTTPS par défaut

## 📊 Statistiques Clés

- **4 catégories** de participants
- **Débats à 4 participants** pour équité
- **Système de notation** transparent
- **Paiement automatique** via Airtel Money
- **10% des frais** pour le Juge Administratif

## 🤝 Contribution

Pour contribuer au projet :
1. Fork le repository
2. Créer une branche feature
3. Commit vos changements
4. Push et créer une Pull Request

## 📝 Licence

Propriété de L'Arbre à Palabres - Tous droits réservés

## 👥 Contact

**Admin Principal :** mayombochristal@gmail.com

---

**Version :** 2.0.0  
**Dernière mise à jour :** Novembre 2024