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
git clone https://github.com/tu-usuario/plantcare-web.git
cd plantcare-web

# Instalar dependencias
npm run setup

# Configurar variables de entorno
cp .env.example .env.local
cp backend/.env.example backend/.env

# Iniciar aplicación completa
start-plantcare.bat
```

### Acceso
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## 📁 Estructura del Proyecto

```
plantcare-web/
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
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Backend (.env)
GEMINI_API_KEY=your-gemini-api-key
FIREBASE_PROJECT_ID=your-project-id
PORT=3001
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
cd backend
railway deploy
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
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vercel](https://vercel.com/) - Deployment

## 📞 Soporte

- 📧 Email: support@plantcare.com
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/plantcare-web/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/tu-usuario/plantcare-web/discussions)

## 🔗 Links Útiles

- [📚 Documentación](https://plantcare-docs.vercel.app)
- [🚀 Demo Live](https://plantcare-web.vercel.app)
- [📊 Status Page](https://status.plantcare.com)
- [🎨 Design System](https://design.plantcare.com)

---

**Desarrollado con ❤️ por la comunidad para los amantes de las plantas** 🌿✨

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftu-usuario%2Fplantcare-web)
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/tu-usuario/plantcare-web)
        notes TEXT,
        image TEXT,
        lastWatered TEXT,
        wateringFrequency INTEGER
      )`);
    });
    ```

---

### 3. Vistas y Plantillas (Frontend con Next.js)

El frontend se encarga de la capa de presentación. En Next.js, los componentes de React actúan como Vistas y Plantillas.

#### **Plantillas (Templates)**

Una plantilla es una estructura base que se reutiliza en varias páginas. En este proyecto, `components/Layout.js` es la plantilla principal.

*   **Implementación:** `Layout.js` define la estructura común de la página, incluyendo la barra lateral de navegación (`<aside>`) y el encabezado (`<header>`). Envuelve el contenido específico de cada página (representado por `{children}`).

*   **Código Identificado (`components/Layout.js`):**
    ```javascript
    export default function Layout({ children, pageTitle }) {
      return (
        <div className="min-h-screen flex ...">
          <aside ...>
            {/* Barra de navegación lateral */}
          </aside>
          <div className="flex-1 flex flex-col ...">
            <header ...>
              {/* Encabezado de la página */}
            </header>
            <main className="flex-1 px-8 py-8">{children}</main>
            <HelpButton />
          </div>
        </div>
      );
    }
    ```

#### **Vistas (Views)**

Una vista es un componente que renderiza una porción específica de la interfaz, a menudo mostrando datos obtenidos del backend. `components/MyPlants.js` es un excelente ejemplo.

*   **Implementación:** Este componente obtiene la lista de plantas del usuario desde la API (`/api/plants/:userId`), la almacena en un estado (`plants`) y luego la renderiza como una lista de tarjetas.

*   **Código Identificado (`components/MyPlants.js`):**
    ```javascript
    // ...
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {plants.map((plant) => (
          <div key={plant.id} className="relative ...">
            {/* ...código para mostrar la tarjeta de la planta... */}
            <h3 className="text-xl font-bold text-green-800 dark:text-green-200">{plant.name}</h3>
            <p className="text-md text-gray-600 dark:text-gray-400">{plant.species}</p>
            {/* ...más detalles de la planta... */}
          </div>
        ))}
      </div>
    );
    ```