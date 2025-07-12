@echo off
echo Verificando si el servidor backend está funcionando...
echo.
curl -s http://localhost:3001 > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ El servidor backend está funcionando correctamente en puerto 3001
) else (
    echo ❌ El servidor backend NO está funcionando
    echo.
    echo Para iniciarlo, ejecuta: start-backend.bat
)
echo.
pause
