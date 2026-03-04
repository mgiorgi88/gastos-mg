@echo off
setlocal
set "ROOT=%~dp0"
echo Abrir este SQL en Supabase SQL Editor y ejecutar:
echo %ROOT%sql\health_check.sql
echo.
start "" notepad "%ROOT%sql\health_check.sql"
endlocal
