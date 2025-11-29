@echo off
echo ========================================
echo   L'Arbre a Palabres - Demarrage
echo ========================================
echo.

REM Kill any existing processes on ports 5001 and 3000
echo Nettoyage des ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a 2>nul
)
echo Ports nettoyes.
echo.

REM Check if backend directory exists
if not exist "backend" (
    echo ERREUR: Le dossier backend n'existe pas!
    pause
    exit /b 1
)

REM Check if frontend directory exists
if not exist "frontend" (
    echo ERREUR: Le dossier frontend n'existe pas!
    pause
    exit /b 1
)

echo Demarrage du Backend...
start "Arbre-Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo Demarrage du Frontend...
start "Arbre-Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo   Application demarree avec succes!
echo ========================================
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo.
echo Appuyez sur une touche pour quitter...
pause >nul
