@echo off
title Buytopia Marketplace - Full Stack Server
color 0A

echo ============================================
echo   Buytopia Marketplace - Full Stack Start
echo ============================================
echo.

:: Start Backend
echo [1/2] Starting Backend server...
cd /d "%~dp0backend"
start "Buytopia Backend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo   [OK] Backend window opened
echo.

:: Start Frontend
echo [2/2] Starting Frontend server...
cd /d "%~dp0frontend"
start "Buytopia Frontend" cmd /k "npm start"
echo   [OK] Frontend window opened
echo.

echo ============================================
echo   All services started!
echo   - Backend:  http://localhost:5000
echo   - Frontend: http://localhost:3000
echo ============================================
echo.
echo Press any key to close this window...
pause >nul
