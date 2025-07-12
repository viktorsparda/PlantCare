# 🌱 PlantCare - Contribución

¡Gracias por tu interés en contribuir a PlantCare! Este documento te guiará a través del proceso de contribución.

## 📋 Cómo Contribuir

### 1. Fork y Clone
```bash
# Fork el repositorio en GitHub
# Luego clona tu fork
git clone https://github.com/tu-usuario/plantcare-web.git
cd plantcare-web
```

### 2. Configurar el Entorno
```bash
# Instalar dependencias
npm install
cd backend && npm install && cd ..

# Configurar variables de entorno
cp .env.example .env.local
cp backend/.env.example backend/.env
```

### 3. Crear una Rama
```bash
# Crear rama para tu feature
git checkout -b feature/nombre-de-tu-feature

# O para bug fix
git checkout -b fix/nombre-del-bug
```

### 4. Hacer Cambios
- Escribe código limpio y bien documentado
- Sigue las convenciones de estilo del proyecto
- Añade tests para nuevas funcionalidades
- Asegúrate de que todos los tests pasen

### 5. Commit y Push
```bash
# Añadir cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: añadir funcionalidad de recordatorios personalizados"

# Push a tu fork
git push origin feature/nombre-de-tu-feature
```

### 6. Crear Pull Request
- Ve a GitHub y crea un Pull Request
- Describe claramente qué cambios hiciste
- Referencia issues relacionados
- Espera review y feedback

## 🎯 Tipos de Contribución

### 🐛 Bug Fixes
- Reportar bugs con detalles
- Proporcionar pasos para reproducir
- Incluir capturas de pantalla si es necesario

### ✨ New Features
- Discutir la feature en un issue primero
- Asegurar que la feature es necesaria
- Incluir tests y documentación

### 📚 Documentation
- Mejorar README, guías, comentarios
- Corregir errores tipográficos
- Traducir documentación

### 🎨 Design/UI
- Mejorar diseño y experiencia de usuario
- Optimizar para dispositivos móviles
- Mejorar accesibilidad

## 📝 Convenciones de Código

### JavaScript/React
```javascript
// Usar camelCase para variables y funciones
const plantName = 'Rosa';
const handleSubmit = () => {};

// Usar PascalCase para componentes
const PlantCard = () => {};

// Usar constantes en UPPERCASE
const API_URL = 'http://localhost:3001';

// Comentarios descriptivos
/**
 * Calcula los días hasta la próxima fecha de riego
 * @param {string} nextDate - Fecha en formato YYYY-MM-DD
 * @returns {number} Días hasta la fecha
 */
const getDaysUntil = (nextDate) => {
  // Implementación
};
```

### CSS/Tailwind
```javascript
// Usar clases consistentes
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
    Título
  </h2>
</div>
```

### Git Commits
```bash
# Usar conventional commits
feat: añadir nueva funcionalidad
fix: corregir bug en recordatorios
docs: actualizar README
style: mejorar formateo de código
refactor: reorganizar componentes
test: añadir tests para plantas
chore: actualizar dependencias
```

## 🧪 Testing

### Ejecutar Tests
```bash
# Todos los tests
npm test

# Tests específicos
npm test -- --testNamePattern="PlantCard"

# Coverage
npm run test:coverage
```

### Escribir Tests
```javascript
// components/__tests__/PlantCard.test.js
import { render, screen } from '@testing-library/react';
import PlantCard from '../PlantCard';

describe('PlantCard', () => {
  const mockPlant = {
    id: 1,
    name: 'Rosa',
    description: 'Una rosa hermosa'
  };

  it('renders plant name', () => {
    render(<PlantCard plant={mockPlant} />);
    expect(screen.getByText('Rosa')).toBeInTheDocument();
  });
});
```

## 📊 Code Review

### Qué Buscar
- [ ] Código limpio y legible
- [ ] Tests incluidos
- [ ] Documentación actualizada
- [ ] No hay console.logs olvidados
- [ ] Manejo de errores apropiado
- [ ] Responsive design
- [ ] Accesibilidad

### Dar Feedback
- Ser constructivo y específico
- Explicar el "por qué" de los cambios sugeridos
- Reconocer el buen trabajo
- Ofrecer ayuda si es necesario

## 🎨 Diseño y UX

### Principios
- **Simplicidad**: Interfaz limpia y fácil de usar
- **Consistencia**: Patrones uniformes en toda la app
- **Accesibilidad**: Usable por todos los usuarios
- **Responsive**: Funciona en todos los dispositivos

### Colores
```css
/* Paleta principal */
--green-50: #f0fdf4;
--green-500: #22c55e;
--green-700: #15803d;

/* Modo oscuro */
--gray-800: #1f2937;
--gray-900: #111827;
```

### Tipografía
```css
/* Headings */
h1, h2, h3 { font-weight: 700; }

/* Body text */
body { font-family: 'Inter', sans-serif; }

/* Code */
code { font-family: 'Fira Code', monospace; }
```

## 🔧 Configuración de Desarrollo

### VSCode Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

### Prettier Config
```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### ESLint Config
```javascript
module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error'
  }
};
```

## 🚀 Release Process

### Versioning
- Seguir [Semantic Versioning](https://semver.org/)
- `MAJOR.MINOR.PATCH` (e.g., 1.2.3)

### Changelog
- Actualizar CHANGELOG.md
- Categorizar cambios: Added, Changed, Deprecated, Removed, Fixed, Security

### Tagging
```bash
# Crear tag
git tag -a v1.2.3 -m "Release version 1.2.3"

# Push tag
git push origin v1.2.3
```

## 🤝 Comunidad

### Código de Conducta
- Ser respetuoso y profesional
- Aceptar críticas constructivas
- Ayudar a otros contribuidores
- Mantener un ambiente positivo

### Comunicación
- Issues para reportar bugs o solicitar features
- Discussions para preguntas generales
- Pull Requests para contribuciones de código

### Reconocimientos
Todos los contribuidores serán reconocidos en:
- README.md
- CHANGELOG.md
- About page de la aplicación

## 📚 Recursos Útiles

### Documentación
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://reactjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)

### Herramientas
- [Figma](https://figma.com) - Diseño
- [Postman](https://postman.com) - Testing API
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools) - Debugging

---

¡Gracias por contribuir a PlantCare! 🌱💚

**Juntos podemos crear la mejor app para el cuidado de plantas** 🌿✨
