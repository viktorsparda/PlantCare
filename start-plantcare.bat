@echo off
echo Iniciando PlantCare (Frontend + Backend)...
echo.
echo Iniciando servidor backend...
start "Backend Server" cmd /c "cd /d c:\Users\sgt_j\plantcare-web\backend && echo Backend iniciándose en puerto 3001... && node server.js"

timeout /t 3 /nobreak > nul

echo Iniciando aplicación frontend...
start "Frontend App" cmd /c "cd /d c:\Users\sgt_j\plantcare-web && echo Frontend iniciándose en puerto 3000... && npm run dev"

echo.
echo ✅ PlantCare se está iniciando...
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul
