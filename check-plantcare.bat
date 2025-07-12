@echo off
echo Verificando estado de PlantCare...
echo.

echo Verificando backend (puerto 3001)...
curl -s http://localhost:3001 > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Backend funcionando correctamente
) else (
    echo ❌ Backend NO está funcionando
)

echo.
echo Verificando frontend (puerto 3000)...
curl -s http://localhost:3000 > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Frontend funcionando correctamente
) else (
    echo ❌ Frontend NO está funcionando
)

echo.
echo Estado completo:
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Si algún servicio no funciona, ejecuta: start-plantcare.bat
echo.
pause
