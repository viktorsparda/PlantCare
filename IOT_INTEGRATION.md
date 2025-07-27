# 🌐 Integración IoT - PlantCare

## 📋 Descripción

La integración IoT permite conectar dispositivos ESP32 con sensores para monitorear las condiciones de las plantas en tiempo real. Los dispositivos recopilan datos de temperatura, humedad ambiental y humedad del suelo, enviándolos a través de una API REST desarrollada por el equipo.

## 🔧 Configuración del Dispositivo

### 1. Hardware Requerido
- ESP32 DevKit
- Sensor de humedad del suelo
- Sensor DHT22 (temperatura y humedad ambiental)
- LEDs indicadores (opcional)
- Resistencias y cables de conexión

### 2. Configuración Inicial del ESP32
1. **Conectar el dispositivo ESP32** a la alimentación
2. **Acceder al WiFiManager** - El dispositivo crea un punto de acceso WiFi llamado "PlantCareAP"
3. **Configurar la red** - Conectarse al AP y configurar las credenciales WiFi
4. **Obtener el UDID** - El dispositivo mostrará su identificador único (formato: ESP-xxxxxxxx)

### 3. Asociar Email con Dispositivo
Una vez configurado el WiFi, asocia tu email al dispositivo ejecutando:

```bash
curl -X POST https://api.drcvault.dev/api/iot/share \
  -H "Content-Type: application/json" \
  -d '{"udid": "ESP-e4eda220691c", "email": "tu-email@correo.com"}'
```

**Importante**: Cambia `ESP-e4eda220691c` por el UDID real de tu dispositivo y `tu-email@correo.com` por tu email registrado en PlantCare.

## 🚀 Uso en la Aplicación

### 1. Asociar Dispositivo en PlantCare
1. Ve a la sección **IoT** en el menú principal
2. Haz clic en **"Agregar Dispositivo"**
3. Introduce el UDID del dispositivo
4. Asigna un nombre descriptivo (opcional)
5. Asocia con una planta específica (opcional)
6. Confirma la configuración

### 2. Visualizar Datos de Sensores
- **En la página de detalles de planta**: Los datos IoT aparecen automáticamente si hay dispositivos asociados
- **En la página IoT**: Vista general de todos los dispositivos y su estado
- **Actualización automática**: Los datos se refrescan cada 30 segundos

### 3. Tipos de Datos Monitoreados
- 🌡️ **Temperatura**: Medición en grados Celsius
- 💧 **Humedad Ambiental**: Porcentaje de humedad del aire
- 🌱 **Humedad del Suelo**: Porcentaje de humedad en la tierra

## 🔗 API Externa

Los dispositivos IoT se conectan a la API externa desarrollada por el equipo:
- **Base URL**: `https://api.drcvault.dev`
- **Endpoints utilizados**:
  - `POST /api/iot/share` - Asociar email con dispositivo
  - `GET /api/iot/devices/{udid}` - Obtener datos del dispositivo

## 🛠️ Funcionalidades Implementadas

### Backend
- ✅ Tabla `iot_devices` para gestionar dispositivos
- ✅ Endpoints para asociar/desasociar dispositivos
- ✅ Integración con API externa para obtener datos
- ✅ Validación de permisos de usuario
- ✅ Manejo de errores y estados de conexión

### Frontend
- ✅ Componente `IoTSensors` para mostrar datos en tiempo real
- ✅ Página `/iot` para gestión de dispositivos
- ✅ Integración en página de detalles de planta
- ✅ Indicadores visuales de estado de conexión
- ✅ Actualización automática de datos

### Características
- 🔄 **Actualización automática** cada 30 segundos
- 🟢 **Indicadores de estado** (online/warning/offline)
- 📱 **Diseño responsivo** para móviles y escritorio
- 🌙 **Modo oscuro** compatible
- ⚡ **Manejo de errores** robusto

## 🎯 Estados de Conexión

- **🟢 Online**: Última actualización hace menos de 5 minutos
- **🟡 Warning**: Última actualización entre 5-30 minutos
- **🔴 Offline**: Sin datos por más de 30 minutos

## 🚨 Resolución de Problemas

### Dispositivo no aparece
1. Verificar que el UDID sea correcto
2. Confirmar que el email está asociado correctamente
3. Revisar la conexión WiFi del dispositivo

### Sin datos de sensores
1. Verificar alimentación del dispositivo
2. Comprobar conexión de sensores
3. Reiniciar el dispositivo ESP32

### Error de conexión
1. Verificar conectividad a internet
2. Comprobar que la API externa esté disponible
3. Revisar logs del backend

## 🔧 Comandos Útiles

```bash
# Verificar estado de dispositivo
curl https://api.drcvault.dev/api/iot/devices/ESP-xxxxxxxx

# Listar dispositivos asociados (requiere autenticación)
curl -H "Authorization: Bearer TOKEN" http://localhost:4000/api/iot/devices

# Asociar dispositivo con planta
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" \
  -d '{"udid":"ESP-xxxxxxxx","plantId":1,"deviceName":"Sensor Jardín"}' \
  http://localhost:4000/api/iot/associate
```

---

## 📞 Soporte

Para problemas relacionados con:
- **Hardware/Firmware**: Contactar al desarrollador del sistema IoT
- **Integración/Software**: Revisar logs del backend o crear issue en el repositorio
- **API Externa**: Verificar disponibilidad en `https://api.drcvault.dev`
