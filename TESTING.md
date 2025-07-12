# 📊 PlantCare - Tests

## 🧪 Configuración de Testing

Este proyecto utiliza Jest y React Testing Library para testing automatizado.

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage
```

### Estructura de Tests

```
__tests__/
├── components/
│   ├── Layout.test.js
│   ├── MyPlants.test.js
│   └── PlantIdentifier.test.js
├── pages/
│   ├── dashboard.test.js
│   └── index.test.js
├── utils/
│   └── dateUtils.test.js
└── setup.js
```

### Escribir Tests

#### Ejemplo de Test de Componente
```javascript
// __tests__/components/MyPlants.test.js
import { render, screen } from '@testing-library/react';
import MyPlants from '../../components/MyPlants';
import { AuthProvider } from '../../context/AuthContext';

const MockAuthProvider = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('MyPlants', () => {
  it('renders plants list', () => {
    render(
      <MockAuthProvider>
        <MyPlants />
      </MockAuthProvider>
    );
    
    expect(screen.getByText('Mis Plantas')).toBeInTheDocument();
  });
});
```

#### Ejemplo de Test de Utility
```javascript
// __tests__/utils/dateUtils.test.js
import { formatDate, isOverdue } from '../../utils/dateUtils';

describe('dateUtils', () => {
  it('formats date correctly', () => {
    const date = '2025-01-15';
    const formatted = formatDate(date);
    expect(formatted).toContain('15');
  });

  it('detects overdue dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isOverdue(yesterday.toISOString())).toBe(true);
  });
});
```

### Configuración

#### jest.config.js
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

#### jest.setup.js
```javascript
import '@testing-library/jest-dom';
```

### Comandos de Testing

```bash
# Ejecutar tests específicos
npm test -- --testPathPattern=MyPlants

# Ejecutar tests con verbose output
npm test -- --verbose

# Ejecutar tests y generar coverage
npm test -- --coverage --watchAll=false
```

### Mock de Firebase

```javascript
// __tests__/mocks/firebase.js
export const auth = {
  currentUser: null,
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
};

export const firestore = {
  collection: jest.fn(() => ({
    add: jest.fn(),
    get: jest.fn(),
  })),
};
```

### Testing Best Practices

1. **Nombrar tests descriptivamente**
2. **Usar Act-Assert-Arrange pattern**
3. **Mockear dependencias externas**
4. **Testear behavior, no implementation**
5. **Mantener tests simples y enfocados**

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Continuous Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage --watchAll=false
```

---

**Testing ayuda a mantener la calidad del código** 🧪✅
