import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaThermometerHalf, FaTint, FaSeedling, FaWifi, FaExclamationTriangle } from 'react-icons/fa';
import { MdSensors } from 'react-icons/md';
import { toast } from 'react-hot-toast';

export default function IoTSensors({ plantId }) {
  const [sensorsData, setSensorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !plantId) return;
    
    loadSensorsData();
    
    // Actualizar datos cada 30 segundos
    const interval = setInterval(loadSensorsData, 30000);
    return () => clearInterval(interval);
  }, [user, plantId]);

  const loadSensorsData = async () => {
    try {
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      const response = await fetch(`${apiUrl}/api/iot/plants/${plantId}/sensors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSensorsData(data);
        setError(null);
      } else {
        setError('Error al cargar datos de sensores');
      }
    } catch (err) {
      console.error('Error loading sensors:', err);
      setError('Error de conexión con sensores IoT');
    } finally {
      setLoading(false);
    }
  };

  const getSensorIcon = (type) => {
    switch (type) {
      case 'temperature': return <FaThermometerHalf className="text-red-500" />;
      case 'humidity': return <FaTint className="text-blue-500" />;
      case 'soil_moisture': return <FaSeedling className="text-green-500" />;
      default: return <MdSensors className="text-gray-500" />;
    }
  };

  const getSensorValue = (sensorData, type) => {
    if (!sensorData || !sensorData.sensors) return 'N/A';
    
    const sensor = sensorData.sensors.find(s => s.type === type);
    return sensor ? `${sensor.value}${sensor.unit || ''}` : 'N/A';
  };

  const getConnectionStatus = (device) => {
    const lastUpdate = new Date(device.lastUpdate);
    const now = new Date();
    const diffMinutes = (now - lastUpdate) / (1000 * 60);
    
    if (diffMinutes < 5) return { status: 'online', color: 'text-green-500' };
    if (diffMinutes < 30) return { status: 'warning', color: 'text-yellow-500' };
    return { status: 'offline', color: 'text-red-500' };
  };

  if (loading) {
    return (
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg p-5">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando sensores IoT...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg p-5">
        <div className="flex items-center text-red-600 dark:text-red-400">
          <FaExclamationTriangle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (sensorsData.length === 0) {
    return (
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg p-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
          <MdSensors className="w-5 h-5 mr-2 text-green-600" />
          Sensores IoT
        </h3>
        <div className="text-center py-6">
          <MdSensors className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            No hay dispositivos IoT asociados a esta planta
          </p>
          <button 
            onClick={() => window.location.href = '/iot'}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Asociar Dispositivo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg p-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
        <MdSensors className="w-5 h-5 mr-2 text-green-600" />
        Sensores IoT ({sensorsData.length})
      </h3>
      
      <div className="space-y-4">
        {sensorsData.map((deviceData, index) => {
          const connectionStatus = getConnectionStatus(deviceData);
          
          return (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              {/* Header del dispositivo */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <FaWifi className={`w-4 h-4 mr-2 ${connectionStatus.color}`} />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {deviceData.device.deviceName}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${connectionStatus.color} bg-gray-100 dark:bg-gray-700`}>
                  {connectionStatus.status}
                </span>
              </div>

              {/* Datos de sensores */}
              {deviceData.sensorData ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Temperatura */}
                  <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <FaThermometerHalf className="w-5 h-5 text-red-500 mr-2" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Temperatura</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {deviceData.sensorData.temperature ? `${deviceData.sensorData.temperature}°C` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Humedad */}
                  <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <FaTint className="w-5 h-5 text-blue-500 mr-2" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Humedad</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {deviceData.sensorData.humidity ? `${deviceData.sensorData.humidity}%` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Humedad del suelo */}
                  <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <FaSeedling className="w-5 h-5 text-green-500 mr-2" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Humedad Suelo</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {deviceData.sensorData.soil_moisture ? `${deviceData.sensorData.soil_moisture}%` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  {deviceData.error || 'Datos no disponibles'}
                </div>
              )}

              {/* Última actualización */}
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Última actualización: {new Date(deviceData.lastUpdate).toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón para refrescar */}
      <div className="mt-4 text-center">
        <button
          onClick={loadSensorsData}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Actualizar Sensores
        </button>
      </div>
    </div>
  );
}
