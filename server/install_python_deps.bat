@echo off
echo Installing Python dependencies for Government Schemes Fetcher...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.7+ from https://python.org
    pause
    exit /b 1
)

REM Install required packages
echo Installing requests...
pip install requests

echo Installing pandas...
pip install pandas

echo Installing schedule...
pip install schedule

echo.
echo Installation completed successfully!
echo.
echo You can now run:
echo   python gov_schemes_fetcher.py
echo   python scheduler.py
echo.
pause

