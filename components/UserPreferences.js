import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaPalette, FaLock, FaSave } from 'react-icons/fa';

export default function UserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: false,
      reminders: true,
      plantUpdates: true
    },
    display: {
      theme: 'system',
      language: 'es',
      dateFormat: 'dd/mm/yyyy',
      temperatureUnit: 'celsius'
    },
    privacy: {
      profilePublic: false,
      shareStats: false,
      allowAnalytics: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    try {
      // Cargar preferencias del localStorage por ahora
      const savedPrefs = localStorage.getItem('plantcare-preferences');
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      // Guardar en localStorage por ahora
      localStorage.setItem('plantcare-preferences', JSON.stringify(preferences));
      setMessage('Preferencias guardadas exitosamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
          <p className="text-green-800 dark:text-green-200">{message}</p>
        </div>
      )}

      {/* Notificaciones */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaEnvelope /> Notificaciones
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Notificaciones por email</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Recibir recordatorios y actualizaciones por correo
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifications.email}
                onChange={(e) => updatePreference('notifications', 'email', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 dark:after:bg-gray-100 peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Recordatorios de cuidado</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Alertas sobre riego, fertilización y otros cuidados
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifications.reminders}
                onChange={(e) => updatePreference('notifications', 'reminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 dark:after:bg-gray-100 peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Actualizaciones de plantas</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Información sobre el crecimiento y estado de tus plantas
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifications.plantUpdates}
                onChange={(e) => updatePreference('notifications', 'plantUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 dark:after:bg-gray-100 peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Preferencias de Pantalla */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaPalette /> Preferencias de Pantalla
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Idioma
            </label>
            <select
              value={preferences.display.language}
              onChange={(e) => updatePreference('display', 'language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="pt">Português</option>
            </select>
            <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">(Solo cambia el idioma de la interfaz, en desarrollo)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Formato de fecha
            </label>
            <select
              value={preferences.display.dateFormat}
              onChange={(e) => updatePreference('display', 'dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="dd/mm/yyyy">DD/MM/YYYY</option>
              <option value="mm/dd/yyyy">MM/DD/YYYY</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD</option>
            </select>
            <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">(No afecta a todas las fechas, en desarrollo)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Unidad de temperatura
            </label>
            <select
              value={preferences.display.temperatureUnit}
              onChange={(e) => updatePreference('display', 'temperatureUnit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="celsius">Celsius (°C)</option>
              <option value="fahrenheit">Fahrenheit (°F)</option>
            </select>
            <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">(Solo visual, en desarrollo)</p>
          </div>
        </div>
      </div>

      {/* Privacidad */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaLock /> Privacidad
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Perfil público</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Permitir que otros usuarios vean tu perfil
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-300">(En desarrollo, no afecta la visibilidad real)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.privacy.profilePublic}
                onChange={(e) => updatePreference('privacy', 'profilePublic', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 dark:after:bg-gray-100 peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Compartir estadísticas</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Contribuir con estadísticas anónimas para mejorar la app
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">(En desarrollo, no se comparten datos aún)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.privacy.shareStats}
                onChange={(e) => updatePreference('privacy', 'shareStats', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 dark:after:bg-gray-100 peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Análisis de uso</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ayudar a mejorar la aplicación con datos de uso anónimos
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">(En desarrollo, no se recopilan datos aún)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.privacy.allowAnalytics}
                onChange={(e) => updatePreference('privacy', 'allowAnalytics', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 dark:after:bg-gray-100 peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Botón guardar */}
      <div className="flex justify-end">
        <button
          onClick={savePreferences}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        >
          <FaSave />
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}
