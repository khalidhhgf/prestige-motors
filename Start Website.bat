@echo off
rem Double-click to start the dealership website (database + site). Close the two windows to stop.
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
if exist ".pgdata\postmaster.pid" del ".pgdata\postmaster.pid"
echo Starting database...
start "Dealership Database" /min cmd /c "node scripts\dev-db.mjs"
timeout /t 20 /nobreak >nul
echo Starting website...
start "Dealership Website" /min cmd /c "npm run start"
timeout /t 8 /nobreak >nul
start "" http://localhost:3010
echo.
echo Website:  http://localhost:3010
echo Admin:    http://localhost:3010/admin
echo (Keep the two minimised windows open while you use the site.)
timeout /t 6 >nul
