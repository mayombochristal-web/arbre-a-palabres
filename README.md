# 🌳 L'Arbre à Palabres

Plateforme de débats éducatifs pour la jeunesse gabonaise avec système de récompenses financières transparent.

## 🎯 Fonctionnalités Principales

### Pour les Candidats
- 📝 Inscription en ligne avec vérification des documents
- 💳 Paiement des frais d'inscription différenciés (500, 1000, 2000 FCFA)
- 🎯 Participation à des débats par catégorie d'âge
- 💰 Gains financiers avec répartition 75% pour le vainqueur
- 🏆 Système de trophées et classement
- 📱 Interface responsive et intuitive

### Pour l'Administration
- 👑 Gestion complète des candidats et débats
- ✅ Validation des paiements et documents
- 📊 Tableau de bord avec statistiques détaillées
- 💸 Gestion des transactions et retraits
- 🎯 Organisation et supervision des débats

## 🏗️ Architecture Technique

### Backend (Node.js/Express)
- **Framework**: Express.js
- **Base de données**: MongoDB avec Mongoose
- **Authentification**: JWT
- **Upload de fichiers**: Multer
- **Sécurité**: Helmet, CORS, Rate Limiting

### Frontend (React)
- **Framework**: React 18
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Gestion d'état**: React Context + React Query
- **Styling**: CSS3 avec variables CSS

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 16+
- MongoDB 4.4+
- npm ou yarn

### Installation Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables d'environnement
npm run dev