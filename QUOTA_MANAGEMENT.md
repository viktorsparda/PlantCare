# Gestión de Cuota de API - PlantCare

## Problema Resuelto
El error `429 Too Many Requests` indica que se ha excedido el límite de cuota gratuita de Google Gemini (50 solicitudes por día).

## Soluciones Implementadas

### 1. **Cache de Respuestas**
- Las respuestas de la API se almacenan en memoria para evitar solicitudes repetidas
- El cache se limpia automáticamente cada 24 horas
- Reduce significativamente el número de llamadas a la API

### 2. **Base de Datos Local de Plantas**
Se ha creado una base de datos local con información detallada sobre plantas comunes:
- **Rosa** (Rosa spp.)
- **Pothos** (Epipremnum aureum)
- **Cactus** (Cactaceae)
- **Ficus** (Ficus benjamina)

### 3. **Datos de Respaldo Genéricos**
Cuando se excede la cuota, el sistema proporciona:
- Consejos generales de cuidado de plantas
- Recomendaciones personalizadas basadas en los datos del usuario
- Información útil aunque no sea específica de la especie

### 4. **Mejor Experiencia de Usuario**
- Mensajes informativos cuando se usan datos genéricos
- Interfaz mejorada con tarjetas visuales y funcionalidad "Ver más/Ver menos"
- Iconos y colores para categorizar la información

## Cómo Funciona la Priorización

1. **Primero**: Buscar en cache
2. **Segundo**: Buscar en base de datos local
3. **Tercero**: Intentar API de Gemini
4. **Cuarto**: Usar datos genéricos si falla la API

## Agregando Nuevas Plantas a la Base de Datos

Para agregar una nueva planta a la base de datos local, edita el objeto `plantDatabase` en `backend/server.js`:

```javascript
"nombre_planta": {
  common_name: "Nombre Común",
  scientific_name: ["Nombre Científico"],
  family: "Familia",
  genus: "Género",
  cycle: "Ciclo de vida",
  growth: {
    watering: "Descripción de riego",
    sunlight: ["Necesidades de luz"]
  },
  care_tips: ["Consejo 1", "Consejo 2"],
  common_problems: ["Problema 1", "Problema 2"],
  personalized_recommendations: ["Recomendación 1"]
}
```

## Monitoreo de Cuota

Para monitorear el uso de la cuota:
1. Revisa los logs del servidor para ver qué fuente de datos se está utilizando
2. Las respuestas indican la fuente: "Gemini", "Base de datos local", o "Datos genéricos"

## Alternativas para Aumentar la Cuota

1. **Upgrade a Plan Pagado**: Considera actualizar a un plan pagado de Google Gemini
2. **Múltiples APIs**: Implementar rotación entre diferentes APIs (OpenAI, Anthropic, etc.)
3. **Datos Estáticos**: Expandir la base de datos local con más especies

## Beneficios del Sistema Actual

- ✅ **Resistente a fallos**: La app funciona incluso sin API externa
- ✅ **Rápido**: Cache y datos locales son más rápidos que llamadas API
- ✅ **Económico**: Reduce costos de API
- ✅ **Escalable**: Fácil agregar más plantas a la base de datos local
- ✅ **Personalizado**: Combina datos generales con información específica del usuario
