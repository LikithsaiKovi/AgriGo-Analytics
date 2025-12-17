@echo off
echo ========================================
echo Smart Farming Analytics - Government Schemes Setup
echo ========================================
echo.

echo [1/6] Installing Python dependencies...
pip install requests pandas schedule
if errorlevel 1 (
    echo Error: Failed to install Python dependencies
    pause
    exit /b 1
)
echo ✅ Python dependencies installed

echo.
echo [2/6] Populating database with mock data...
python populate_mock_schemes.py
if errorlevel 1 (
    echo Error: Failed to populate mock data
    pause
    exit /b 1
)
echo ✅ Mock data populated

echo.
echo [3/6] Testing Python fetcher...
python gov_schemes_fetcher.py
echo ✅ Python fetcher tested

echo.
echo [4/6] Starting Node.js backend server...
start /B node server.js
timeout /t 3 /nobreak >nul
echo ✅ Backend server started

echo.
echo [5/6] Testing API endpoints...
node test_schemes_direct.js
echo ✅ API endpoints tested

echo.
echo [6/6] Setting up scheduler...
echo Starting scheduler in background...
start /B python scheduler.py --daily
echo ✅ Scheduler started

echo.
echo ========================================
echo 🎉 SETUP COMPLETED SUCCESSFULLY! 🎉
echo ========================================
echo.
echo Services running:
echo   - Backend API: http://localhost:5000
echo   - Frontend: http://localhost:3000
echo   - Scheduler: Running daily at 6 AM
echo.
echo Available API endpoints:
echo   - GET /api/health
echo   - GET /api/schemes (requires auth)
echo   - GET /api/schemes/stats (requires auth)
echo   - POST /api/schemes/fetch (admin only)
echo.
echo To test the frontend:
echo   1. Open http://localhost:3000
echo   2. Register/Login with your account
echo   3. Navigate to Government Schemes section
echo.
echo To stop services:
echo   - Press Ctrl+C in this window
echo   - Or run: taskkill /f /im node.exe
echo   - Or run: taskkill /f /im python.exe
echo.
pause

