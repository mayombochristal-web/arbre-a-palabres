@echo off
REM Script PowerShell pour déployer l'application Arbre à Palabres
REM Usage: deploy.bat [frontend|backend|all|test]

setlocal

set DEPLOY_TARGET=%1
if "%DEPLOY_TARGET%"=="" set DEPLOY_TARGET=all

echo ========================================
echo Arbre a Palabres - Deployment Script
echo Target: %DEPLOY_TARGET%
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    exit /b 1
)

REM Check if Firebase CLI is installed
where firebase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Firebase CLI not found. Installing...
    npm install -g firebase-tools
)

if "%DEPLOY_TARGET%"=="frontend" goto deploy_frontend
if "%DEPLOY_TARGET%"=="backend" goto deploy_backend
if "%DEPLOY_TARGET%"=="test" goto run_tests
if "%DEPLOY_TARGET%"=="all" goto deploy_all
goto unknown_target

:deploy_frontend
echo [INFO] Deploying frontend...
cd frontend
call npm ci
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies
    exit /b 1
)
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to build frontend
    exit /b 1
)
call firebase deploy --only hosting
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to deploy to Firebase
    exit /b 1
)
echo [SUCCESS] Frontend deployed!
echo URL: https://arbre-a-palabre-9e83a.web.app
cd ..
goto end

:deploy_backend
echo [INFO] Backend deployment...
echo [WARN] Backend is configured for auto-deployment on Render
echo [INFO] Push to main branch to trigger deployment
echo [INFO] Or manually deploy from: https://dashboard.render.com
goto end

:run_tests
echo [INFO] Running tests...
cd backend
call npm test -- --runInBand
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend tests failed
    exit /b 1
)
cd ..
cd frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend build failed
    exit /b 1
)
cd ..
echo [SUCCESS] All tests passed!
goto end

:deploy_all
call :run_tests
if %ERRORLEVEL% NEQ 0 exit /b 1
call :deploy_frontend
if %ERRORLEVEL% NEQ 0 exit /b 1
call :deploy_backend
goto end

:unknown_target
echo [ERROR] Unknown target: %DEPLOY_TARGET%
echo Usage: deploy.bat [frontend^|backend^|all^|test]
exit /b 1

:end
echo.
echo ========================================
echo Deployment complete!
echo ========================================
endlocal
