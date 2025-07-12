# Cómo iniciar el servidor backend

## Opción 1: Usando el archivo batch (Recomendado)
1. Haz doble clic en el archivo `start-backend.bat` en la carpeta raíz del proyecto
2. Se abrirá una ventana de comandos y el servidor se iniciará automáticamente
3. Verás el mensaje: "Backend listening on http://localhost:3001"
4. Mantén esta ventana abierta mientras uses la aplicación

## Opción 2: Usando la línea de comandos
1. Abre una terminal/cmd
2. Navega a la carpeta backend: `cd c:\Users\sgt_j\plantcare-web\backend`
3. Ejecuta: `node server.js`
4. Verás el mensaje: "Backend listening on http://localhost:3001"

## Problemas comunes

### Error: "Cannot find module"
- Asegúrate de haber instalado las dependencias: `npm install` en la carpeta backend

### Error: "Port already in use"
- Otro proceso está usando el puerto 3001
- Cierra cualquier otra instancia del servidor backend
- O reinicia tu computadora

### Error: "Firebase/Database connection"
- Verifica que el archivo `serviceAccountKey.json` esté en la carpeta backend
- Verifica que el archivo `config.js` tenga las configuraciones correctas

## Funcionalidades del servidor
- Puerto: 3001
- Endpoints de plantas: `/plants`
- Endpoints de recordatorios: `/reminders`
- Autenticación: Firebase Authentication
- Base de datos: SQLite (plants.db)

## Detener el servidor
- Presiona `Ctrl + C` en la ventana de comandos
- O simplemente cierra la ventana de comandos
