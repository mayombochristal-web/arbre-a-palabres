# Guide de Test - Auto-Refresh des Débats

## ✅ Vérifications Préliminaires

### 1. Backend Actif
Vérifiez que le backend tourne sur le port 5001:
```bash
# Le terminal backend devrait afficher:
🚀 Backend opérationnel sur le port 5001
✅ Socket.io initialisé
```

### 2. Frontend Actif
Le frontend devrait tourner sur le port 3000:
```bash
# Ouvrez http://localhost:3000
```

## 🧪 Test de l'Auto-Refresh

### Scénario 1: Filtres des Débats

1. **Aller sur `/debats`**
   - Vous devriez voir tous les débats

2. **Cliquer sur "En attente"**
   - Seuls les débats avec `statut: 'en_attente'` s'affichent
   - L'URL ne change pas (filtre côté client)

3. **Cliquer sur "En cours"**
   - Seuls les débats `en_cours` s'affichent

4. **Cliquer sur "Terminés"**
   - Seuls les débats `termine` s'affichent

5. **Cliquer sur "Tous"**
   - Tous les débats réapparaissent

### Scénario 2: Création de Débat

1. **Ouvrir deux onglets:**
   - Onglet A: `http://localhost:3000/debats`
   - Onglet B: `http://localhost:3000/admin/nouveau-debat`

2. **Dans l'onglet B (Admin):**
   - Créer un nouveau débat
   - Remplir le formulaire
   - Soumettre

3. **Dans l'onglet A (Liste):**
   - **Attendre max 10 secondes**
   - Le nouveau débat devrait apparaître automatiquement
   - Pas besoin de rafraîchir manuellement

### Scénario 3: Modification de Débat

1. **Onglet A:** `/admin/debats`
2. **Onglet B:** `/debats`

3. **Dans l'onglet A:**
   - Changer le statut d'un débat
   - Ex: "en_attente" → "en_cours"

4. **Dans l'onglet B:**
   - Attendre 10 secondes
   - Le statut devrait se mettre à jour

## 🔍 Debugging

### Problème: Aucun débat ne s'affiche

**Solution 1: Vérifier l'API**
```bash
# Dans un terminal PowerShell
curl http://localhost:5001/api/debats
```

Si vous obtenez une erreur, le backend n'est pas accessible.

**Solution 2: Vérifier la console navigateur**
1. Ouvrir DevTools (F12)
2. Onglet Console
3. Chercher des erreurs rouges
4. Vérifier les requêtes dans l'onglet Network

### Problème: Les débats ne se rafraîchissent pas

**Vérification 1: Console navigateur**
```javascript
// Vous devriez voir toutes les 10 secondes:
GET http://localhost:5001/api/debats
```

**Vérification 2: Indicateur visuel**
- Le point vert devrait pulser
- Texte "Actualisation automatique" visible

**Solution:**
1. Rafraîchir la page (F5)
2. Vider le cache (Ctrl+Shift+R)
3. Redémarrer le frontend

### Problème: Filtres ne fonctionnent pas

**Vérification:**
```javascript
// Dans la console navigateur:
// Cliquer sur un filtre et vérifier:
console.log('Filter actif:', filter);
```

**Solution:**
- Le code est correct
- Vérifier que les débats ont bien des statuts différents
- Créer des débats de test avec différents statuts

## 📊 Données de Test

### Créer des Débats de Test

Pour tester les filtres, créez des débats avec différents statuts:

1. **Débat "En attente":**
   - Créer via `/admin/nouveau-debat`
   - Ne pas le démarrer

2. **Débat "En cours":**
   - Créer un débat
   - Le démarrer via `/admin/debats`
   - Changer statut → "en_cours"

3. **Débat "Terminé":**
   - Créer un débat
   - Le démarrer
   - Désigner un vainqueur
   - Statut passe à "termine"

## 🎯 Comportement Attendu

### Auto-Refresh
- **Fréquence:** Toutes les 10 secondes
- **Silencieux:** Pas de flash/reload
- **Transparent:** L'utilisateur ne remarque rien

### Filtres
- **Instantané:** Changement immédiat
- **Persistant:** Garde le filtre actif pendant l'auto-refresh
- **Visuel:** Bouton actif surligné en vert

### Performance
- **Pas de lag:** Interface reste fluide
- **Pas de duplication:** Chaque débat apparaît une seule fois
- **Ordre:** Débats triés par date (plus récent en premier)

## 🚨 Problèmes Connus

### 1. CORS Error
Si vous voyez dans la console:
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Vérifier que le backend a bien configuré CORS
- Redémarrer le backend

### 2. Network Error
```
Error: Network Error
```

**Solution:**
- Backend n'est pas démarré
- Mauvaise URL API
- Vérifier `REACT_APP_API_URL` dans `.env.local`

### 3. Empty Array
```
debats: []
```

**Solution:**
- Aucun débat dans la base de données
- Créer des débats de test via l'admin

## ✅ Checklist de Validation

- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Page `/debats` charge correctement
- [ ] Tous les débats s'affichent au chargement
- [ ] Filtre "En attente" fonctionne
- [ ] Filtre "En cours" fonctionne
- [ ] Filtre "Terminés" fonctionne
- [ ] Filtre "Tous" réaffiche tout
- [ ] Point vert pulse (animation)
- [ ] Nouveau débat apparaît en max 10s
- [ ] Modification de débat se propage en max 10s
- [ ] Pas d'erreurs dans la console
- [ ] Pas de requêtes échouées dans Network

## 📝 Notes

- L'auto-refresh utilise **polling** (requêtes régulières)
- Pas de WebSocket pour l'instant (Socket.io préparé mais non utilisé)
- Intervalle de 10s = bon compromis performance/réactivité
- Les filtres sont côté client (pas de nouvelle requête API)
