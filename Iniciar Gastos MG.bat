@echo off
cd /d "%~dp0"
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8080" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8091" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
set CACHE_BUST=%RANDOM%%RANDOM%
start "Gastos MG Server" cmd /k "cd /d "%~dp0" && py -m http.server 8091"
timeout /t 2 /nobreak >nul
start "" "http://localhost:8091/index.html?v=209-auth&app=gastos-mg-personal&cb=%CACHE_BUST%"
