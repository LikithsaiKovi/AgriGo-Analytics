@echo off
setlocal enabledelayedexpansion

echo Starting AgriGo Analytics...
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

if not exist "server\node_modules" (
    echo Installing backend dependencies...
    cd server
    call npm install
    cd ..
)

echo.
echo Starting servers...
echo.

REM Start Backend
cd server
start "Backend (5000)" cmd /k "node server.js"
cd ..

timeout /t 3 /nobreak > nul

REM Start Frontend
start "Frontend (3000)" cmd /k "npm run dev"

echo.
echo ========================================
echo Application started!
echo ========================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:5000
echo.
echo Close these windows to stop the servers.
echo.
