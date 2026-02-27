@echo off
cd /d "%~dp0"
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8080" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8091" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
set CACHE_BUST=%RANDOM%%RANDOM%
start "" "http://localhost:8091/index.html?app=gastos-mg-personal&v=%CACHE_BUST%"
py -m http.server 8091
