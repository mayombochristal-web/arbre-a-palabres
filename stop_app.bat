@echo off
echo ========================================
echo   L'Arbre a Palabres - Arret
echo ========================================
echo.

echo Arret des serveurs...

REM Kill processes on port 5001 (Backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
    echo Arret du Backend (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

REM Kill processes on port 3000 (Frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Arret du Frontend (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

echo.
echo ========================================
echo   Application arretee avec succes!
echo ========================================
pause
