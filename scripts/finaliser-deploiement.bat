@echo off
REM Script pour finaliser le déploiement Firebase
REM Usage: finaliser-deploiement.bat

echo ========================================
echo Finalisation Deploiement Firebase
echo ========================================
echo.

echo [ETAPE 1] Verification de .env.production
echo.
if not exist "frontend\.env.production" (
    echo [ERREUR] Fichier .env.production non trouve!
    echo Veuillez creer le fichier avec vos cles Firebase.
    echo Voir: OBTENIR_CLES_FIREBASE.md
    pause
    exit /b 1
)

echo [OK] Fichier .env.production trouve
echo.

echo [ETAPE 2] Rebuild avec les vraies cles
echo.
cd frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Build failed!
    pause
    exit /b 1
)
echo [OK] Build reussi
echo.
cd ..

echo [ETAPE 3] Connexion Firebase
echo.
echo Vous allez etre redirige vers le navigateur pour vous connecter...
firebase login
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Connexion Firebase failed!
    pause
    exit /b 1
)
echo [OK] Connecte a Firebase
echo.

echo [ETAPE 4] Selection du projet
echo.
firebase use --add
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Selection du projet failed!
    pause
    exit /b 1
)
echo [OK] Projet selectionne
echo.

echo [ETAPE 5] Deploiement sur Firebase Hosting
echo.
cd frontend
firebase deploy --only hosting
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Deploiement failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo DEPLOIEMENT REUSSI!
echo ========================================
echo.
echo Votre application est maintenant en ligne!
echo.
echo Prochaines etapes:
echo 1. Ouvrir l'URL affichee ci-dessus dans votre navigateur
echo 2. Tester l'application
echo 3. Configurer les secrets GitHub pour CI/CD
echo.
echo Documentation: INSTRUCTIONS_DEPLOIEMENT.md
echo.
pause
