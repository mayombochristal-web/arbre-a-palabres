# 📋 Checklist de Déploiement - Arbre à Palabres

## Avant de Commencer

- [ ] Node.js 18+ installé
- [ ] npm/yarn installé
- [ ] Git configuré
- [ ] Compte Google Cloud créé
- [ ] Compte Firebase créé
- [ ] Compte GitHub configuré

---

## Phase 1: Configuration Google Cloud

- [ ] Projet Google Cloud créé (`arbre-a-palabre-9e83a`)
- [ ] APIs activées:
  - [ ] Firebase Hosting API
  - [ ] Firebase Management API
  - [ ] Cloud Resource Manager API
  - [ ] Identity Toolkit API
- [ ] IAM configuré (permissions appropriées)
- [ ] Facturation configurée (si nécessaire)

---

## Phase 2: Configuration Firebase

- [ ] Projet Firebase créé/lié
- [ ] Firebase CLI installé (`npm install -g firebase-tools`)
- [ ] Connexion Firebase (`firebase login`)
- [ ] Projet initialisé (`firebase init`)
- [ ] `.firebaserc` créé avec le bon project ID
- [ ] `firebase.json` configuré avec headers de sécurité

---

## Phase 3: Configuration OAuth 2.0

- [ ] OAuth Consent Screen configuré
- [ ] ID client OAuth 2.0 créé (Web)
- [ ] Origines JavaScript autorisées ajoutées
- [ ] URI de redirection configurés
- [ ] Identifiants téléchargés et sécurisés

---

## Phase 4: Configuration Mobile (Optionnel)

- [ ] Keystore Android généré
- [ ] SHA-1 extrait
- [ ] SHA-256 extrait
- [ ] Application Android ajoutée dans Firebase
- [ ] `google-services.json` téléchargé
- [ ] `google-services.json` placé dans `android/app/`
- [ ] Capacitor configuré

---

## Phase 5: Variables d'Environnement

### Backend
- [ ] `.env` créé (copie de `.env.example`)
- [ ] `MONGODB_URI` configuré
- [ ] `JWT_SECRET` généré et configuré
- [ ] `PORT` configuré
- [ ] `NODE_ENV` = production
- [ ] `FRONTEND_URL` configuré

### Frontend
- [ ] `.env.production` créé
- [ ] `REACT_APP_API_URL` configuré
- [ ] Variables Firebase configurées (API_KEY, AUTH_DOMAIN, etc.)

---

## Phase 6: Secrets GitHub

- [ ] Repository GitHub créé/configuré
- [ ] Secrets ajoutés dans Settings > Secrets:
  - [ ] `FIREBASE_SERVICE_ACCOUNT`
  - [ ] `FIREBASE_TOKEN`
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET`
  - [ ] `REACT_APP_API_URL`
  - [ ] `REACT_APP_FIREBASE_API_KEY`
  - [ ] `REACT_APP_FIREBASE_AUTH_DOMAIN`
  - [ ] `REACT_APP_FIREBASE_PROJECT_ID`
  - [ ] `REACT_APP_FIREBASE_STORAGE_BUCKET`
  - [ ] `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `REACT_APP_FIREBASE_APP_ID`

---

## Phase 7: Déploiement Frontend

- [ ] Dependencies installées (`cd frontend && npm ci`)
- [ ] Build de production créé (`npm run build`)
- [ ] Test local (`firebase serve`)
- [ ] Déploiement Firebase (`firebase deploy --only hosting`)
- [ ] URL de production vérifiée
- [ ] Test de l'application déployée

---

## Phase 8: Déploiement Backend

### Option A: Render (Actuel)
- [ ] Variables d'environnement configurées sur Render
- [ ] Auto-deploy activé depuis GitHub
- [ ] Backend déployé et fonctionnel
- [ ] Health check OK (`/sante`)

### Option B: Cloud Run (Optionnel)
- [ ] Dockerfile créé
- [ ] Image Docker buildée
- [ ] Image pushée sur GCR
- [ ] Service Cloud Run déployé
- [ ] Secrets configurés dans Secret Manager
- [ ] URL Cloud Run obtenue

---

## Phase 9: CI/CD

- [ ] Workflow `tests.yml` créé
- [ ] Workflow `deploy-frontend.yml` créé
- [ ] Workflow `deploy-backend.yml` créé (si Cloud Run)
- [ ] Test du CI/CD avec une branche de test
- [ ] Vérification des déploiements automatiques

---

## Phase 10: Sécurité

- [ ] `.gitignore` vérifié (pas de secrets commitées)
- [ ] CORS configuré correctement
- [ ] Rate limiting activé
- [ ] Helmet.js configuré
- [ ] JWT avec expiration
- [ ] Validation des inputs
- [ ] MongoDB sanitization
- [ ] HTTPS forcé
- [ ] Headers de sécurité configurés

---

## Phase 11: Tests

### Tests Automatisés
- [ ] Backend tests passent (`npm test`)
- [ ] Frontend build réussit (`npm run build`)

### Tests Manuels
- [ ] Page d'accueil charge
- [ ] Inscription fonctionne
- [ ] Connexion admin fonctionne
- [ ] Création de débat fonctionne
- [ ] API backend répond
- [ ] CORS fonctionne
- [ ] Mobile app build (si applicable)

---

## Phase 12: Monitoring

- [ ] Logs configurés (Winston)
- [ ] Monitoring d'erreurs (optionnel: Sentry)
- [ ] Analytics configuré (optionnel: Google Analytics)
- [ ] Alertes configurées (optionnel)

---

## Phase 13: Documentation

- [ ] README.md à jour
- [ ] DEPLOIEMENT_GOOGLE.md créé
- [ ] SECURITE.md créé
- [ ] Variables d'environnement documentées
- [ ] Procédures de déploiement documentées

---

## Phase 14: Backup

- [ ] Backup MongoDB configuré
- [ ] Procédure de restauration testée
- [ ] Secrets sauvegardés en lieu sûr
- [ ] Keystore sauvegardé (si mobile)

---

## Validation Finale

- [ ] ✅ Frontend accessible: https://arbre-a-palabre-9e83a.web.app
- [ ] ✅ Backend accessible: https://arbre-palabres-backend.onrender.com
- [ ] ✅ Health check OK
- [ ] ✅ Inscription fonctionne
- [ ] ✅ Connexion fonctionne
- [ ] ✅ Débats fonctionnent
- [ ] ✅ Paiements fonctionnent
- [ ] ✅ CI/CD fonctionne
- [ ] ✅ Pas de secrets exposés
- [ ] ✅ Pas de vulnérabilités critiques (`npm audit`)

---

## Post-Déploiement

- [ ] Communiquer les URLs aux utilisateurs
- [ ] Former les administrateurs
- [ ] Surveiller les logs
- [ ] Collecter les feedbacks
- [ ] Planifier les mises à jour

---

## Commandes Rapides

```bash
# Déployer frontend
cd frontend && npm run build && firebase deploy --only hosting

# Tester backend
cd backend && npm test -- --runInBand

# Vérifier santé backend
curl https://arbre-palabres-backend.onrender.com/sante

# Vérifier frontend
curl -I https://arbre-a-palabre-9e83a.web.app

# Audit sécurité
npm audit

# Générer SHA keys (Android)
./scripts/generate-sha.sh
```

---

**🎉 Félicitations! Votre application est prête pour la production!**
