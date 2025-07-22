# 🔧 Environment Variables Guide

⚠️ **IMPORTANTE**: Este archivo es solo para documentación. Nunca incluyas claves reales en archivos que se suban a GitHub.

## 📋 Resumen de Variables de Entorno

### ✅ Estado Actual: LISTO PARA DESPLIEGUE

Todas las variables de entorno están correctamente configuradas con fallbacks seguros.

## 🎨 Frontend (.env.local)

**Variables configuradas:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000                    # ✅ Puerto corregido
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key           # ✅ Configurado
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com  # ✅ Configurado
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id              # ✅ Configurado
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app  # ✅ Configurado
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id      # ✅ Configurado
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id                      # ✅ Configurado
NEXT_PUBLIC_PLANTNET_API_KEY=your-plantnet-api-key           # ✅ Configurado
```

## 🔧 Backend (backend/.env)

**Variables configuradas:**
```bash
GEMINI_API_KEY=your-gemini-api-key                           # ✅ Configurado
PORT=4000                                                     # ✅ Puerto consistente
API_URL=http://localhost:4000                                 # ✅ Nueva variable agregada
NODE_ENV=development                                          # ✅ Nueva variable agregada
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}      # ✅ JSON completo (usar archivo real)
```

## 🚀 Para Producción

### Vercel (Frontend)
```bash
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_PLANTNET_API_KEY=your-plantnet-api-key
```

### Railway (Backend)
```bash
PORT=4000
NODE_ENV=production
API_URL=https://your-backend.up.railway.app
GEMINI_API_KEY=your-gemini-api-key
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id",...}
```

## ✅ Correcciones Realizadas

1. **Puerto consistente**: Cambiado de 3001 a 4000 en todos los archivos
2. **Variable API_URL**: Agregada al backend para URLs de fotos
3. **Variable NODE_ENV**: Agregada para detección de producción
4. **Fallbacks actualizados**: Todos usan localhost:4000
5. **Documentación actualizada**: .env.example files actualizados

## 🛡️ Fallbacks de Seguridad

Todos los componentes tienen fallbacks seguros:
- `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'`
- `process.env.PORT || 4000`
- `process.env.API_URL || 'http://localhost:4000'`
- `process.env.NODE_ENV || 'development'`

## 🧪 Test de Variables

Para verificar que todo funciona:

```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend  
npm run dev

# Verificar:
# - Backend en http://localhost:4000
# - Frontend en http://localhost:3000
# - API calls funcionando correctamente
```

## 🚨 Problemas Conocidos Solucionados

- ❌ ~~Puerto inconsistente (3001 vs 4000)~~ → ✅ Solucionado
- ❌ ~~Falta variable API_URL en backend~~ → ✅ Agregada
- ❌ ~~Fallbacks incorrectos~~ → ✅ Actualizados
- ❌ ~~Documentación desactualizada~~ → ✅ Actualizada

## 🎯 Estado Final: READY FOR DEPLOYMENT ✅
