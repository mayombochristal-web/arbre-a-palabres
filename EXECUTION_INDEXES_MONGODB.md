# 🗄️ Exécution des Index MongoDB

## 📋 Index à Créer

### Candidats
```javascript
db.candidats.createIndex({ email: 1 }, { unique: true, sparse: true })
db.candidats.createIndex({ telephone: 1 }, { unique: true, sparse: true })
```

### Votes
```javascript
db.votes.createIndex({ candidatId: 1 })
```

---

## 🚀 Méthode 1: Script Automatique (Recommandé)

### Utiliser le Script optimizeIndexes.js

Le script a été mis à jour pour inclure tous les index nécessaires.

```bash
# Depuis le dossier backend
cd backend

# Exécuter le script
node scripts/optimizeIndexes.js
```

**Résultat attendu:**
```
🔧 Optimisation des index MongoDB...

📊 Candidats:
  ✅ Index unique: email
  ✅ Index unique: téléphone
  ✅ Index composite: categorie + statut + score
  ✅ Index composite: statut + frais payés
  ✅ Index texte: recherche nom/prénom/email
  ✅ Index classement: categorie + scores

📊 Débats:
  ✅ Index composite: statut + catégorie + date
  ✅ Index composite: participants + statut
  ✅ Index débats actifs

📊 Transactions:
  ✅ Index composite: candidat + date
  ✅ Index composite: statut + type + date
  ✅ Index débat

📊 Votes:
  ✅ Index candidat votes

📈 Statistiques des index:
  Candidats: 8 index
  Débats: 5 index
  Transactions: 4 index

✅ Optimisation des index terminée avec succès!
```

---

## 🌐 Méthode 2: MongoDB Atlas Dashboard

### Via l'Interface Web

1. **Se Connecter à MongoDB Atlas**
   - URL: https://cloud.mongodb.com
   - Se connecter avec votre compte

2. **Sélectionner le Cluster**
   - Cliquer sur votre cluster
   - Cliquer sur **Browse Collections**

3. **Créer les Index Manuellement**

   **Pour la collection `candidats`:**
   - Aller dans l'onglet **Indexes**
   - Cliquer **Create Index**
   - Champ: `email`
   - Options: `{ unique: true, sparse: true }`
   - Répéter pour `telephone`

   **Pour la collection `votes`:**
   - Aller dans l'onglet **Indexes**
   - Cliquer **Create Index**
   - Champ: `candidatId`

---

## 💻 Méthode 3: MongoDB Shell

### Via mongosh (MongoDB Shell)

```bash
# Se connecter à MongoDB
mongosh "votre_connection_string"

# Utiliser la base de données
use arbre_palabres

# Créer les index candidats
db.candidats.createIndex({ email: 1 }, { unique: true, sparse: true })
db.candidats.createIndex({ telephone: 1 }, { unique: true, sparse: true })

# Créer l'index votes
db.votes.createIndex({ candidatId: 1 })

# Vérifier les index créés
db.candidats.getIndexes()
db.votes.getIndexes()
```

---

## 🔍 Vérification des Index

### Vérifier que les Index Sont Créés

```bash
# Exécuter depuis le backend
node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const candidatsIndexes = await mongoose.connection.db.collection('candidats').indexes();
  console.log('Candidats indexes:', candidatsIndexes.map(i => i.name));
  
  const votesIndexes = await mongoose.connection.db.collection('votes').indexes();
  console.log('Votes indexes:', votesIndexes.map(i => i.name));
  
  process.exit(0);
});
"
```

**Résultat attendu:**
```
Candidats indexes: [ '_id_', 'email_unique', 'telephone_unique', ... ]
Votes indexes: [ '_id_', 'candidat_votes' ]
```

---

## ⚡ Impact des Index

### Email et Téléphone (Unique)

**Avant:**
- Recherche email: O(n) - scan complet
- Doublons possibles

**Après:**
- Recherche email: O(log n) - index B-tree
- Doublons impossibles (unique constraint)
- Insertion plus rapide (vérification instantanée)

### Votes par Candidat

**Avant:**
- Requête `db.votes.find({ candidatId: "123" })`: O(n)

**Après:**
- Requête `db.votes.find({ candidatId: "123" })`: O(log n)
- **Amélioration:** ~100x plus rapide pour 10,000 votes

---

## 📊 Taille des Index

Les index occupent de l'espace, mais l'amélioration de performance en vaut la peine:

| Collection | Index | Taille Estimée |
|------------|-------|----------------|
| candidats | email | ~1-2 MB / 10k candidats |
| candidats | telephone | ~1-2 MB / 10k candidats |
| votes | candidatId | ~500 KB / 10k votes |

**Total:** ~3-5 MB pour 10,000 documents (négligeable)

---

## 🚨 Erreurs Possibles

### Erreur: Duplicate Key

```
E11000 duplicate key error collection: arbre_palabres.candidats index: email_unique
```

**Cause:** Un email existe déjà en double dans la base

**Solution:**
```javascript
// Trouver les doublons
db.candidats.aggregate([
  { $group: { _id: "$email", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])

// Nettoyer manuellement les doublons
// Puis recréer l'index
```

### Erreur: Collection Not Found

```
Collection 'votes' not found
```

**Cause:** La collection votes n'existe pas encore

**Solution:** Normal si vous n'avez pas encore de système de votes. L'index sera créé automatiquement lors de la première insertion.

---

## ✅ Checklist Post-Exécution

- [ ] Script `optimizeIndexes.js` exécuté avec succès
- [ ] Index `email_unique` créé sur candidats
- [ ] Index `telephone_unique` créé sur candidats
- [ ] Index `candidat_votes` créé sur votes (si collection existe)
- [ ] Vérification avec `getIndexes()` réussie
- [ ] Aucune erreur dans les logs

---

## 🎯 Recommandation

**Utilisez la Méthode 1 (Script Automatique)**

Avantages:
- ✅ Crée TOUS les index en une fois
- ✅ Gère les erreurs automatiquement
- ✅ Affiche des statistiques
- ✅ Peut être exécuté régulièrement

```bash
cd backend
node scripts/optimizeIndexes.js
```

---

**Besoin d'aide?** Contactez: mayombochristal@gmail.com
