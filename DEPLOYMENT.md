# 🔧 PlantCare - Deployment Guide

## 🚀 Opciones de Despliegue

### 1. Vercel (Recomendado para Frontend)

#### Preparación
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login
```

#### Despliegue
```bash
# Desde la carpeta raíz
vercel --prod
```

#### Configuración en Vercel
```json
{
  "name": "plantcare-web",
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXT_PUBLIC_FIREBASE_API_KEY": "@firebase-api-key",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "@firebase-auth-domain",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID": "@firebase-project-id"
  }
}
```

### 2. Railway (Recomendado para Backend)

#### Preparación
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login
```

#### Despliegue del Backend
```bash
cd backend
railway deploy
```

#### Configuración en Railway
- **Variables de entorno**: GEMINI_API_KEY, FIREBASE_PROJECT_ID, etc.
- **Puerto**: Railway asigna automáticamente
- **Dominio**: railway.app subdomain

### 3. Netlify (Alternativa para Frontend)

#### Preparación
```bash
# Build para producción
npm run build
npm run export
```

#### Despliegue
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=out
```

### 4. Heroku (Alternativa para Backend)

#### Preparación
```bash
# Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login
```

#### Despliegue
```bash
# Crear app
heroku create plantcare-backend

# Configurar variables
heroku config:set GEMINI_API_KEY=your-key

# Deploy
git push heroku main
```

### 5. Docker (Para ambos)

#### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

#### Dockerfile (Backend)
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001
CMD ["node", "server.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    volumes:
      - ./backend/plants.db:/app/plants.db
```

### 6. AWS (Producción Avanzada)

#### Frontend (S3 + CloudFront)
```bash
# Build y export
npm run build
aws s3 sync out/ s3://plantcare-frontend --delete
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
```

#### Backend (EC2 + RDS)
```bash
# Setup PM2 para gestión de procesos
npm install -g pm2

# Configurar PM2
pm2 start server.js --name plantcare-backend
pm2 startup
pm2 save
```

## 🌍 Variables de Entorno por Ambiente

### Development
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Staging
```env
NEXT_PUBLIC_API_URL=https://plantcare-backend-staging.railway.app
```

### Production
```env
NEXT_PUBLIC_API_URL=https://plantcare-backend.railway.app
```

## 🔒 Configuración de Seguridad

### CORS (Backend)
```javascript
// server.js
const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://plantcare-web.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
};

app.use(cors(corsOptions));
```

### CSP Headers (Frontend)
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
          }
        ]
      }
    ];
  }
};
```

## 📊 Monitoreo y Análisis

### Analytics
```javascript
// pages/_app.js
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### Error Tracking
```javascript
// lib/errorTracking.js
export const trackError = (error, context) => {
  if (process.env.NODE_ENV === 'production') {
    // Enviar a servicio de error tracking
    console.error('Error:', error, context);
  }
};
```

## 🚀 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm ci
      - name: Deploy to Railway
        run: railway deploy
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 📝 Checklist de Despliegue

### Pre-Despliegue
- [ ] Tests pasando
- [ ] Build exitoso
- [ ] Variables de entorno configuradas
- [ ] Base de datos migrada
- [ ] Certificados SSL configurados

### Post-Despliegue
- [ ] Verificar URLs funcionando
- [ ] Testear flujo completo
- [ ] Verificar analytics
- [ ] Verificar logs
- [ ] Documentar cambios

## 🐛 Solución de Problemas

### Build Errors
```bash
# Limpiar caché
npm run clean
rm -rf .next
rm -rf node_modules
npm install

# Verificar dependencias
npm audit
```

### Environment Issues
```bash
# Verificar variables
echo $NEXT_PUBLIC_API_URL

# Verificar conexión
curl -I https://your-api-url/health
```

---

**El despliegue exitoso requiere preparación y monitoreo** 🚀📊
