# 🧪 Guide de Test - L'Arbre à Palabres

## 🔐 Compte Administrateur

**Email**: `admin@arbre-palabres.ga`  
**Mot de passe**: `Admin123!`

---

## 👥 Candidats de Test Disponibles

### Élèves Primaire
1. **Grace Mbina** - Solde: 2000 FCFA
2. **Axel Nguema** - Solde: 1500 FCFA

### Élèves Collège/Lycée  
3. **Sarah Obiang** - Solde: 3000 FCFA
4. **Kevin Ondo** - Solde: 2500 FCFA

### Étudiants Universitaires
5. **Christelle Mboumba** - Solde: 5000 FCFA
6. **Junior Ndong** - Solde: 4500 FCFA
7. **Divine Ella** - Solde: 3500 FCFA
8. **Steeve Koumba** - Solde: 4000 FCFA

---

## 🧪 Tests à Effectuer

### 1️⃣ Test des Statistiques du Fonds ELITE

**Endpoint**: `GET http://localhost:5000/api/debats/statistiques/general`

**Test avec curl**:
```powershell
curl http://localhost:5000/api/debats/statistiques/general
```

**Résultat attendu**:
```json
{
  "success": true,
  "statistiques": {
    "totalDebats": 0,
    "debatsTermines": 0,
    "debatsEnCours": 0,
    "gainsDistribues": 0,
    "fraisOrganisation": 0,
    "debatsParCategorie": [],
    "fondsElite": {
      "participantsEleves": 0,
      "participantsEtudiants": 0,
      "fondsAccumule": 0,
      "objectif": 50000,
      "resteAtteindre": 50000,
      "estViable": false
    }
  }
}
```

---

### 2️⃣ Test de Création de Débat Standard

**Endpoint**: `POST http://localhost:5000/api/debats/standard`

**Prérequis**: Vous devez être authentifié en tant qu'admin

**Étapes**:
1. Récupérez les IDs des 4 étudiants universitaires
2. Créez un débat avec ces IDs

**Exemple avec curl** (remplacez les IDs):
```powershell
curl -X POST http://localhost:5000/api/debats/standard `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d '{
    "participantsIds": ["ID1", "ID2", "ID3", "ID4"],
    "theme": "L'\''entrepreneuriat numérique au Gabon"
  }'
```

**Résultat attendu**:
- Cagnotte totale: 8000 FCFA (2000 × 4)
- Frais organisation: 2000 FCFA (25%)
- Gain vainqueur: 6000 FCFA (75%)

---

### 3️⃣ Test de Création de Défi

**Endpoint**: `POST http://localhost:5000/api/debats/defi`

**Scénario**: Les 4 étudiants misent 1000 FCFA chacun

**Requête**:
```powershell
curl -X POST http://localhost:5000/api/debats/defi `
  -H "Content-Type: application/json" `
  -d '{
    "participantsIds": ["ID1", "ID2", "ID3", "ID4"],
    "miseUnitaire": 1000,
    "theme": "Innovation et développement durable"
  }'
```

**Vérifications**:
- ✅ Soldes débités automatiquement (-1000 FCFA chacun)
- ✅ Cagnotte: 4000 FCFA
- ✅ Transactions créées pour chaque mise
- ✅ Débat créé avec statut "en_attente"

---

### 4️⃣ Test de Clôture de Débat

**Endpoint**: `PATCH http://localhost:5000/api/debats/:id/cloturer`

**Prérequis**: Avoir un débat "en_cours"

**Requête**:
```powershell
curl -X PATCH http://localhost:5000/api/debats/DEBAT_ID/cloturer `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d '{
    "vainqueurId": "CANDIDAT_ID"
  }'
```

**Vérifications**:
- ✅ Solde du vainqueur augmenté
- ✅ Transaction GAIN_DEBAT créée
- ✅ Statut du débat: "termine"
- ✅ Statistiques mises à jour

---

### 5️⃣ Test du Fonds ELITE après Débats

**Scénario**: Après avoir créé plusieurs débats

**Calcul attendu**:
- 2 débats Primaire (8 participants) → 8 × 250 = 2000 FCFA
- 2 débats Collège/Lycée (8 participants) → 8 × 250 = 2000 FCFA  
- 2 débats Universitaire (8 participants) → 8 × 500 = 4000 FCFA
- **Total**: 8000 FCFA / 50000 FCFA (16%)

---

## 🎨 Test des Composants Frontend

### TableauDeBord

**Fichier**: `frontend/src/components/TableauDeBord.jsx`

**Utilisation**:
```jsx
import TableauDeBord from './components/TableauDeBord';

function App() {
  return <TableauDeBord candidatId="CANDIDAT_ID_HERE" />;
}
```

**Éléments à vérifier**:
- ✅ Affichage du solde en FCFA
- ✅ Statistiques victoires/défaites
- ✅ Bouton "Remettre mon Trophée en Jeu 🏆"
- ✅ Couleurs gabonaises (vert, jaune, bleu)
- ✅ Effets hover sur le bouton

### SalleDebat

**Fichier**: `frontend/src/components/SalleDebat.jsx`

**Utilisation**:
```jsx
import SalleDebat from './components/SalleDebat';

function DebatPage() {
  return <SalleDebat debatId="DEBAT_ID_HERE" />;
}
```

**Éléments à vérifier**:
- ✅ Affichage de la cagnotte totale
- ✅ Répartition 75%/25% visible
- ✅ Grille des 4 participants
- ✅ Scores affichés (si disponibles)
- ✅ Badge de statut (en attente/en cours/terminé)
- ✅ Badge spécial pour les défis 🏆

---

## 📊 Scénario de Test Complet

### Étape 1: Créer un Débat Standard
1. Sélectionnez 4 candidats universitaires
2. Créez le débat avec le thème "Entrepreneuriat"
3. Vérifiez la cagnotte: 8000 FCFA

### Étape 2: Démarrer le Débat
1. Changez le statut à "en_cours"
2. Ajoutez des scores aux participants

### Étape 3: Clôturer et Distribuer
1. Désignez le vainqueur (ex: Christelle Mboumba)
2. Vérifiez que son solde passe de 5000 à 11000 FCFA
3. Vérifiez la transaction de gain

### Étape 4: Créer un Défi
1. Les 4 mêmes candidats misent 2000 FCFA chacun
2. Vérifiez les soldes débités
3. Cagnotte: 8000 FCFA

### Étape 5: Vérifier le Fonds ELITE
1. Consultez `/api/debats/statistiques/general`
2. Vérifiez:
   - 8 participants universitaires
   - Fonds accumulé: 4000 FCFA (8 × 500)
   - Reste à atteindre: 46000 FCFA

---

## 🔍 Endpoints API Disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/debats/statistiques/general` | Statistiques + Fonds ELITE |
| POST | `/api/debats/standard` | Créer débat standard |
| POST | `/api/debats/defi` | Créer un défi |
| GET | `/api/debats/defis/disponibles` | Lister les défis |
| PATCH | `/api/debats/:id/cloturer` | Clôturer et distribuer |
| PATCH | `/api/debats/:id/demarrer` | Démarrer un débat |
| GET | `/api/debats/:id` | Détails d'un débat |
| GET | `/api/candidats` | Liste des candidats |

---

## 🐛 Dépannage

### Problème: "Solde insuffisant"
**Solution**: Vérifiez que les candidats ont assez de solde pour la mise

### Problème: "4 participants requis"
**Solution**: Assurez-vous d'envoyer exactement 4 IDs de candidats

### Problème: "Même catégorie requise"
**Solution**: Tous les participants doivent être de la même catégorie

---

## 📝 Notes Importantes

- Les débats standards utilisent les frais d'inscription comme cagnotte
- Les défis utilisent les mises des participants
- Le Fonds ELITE se calcule automatiquement (250/500 FCFA par participant)
- L'objectif du Fonds ELITE est de 50 000 FCFA
- La répartition est toujours 25% organisation / 75% vainqueur

---

Bon test! 🌳
