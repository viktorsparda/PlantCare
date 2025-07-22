# 🌱 PlantCare - Identificador de Plantas con AI

**PlantCare** es una aplicación web moderna que utiliza inteligencia artificial para identificar plantas y ayudar en su cuidado diario.

## ✨ Características

### 🔍 **Identificación de Plantas**
- Identificación automática usando Google Gemini AI
- Análisis de imágenes con alta precisión
- Información detallada sobre especies
- Base de datos local de respaldo

### 🌿 **Gestión de Plantas**
- Galería personal de plantas
- Información detallada de cuidado
- Fotos y notas personalizadas
- Edición de información

### ⏰ **Recordatorios Inteligentes**
- Recordatorios personalizados (riego, fertilización, poda)
- Notificaciones por vencimiento
- Frecuencia configurable
- Vista de recordatorios urgentes

### 👤 **Perfil de Usuario**
- Gestión completa de perfil
- Cambio de contraseña seguro
- Estadísticas de uso
- Configuración personalizada

### 🎨 **Diseño Moderno**
- Interfaz limpia y moderna
- Modo oscuro/claro
- Totalmente responsive
- Accesible y fácil de usar

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta Firebase

### Instalación
```bash
# Clonar repositorio
git clone https://github.com/viktorsparda/PlantCare.git
cd PlantCare

# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
cd ..

# Configurar variables de entorno
cp .env.example .env.local
cp backend/.env.example backend/.env

# Iniciar aplicación completa
npm run dev &
cd backend && npm start
```

### Acceso
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000

## 📁 Estructura del Proyecto

```
PlantCare/
├── 📁 components/          # Componentes React
│   ├── Layout.js          # Layout principal
│   ├── PlantIdentifier.js # Identificador de plantas
│   ├── MyPlants.js        # Galería de plantas
│   └── Recordatorios.js   # Sistema de recordatorios
├── 📁 pages/              # Páginas Next.js
│   ├── index.js           # Página principal
│   ├── dashboard.js       # Dashboard principal
│   ├── perfil.js          # Perfil de usuario
│   └── plant/[id].js      # Detalles de planta
├── 📁 backend/            # Servidor Express
│   ├── server.js          # Servidor principal
│   ├── config.js          # Configuración
│   └── plants.db          # Base de datos SQLite
├── 📁 styles/             # Estilos CSS
├── 📁 lib/                # Utilidades y configuración
└── 📁 context/            # Context API
```

## 🛠️ Tecnologías

### Frontend
- **Framework**: Next.js 15
- **UI**: React 19 + Tailwind CSS
- **Autenticación**: Firebase Auth
- **Estado**: Context API + Custom Hooks
- **Iconos**: Emojis nativos

### Backend
- **Servidor**: Node.js + Express
- **Base de datos**: SQLite
- **IA**: Google Gemini AI
- **Autenticación**: Firebase Admin
- **Almacenamiento**: Local file system

### Herramientas
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier
- **Deployment**: Vercel + Railway

## 🔧 Configuración Avanzada

### Variables de Entorno
```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://plantcare-production-52be.up.railway.app
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_PLANTNET_API_KEY=your-plantnet-api-key

# Backend (.env)
GEMINI_API_KEY=your-gemini-api-key
FIREBASE_SERVICE_ACCOUNT=your-firebase-service-account-json
PORT=4000
```

### Firebase Setup
1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Authentication (Email/Password)
3. Generar Service Account Key
4. Configurar Web App

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en CI
npm run test:ci
```

## 🚀 Despliegue

### Vercel (Frontend)
```bash
# Deploy a producción
vercel --prod
```

### Railway (Backend)
```bash
# Deploy backend
railway login
railway link
railway up
```

## 📈 Estadísticas

- 🌱 **Plantas identificadas**: 500+
- 📊 **Precisión de AI**: 85%+
- ⏰ **Recordatorios activos**: 1000+
- 👥 **Usuarios activos**: 50+

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Ver [CONTRIBUTING.md](CONTRIBUTING.md) para detalles.

### Proceso de Contribución
1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Changelog

Ver [CHANGELOG.md](CHANGELOG.md) para historial de cambios.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework React
- [Firebase](https://firebase.google.com/) - Autenticación y backend
- [Google Gemini](https://ai.google.dev/) - AI para identificación
- [PlantNet API](https://my.plantnet.org/) - API de identificación de plantas
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vercel](https://vercel.com/) - Deployment Frontend
- [Railway](https://railway.app/) - Deployment Backend

## 📞 Soporte

-  Issues: [GitHub Issues](https://github.com/viktorsparda/PlantCare/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/viktorsparda/PlantCare/discussions)
- 📧 Email: Contacta a través de GitHub

## 🔗 Links Útiles

- � **Demo Live**: [https://plant-care-blond.vercel.app](https://plant-care-blond.vercel.app)
- � **API Backend**: [https://plantcare-production-52be.up.railway.app](https://plantcare-production-52be.up.railway.app)
- 📂 **Repositorio**: [https://github.com/viktorsparda/PlantCare](https://github.com/viktorsparda/PlantCare)

---

**Desarrollado con ❤️ por la comunidad para los amantes de las plantas** 🌿✨

## 🌐 Enlaces de Despliegue

### Frontend (Vercel)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fviktorsparda%2FPlantCare)

### Backend (Railway)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/viktorsparda/PlantCare)

---

## 📱 Demo en Vivo

🔗 **Aplicación**: [https://plant-care-blond.vercel.app](https://plant-care-blond.vercel.app)
🔗 **API Backend**: [https://plantcare-production-52be.up.railway.app](https://plantcare-production-52be.up.railway.app)

---

**¡Disfruta cuidando tus plantas con PlantCare! 🌱✨**