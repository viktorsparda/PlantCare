import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { MdSensors, MdAdd, MdDelete, MdRefresh } from 'react-icons/md';
import { FaWifi, FaCog, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function IoTPage() {
  const [devices, setDevices] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDevice, setNewDevice] = useState({
    udid: '',
    deviceName: '',
    plantId: ''
  });
  const { user } = useAuth();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      // Cargar plantas
      const plantsResponse = await fetch(`${apiUrl}/plants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (plantsResponse.ok) {
        const plantsData = await plantsResponse.json();
        setPlants(plantsData);
      }

      // Cargar dispositivos IoT
      const devicesResponse = await fetch(`${apiUrl}/api/iot/devices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (devicesResponse.ok) {
        const devicesData = await devicesResponse.json();
        setDevices(devicesData);
      }

    } catch (error) {
      console.error('Error loading IoT data:', error);
      toast.error('Error al cargar datos IoT');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const handleAddDevice = async (e) => {
    e.preventDefault();
    
    if (!newDevice.udid) {
      toast.error('UDID del dispositivo es requerido');
      return;
    }

    try {
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      const response = await fetch(`${apiUrl}/api/iot/associate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDevice)
      });

      if (response.ok) {
        toast.success('Dispositivo asociado exitosamente');
        setShowAddModal(false);
        setNewDevice({ udid: '', deviceName: '', plantId: '' });
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al asociar dispositivo');
      }
    } catch (error) {
      console.error('Error associating device:', error);
      toast.error('Error de conexión');
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este dispositivo?')) {
      return;
    }

    try {
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      const response = await fetch(`${apiUrl}/api/iot/devices/${deviceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Dispositivo eliminado');
        loadData();
      } else {
        toast.error('Error al eliminar dispositivo');
      }
    } catch (error) {
      console.error('Error deleting device:', error);
      toast.error('Error de conexión');
    }
  };

  const shareDeviceWithEmail = async () => {
    const udid = prompt('Ingrese el UDID del dispositivo:');
    if (!udid) return;

    try {
      const response = await fetch('https://api.drcvault.dev/api/iot/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          udid: udid,
          email: user.email
        })
      });

      if (response.ok) {
        toast.success('Dispositivo asociado con tu email en la API externa');
      } else {
        toast.error('Error al asociar dispositivo externamente');
      }
    } catch (error) {
      console.error('Error sharing device:', error);
      toast.error('Error de conexión con API externa');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center">
              <MdSensors className="w-8 h-8 mr-3 text-green-600" />
              Dispositivos IoT
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona tus sensores y dispositivos conectados
            </p>
          </div>

          {/* Instrucciones de configuración */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
              <FaCog className="w-5 h-5 mr-2" />
              Configuración Inicial
            </h3>
            <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <p>1. Conecta tu dispositivo ESP32 y configura la red WiFi</p>
              <p>2. Obtén el UDID del dispositivo desde el WiFiManager</p>
              <p>3. Ejecuta el comando para asociar tu email:</p>
              <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded mt-2 text-xs font-mono">
                <div>curl -X POST https://api.drcvault.dev/api/iot/share \</div>
                <div>&nbsp;&nbsp;-H &quot;Content-Type: application/json&quot; \</div>
                <div>&nbsp;&nbsp;-d &apos;{JSON.stringify({udid: "ESP-xxxxxxxx", email: user?.email || "tu-email@correo.com"})}&apos;</div>
              </div>
              <p>4. Asocia el dispositivo con una planta usando el botón &quot;Agregar Dispositivo&quot;</p>
              <button
                onClick={shareDeviceWithEmail}
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Asociar Email Automáticamente
              </button>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <MdAdd className="w-5 h-5 mr-2" />
              Agregar Dispositivo
            </button>
            <button
              onClick={loadData}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <MdRefresh className="w-5 h-5 mr-2" />
              Actualizar
            </button>
          </div>

          {/* Lista de dispositivos */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : devices.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {devices.map((device) => (
                <div key={device.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {device.deviceName}
                    </h3>
                    <FaWifi className="w-5 h-5 text-green-500" />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">UDID:</span> {device.udid}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Planta:</span> {
                        device.plantName || device.plantCommonName || 'Sin asignar'
                      }
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Asociado:</span> {
                        new Date(device.associatedAt).toLocaleDateString()
                      }
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={() => handleDeleteDevice(device.id)}
                      className="text-red-500 hover:text-red-700 p-2 transition-colors"
                    >
                      <MdDelete className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MdSensors className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No hay dispositivos IoT
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-4">
                Agrega tu primer dispositivo para comenzar a monitorear tus plantas
              </p>
            </div>
          )}

          {/* Modal para agregar dispositivo */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Agregar Dispositivo IoT
                </h3>
                
                <form onSubmit={handleAddDevice} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      UDID del Dispositivo *
                    </label>
                    <input
                      type="text"
                      value={newDevice.udid}
                      onChange={(e) => setNewDevice({...newDevice, udid: e.target.value})}
                      placeholder="ESP-e4eda220691c"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre del Dispositivo
                    </label>
                    <input
                      type="text"
                      value={newDevice.deviceName}
                      onChange={(e) => setNewDevice({...newDevice, deviceName: e.target.value})}
                      placeholder="Sensor Jardín"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Asociar con Planta
                    </label>
                    <select
                      value={newDevice.plantId}
                      onChange={(e) => setNewDevice({...newDevice, plantId: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Seleccionar planta (opcional)</option>
                      {plants.map((plant) => (
                        <option key={plant.id} value={plant.id}>
                          {plant.personalName || plant.commonName || plant.sciName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
