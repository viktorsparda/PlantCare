# 🌱 PlantCare - Guía de Instalación

## 📋 Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 14 o superior)
- [npm](https://www.npmjs.com/) (viene con Node.js)
- Cuenta de [Firebase](https://firebase.google.com/)
- (Opcional) [Google AI Studio](https://makersuite.google.com/app/apikey) para Gemini API

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/plantcare-web.git
cd plantcare-web
```

### 2. Instalar dependencias del frontend
```bash
npm install
```

### 3. Instalar dependencias del backend
```bash
cd backend
npm install
cd ..
```

### 4. Configurar Firebase

#### Frontend (config.js)
1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a Configuración del proyecto > General
4. En "Tus apps", selecciona o crea una app web
5. Copia la configuración y edita `lib/firebase.js`

#### Backend (serviceAccountKey.json)
1. Ve a Configuración del proyecto > Cuentas de servicio
2. Haz clic en "Generar nueva clave privada"
3. Descarga el archivo JSON
4. Renómbralo a `serviceAccountKey.json`
5. Colócalo en la carpeta `backend/`

### 5. Configurar variables de entorno

#### Frontend (.env.local)
```bash
cp .env.example .env.local
# Edita .env.local con tus valores de Firebase
```

#### Backend (.env)
```bash
cd backend
cp .env.example .env
# Edita .env con tus valores (opcional para Gemini API)
```

### 6. Configurar Google Gemini API (Opcional)
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API key
3. Añádela a `backend/config.js` o `backend/.env`

## 🎮 Uso

### Opción 1: Inicio rápido (Recomendado)
```bash
# Inicia frontend y backend juntos
start-plantcare.bat
```

### Opción 2: Inicio manual
```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
npm run dev
```

### Opción 3: Scripts individuales
```bash
# Solo backend
start-backend.bat

# Solo frontend
start-frontend.bat
```

## 🔍 Verificación

### Verificar estado de servicios
```bash
check-plantcare.bat
```

### URLs de acceso
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## 🛠️ Solución de Problemas

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
npm install
cd backend && npm install
```

### Error: "Port already in use"
```bash
# Matar procesos en puertos 3000 y 3001
netstat -ano | findstr :3000
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Error: Firebase Authentication
1. Verifica que `serviceAccountKey.json` esté en `backend/`
2. Verifica la configuración en `lib/firebase.js`
3. Asegúrate de que Authentication esté habilitado en Firebase

### Error: Base de datos
La base de datos SQLite se crea automáticamente en `backend/plants.db`

## 📁 Estructura del Proyecto

```
plantcare-web/
├── components/          # Componentes React
├── pages/              # Páginas Next.js
├── lib/                # Configuración Firebase
├── context/            # Context API
├── hooks/              # Custom hooks
├── styles/             # Estilos CSS
├── public/             # Archivos estáticos
├── backend/            # Servidor Express
│   ├── server.js       # Servidor principal
│   ├── config.js       # Configuración
│   └── plants.db       # Base de datos SQLite
├── *.bat               # Scripts de inicio
└── README.md           # Esta guía
```

## 🔑 Funcionalidades

- ✅ Identificación de plantas con AI
- ✅ Recordatorios de cuidado
- ✅ Galería de fotos
- ✅ Consejos personalizados
- ✅ Modo oscuro/claro
- ✅ Responsive design
- ✅ Autenticación con Firebase
- ✅ Base de datos local

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ve el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework React
- [Firebase](https://firebase.google.com/) - Autenticación y backend
- [Google Gemini](https://ai.google.dev/) - AI para identificación de plantas
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [PlantNet](https://plantnet.org/) - Inspiración para la identificación de plantas

---

**Desarrollado con ❤️ para los amantes de las plantas** 🌱
