# Análisis de la Arquitectura y Framework

Este documento describe los aspectos clave del framework implementados en el proyecto, identificando el uso de la base de datos, modelos, vistas y plantillas.

### Resumen de la Arquitectura

El proyecto utiliza una arquitectura de dos partes:

1.  **Backend:** Un servidor Node.js con Express, que funciona como una API REST. Se encarga de la lógica de negocio y la comunicación con la base de datos.
2.  **Frontend:** Una aplicación Next.js (un framework de React), que consume los datos de la API del backend y los presenta al usuario.

---

### 1. Base de Datos

El backend utiliza **SQLite**, una base de datos ligera basada en archivos.

*   **Implementación:** La conexión a la base de datos se establece en `backend/server.js`. El archivo físico de la base de datos es `backend/plants.db`.

*   **Código Identificado (`backend/server.js`):**
    ```javascript
    const sqlite3 = require('sqlite3').verbose();
    // ...
    
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

*   **Implementación:** Las tablas y sus columnas (que definen la estructura de tus datos, como "Plantas") se crean al iniciar el servidor.

*   **Código Identificado (`backend/server.js`):**
    ```javascript
    db.serialize(() => {
      // Crear tabla de plantas si no existe
      db.run(`CREATE TABLE IF NOT EXISTS plants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        species TEXT,
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