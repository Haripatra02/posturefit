@echo off
title PostureFit - Workplace Posture Awareness & Activity Platform
color 0A
echo ======================================================================
echo           🌿 POSTUREFIT - 1-CLICK LAUNCHER
echo   A Gamified Web-Based Workplace Posture Awareness Platform
echo ======================================================================
echo.

:: 1. Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on this computer!
    echo Please install Node.js (v18 or higher) from https://nodejs.org
    echo.
    pause
    exit /b
)

echo [1/4] Node.js detected:
node -v
echo.

:: 2. Ensure environment configuration exists
if not exist ".env" (
    if exist ".env.example" (
        echo [2/4] Initializing .env configuration from template...
        copy ".env.example" ".env" >nul
    )
)
if not exist "server\.env" (
    if exist ".env" (
        copy ".env" "server\.env" >nul
    )
)
echo [2/4] Environment configuration verified.
echo.

:: 3. Check if dependencies are installed, install if missing
if not exist "node_modules\" (
    echo [3/4] Installing root dependencies (first-time setup)...
    call npm.cmd install
)
if not exist "server\node_modules\" (
    echo [3/4] Installing server dependencies...
    call npm.cmd --prefix server install
)
if not exist "client\node_modules\" (
    echo [3/4] Installing client dependencies...
    call npm.cmd --prefix client install
)
echo [3/4] Dependencies verified.
echo.

:: 4. Launch the full application
echo [4/4] Starting PostureFit Dev Servers...
echo       - Frontend UI:  http://localhost:5173
echo       - Backend API:  http://localhost:5000
echo.
echo Opening browser in 3 seconds...
start "" "http://localhost:5173"

call npm.cmd run dev

pause
