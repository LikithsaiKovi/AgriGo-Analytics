@echo off
REM Setup Local Environment Variables for AgriGo Analytics
REM This script helps set up the .env file for local development

echo ========================================
echo AgriGo Analytics - Local Setup
echo ========================================
echo.

if not exist "server\config.env" (
    echo Creating server\config.env from template...
    copy server\.env.example server\config.env
    echo ✓ Created server\config.env
) else (
    echo ✓ server\config.env already exists
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit server\config.env with your email settings
echo 2. Run: start-everything.bat
echo.
echo For detailed setup guide, see: LOCAL_DEPLOYMENT.md
echo.
pause
