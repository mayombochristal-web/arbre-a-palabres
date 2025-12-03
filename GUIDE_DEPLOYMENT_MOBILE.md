# Guide de Déploiement Mobile - Arbre à Palabres

Votre application a été préparée pour Android. Voici les étapes pour générer l'APK final et le publier sur le Google Play Store.

## Prérequis
- **Android Studio** installé sur votre ordinateur.
- Un **Compte Développeur Google Play** (frais unique de 25$).

## Étape 1 : Ouvrir le projet Android
1. Ouvrez un terminal dans le dossier `frontend`.
2. Lancez la commande :
   ```bash
   npx cap open android
   ```
   Cela va ouvrir Android Studio avec votre projet.

## Étape 2 : Générer l'APK Signé (Signed Bundle)
Pour le Play Store, vous avez besoin d'un fichier `.aab` (Android App Bundle) signé.

1. Dans Android Studio, allez dans **Build > Generate Signed Bundle / APK**.
2. Sélectionnez **Android App Bundle** et cliquez sur **Next**.
3. Sous **Key store path**, cliquez sur **Create new...** (si vous n'en avez pas déjà un).
   - Choisissez un emplacement pour sauvegarder votre clé (ne la perdez jamais !).
   - Définissez un mot de passe fort.
   - Remplissez les informations (Alias, Password, Certificate info).
4. Cliquez sur **Next**.
5. Sélectionnez **release** comme variante de build.
6. Cliquez sur **Create** (ou Finish).

Une fois terminé, Android Studio vous indiquera où se trouve le fichier `.aab` (généralement dans `android/app/release/`).

## Étape 3 : Publier sur Google Play Console
1. Connectez-vous à la [Google Play Console](https://play.google.com/console).
2. Cliquez sur **Créer une application**.
3. Remplissez les détails (Nom: Arbre à Palabres, Langue, etc.).
4. Dans le tableau de bord, suivez les étapes de configuration (Confidentialité, Accès aux applis, etc.).
5. Allez dans **Production** (menu de gauche).
6. Cliquez sur **Créer une nouvelle version**.
7. Importez votre fichier `.aab` généré à l'étape 2.
8. Ajoutez des notes de version.
9. Vérifiez et lancez le déploiement.

## Notes Importantes
- **Mises à jour** : À chaque modification du code React, lancez `npm run build` puis `npx cap sync` avant de régénérer l'AAB.
- **Version** : Pensez à incrémenter le numéro de version dans `android/app/build.gradle` avant chaque nouvelle publication.
