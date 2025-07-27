#!/usr/bin/env node
/**
 * Script de debug para probar la API IoT externa
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testIoTAPI() {
  console.log('🔬 Testing IoT API External Connectivity...\n');
  
  // Test 1: Conectividad básica a la API
  console.log('📡 Test 1: Conectividad básica');
  try {
    const response = await fetch('https://api.drcvault.dev', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PlantCare-Debug/1.0'
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Headers:`, Object.fromEntries(response.headers));
    
    if (response.ok) {
      const text = await response.text();
      console.log(`Response:`, text);
    }
  } catch (error) {
    console.error(`❌ Error conectando a API base:`, error.message);
  }
  
  console.log('\n-------------------\n');
  
  // Test 2: Endpoints correctos de dispositivos
  console.log('📡 Test 2: Endpoints correctos de logs');
  const testUDIDs = [
    'ESP-e4eda220691c',  // UDID de ejemplo del compañero
    'test-device',       // UDID de prueba
    'ESP32-123'          // Otro formato común
  ];
  
  for (const udid of testUDIDs) {
    console.log(`\n🔍 Probando UDID: ${udid}`);
    
    // Probar endpoint de logs más recientes
    try {
      const url = `https://api.drcvault.dev/api/logs/device/${udid}?latest=true`;
      console.log(`URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PlantCare-Debug/1.0'
        }
      });
      
      console.log(`Status: ${response.status}`);
      console.log(`Status Text: ${response.statusText}`);
      
      const text = await response.text();
      console.log(`Response:`, text);
      
      if (response.ok) {
        try {
          const json = JSON.parse(text);
          console.log(`Parsed JSON:`, json);
          
          if (Array.isArray(json) && json.length > 0) {
            console.log(`📊 Datos del sensor:`);
            console.log(`   Temperatura: ${json[0].temp}°C`);
            console.log(`   Humedad aire: ${json[0].moisture_air}%`);
            console.log(`   Humedad suelo: ${json[0].moisture_dirt}%`);
            console.log(`   Timestamp: ${json[0].timestamp}`);
          }
        } catch (parseError) {
          console.log(`⚠️ No es JSON válido`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error consultando ${udid}:`, error.message);
    }
  }
  
  console.log('\n-------------------\n');
  
  // Test adicional: Listar todos los dispositivos
  console.log('📡 Test 2.5: Lista de dispositivos debug');
  try {
    const url = `https://api.drcvault.dev/api/devices/debug-list`;
    console.log(`URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PlantCare-Debug/1.0'
      }
    });
    
    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response:`, text);
    
    if (response.ok) {
      try {
        const json = JSON.parse(text);
        console.log(`📋 Dispositivos disponibles:`, json);
      } catch (parseError) {
        console.log(`⚠️ No es JSON válido`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Error obteniendo lista de dispositivos:`, error.message);
  }
  
  console.log('\n-------------------\n');
  
  // Test 3: Headers y CORS
  console.log('📡 Test 3: Headers y CORS');
  try {
    const response = await fetch('https://api.drcvault.dev/api/iot/devices/test', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log(`CORS Status: ${response.status}`);
    console.log(`CORS Headers:`, Object.fromEntries(response.headers));
    
  } catch (error) {
    console.error(`❌ Error en test CORS:`, error.message);
  }
  
  console.log('\n📋 Resumen de pruebas completado');
}

// Ejecutar tests
testIoTAPI().catch(console.error);
