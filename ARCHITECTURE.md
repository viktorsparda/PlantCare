# 🌱 PlantCare - Arquitectura del Sistema

## 📋 Análisis de la Arquitectura y Framework

Este documento describe los aspectos clave del framework implementados en el proyecto, identificando el uso de la base de datos, modelos, vistas y plantillas.

### Resumen de la Arquitectura

El proyecto utiliza una arquitectura de dos partes:

1. **Backend:** Un servidor Node.js con Express, que funciona como una API REST. Se encarga de la lógica de negocio y la comunicación con la base de datos.
2. **Frontend:** Una aplicación Next.js (un framework de React), que consume los datos de la API del backend y los presenta al usuario.

---

### 1. Base de Datos

El backend utiliza **SQLite**, una base de datos ligera basada en archivos.

* **Implementación:** La conexión a la base de datos se establece en `backend/server.js`. El archivo físico de la base de datos es `backend/plants.db`.

* **Código Identificado (`backend/server.js`):**
  ```javascript
  const sqlite3 = require('sqlite3').verbose();
  
  // Conectar a la base de datos SQLite
  const db = new sqlite3.Database('./plants.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Conectado a la base de datos de plantas.');
  });
  ```

---

### 2. Modelos

No se utiliza un ORM (como Sequelize o Prisma), por lo que los "Modelos" no están definidos en clases separadas. En su lugar, el modelo de datos está **implícito en el esquema de la base de datos**, definido directamente con sentencias SQL en `backend/server.js`.

* **Implementación:** Las tablas y sus columnas (que definen la estructura de tus datos, como "Plantas") se crean al iniciar el servidor.

* **Código Identificado (`backend/server.js`):**
  ```javascript
  db.serialize(() => {
    // Crear tabla de plantas si no existe
    db.run(`CREATE TABLE IF NOT EXISTS plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      species TEXT,
      location TEXT,
      watering TEXT,
      light TEXT,
      drainage TEXT,
      notes TEXT,
      photoPath TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Crear tabla de recordatorios
    db.run(`CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      plantId INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      frequency INTEGER DEFAULT 7,
      completed BOOLEAN DEFAULT FALSE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plantId) REFERENCES plants (id)
    )`);
  });
  ```

---

### 3. Vistas (Frontend)

En el frontend, las "Vistas" están representadas por **páginas de Next.js** ubicadas en la carpeta `pages/`. Cada archivo `.js` en esta carpeta representa una ruta de la aplicación.

* **Implementación:** Next.js utiliza un sistema de enrutamiento basado en archivos.

* **Código Identificado:**
  ```
  pages/
  ├── index.js          # Página principal (/)
  ├── dashboard.js      # Dashboard principal (/dashboard)
  ├── perfil.js         # Perfil de usuario (/perfil)
  ├── configuracion.js  # Configuración (/configuracion)
  ├── recordatorios.js  # Vista de recordatorios (/recordatorios)
  └── plant/[id].js     # Detalles de planta (/plant/123)
  ```

---

### 4. Plantillas (Componentes)

Las "Plantillas" están representadas por **componentes React** ubicados en la carpeta `components/`. Estos componentes son reutilizables y se pueden usar en múltiples páginas.

* **Implementación:** Cada componente es una función de React que retorna JSX.

* **Código Identificado:**
  ```
  components/
  ├── Layout.js           # Layout principal
  ├── PlantIdentifier.js  # Identificador de plantas
  ├── MyPlants.js         # Galería de plantas
  ├── Recordatorios.js    # Sistema de recordatorios
  ├── PlantEditForm.js    # Formulario de edición
  └── UserPreferences.js  # Preferencias de usuario
  ```

---

### 5. Controladores (API Routes)

Los "Controladores" están implementados como **endpoints de la API** en el backend (`backend/server.js`). Cada endpoint maneja una operación específica.

* **Implementación:** Funciones que manejan las rutas HTTP.

* **Código Identificado (`backend/server.js`):**
  ```javascript
  // Controlador para obtener plantas
  app.get('/plants', authenticateToken, (req, res) => {
    const userId = req.user.uid;
    
    db.all('SELECT * FROM plants WHERE userId = ?', [userId], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });
  
  // Controlador para crear planta
  app.post('/plants', authenticateToken, upload.single('photo'), (req, res) => {
    // Lógica para crear planta
  });
  
  // Controlador para recordatorios
  app.get('/reminders/:plantId', authenticateToken, (req, res) => {
    // Lógica para obtener recordatorios
  });
  ```

---

### 6. Middleware

El proyecto utiliza varios **middlewares** para funcionalidades transversales:

* **Autenticación:** Middleware para verificar tokens de Firebase
* **CORS:** Middleware para permitir solicitudes cross-origin
* **Multer:** Middleware para manejar uploads de archivos

* **Código Identificado:**
  ```javascript
  // Middleware de autenticación
  const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Token inválido' });
    }
  };
  ```

---

### 7. Servicios (Context API)

Los "Servicios" están implementados usando **Context API** de React para gestionar el estado global de la aplicación.

* **Implementación:** Context providers que encapsulan lógica de negocio.

* **Código Identificado (`context/AuthContext.js`):**
  ```javascript
  export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
      
      return unsubscribe;
    }, []);
    
    const login = (email, password) => {
      return signInWithEmailAndPassword(auth, email, password);
    };
    
    const logout = () => {
      return signOut(auth);
    };
    
    const value = {
      user,
      login,
      logout,
      loading
    };
    
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  };
  ```

---

### 8. Hooks Personalizados

El proyecto utiliza **custom hooks** para encapsular lógica reutilizable:

* **Código Identificado (`hooks/useDarkMode.js`):**
  ```javascript
  export const useDarkMode = () => {
    const [darkMode, setDarkMode] = useState(false);
    
    useEffect(() => {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode) {
        setDarkMode(JSON.parse(savedMode));
      }
    }, []);
    
    const toggleDarkMode = () => {
      const newMode = !darkMode;
      setDarkMode(newMode);
      localStorage.setItem('darkMode', JSON.stringify(newMode));
    };
    
    return [darkMode, toggleDarkMode];
  };
  ```

---

### 9. Utilidades

Las **utilidades** están ubicadas en la carpeta `lib/` y contienen funciones auxiliares:

* **Código Identificado (`lib/utils.js`):**
  ```javascript
  // Utility para combinar clases CSS
  export function cn(...args) {
    return args.filter(Boolean).join(" ");
  }
  
  // Utility para formatear fechas
  export const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  ```

---

### 10. Configuración

La configuración está centralizada en varios archivos:

* **Firebase (`lib/firebase.js`):** Configuración de Firebase
* **Backend (`backend/config.js`):** Configuración del servidor
* **Next.js (`next.config.js`):** Configuración de Next.js

---

## 🏗️ Patrón de Arquitectura

El proyecto sigue el patrón **MVC (Model-View-Controller)** adaptado para aplicaciones web modernas:

* **Model:** Esquema de base de datos SQLite
* **View:** Páginas y componentes React
* **Controller:** Endpoints de la API Express

Adicionalmente, utiliza patrones modernos como:

* **JAMstack:** JavaScript, APIs, Markup
* **SPA:** Single Page Application
* **REST API:** Arquitectura REST para la comunicación
* **Component-Based:** Arquitectura basada en componentes

---

**Esta arquitectura proporciona una base sólida, escalable y mantenible para PlantCare** 🌱🏗️
