import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import UserPreferences from '../components/UserPreferences';

export default function Configuracion() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('preferences');

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Acceso Restringido
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Debes iniciar sesión para acceder a la configuración.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ⚙️ Configuración
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Personaliza tu experiencia en PlantCare
          </p>
        </div>

        {/* Menú lateral */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Configuración
              </h2>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveSection('preferences')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeSection === 'preferences'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    🎨 Preferencias
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('notifications')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeSection === 'notifications'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    🔔 Notificaciones
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('data')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeSection === 'data'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    📊 Datos
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('about')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeSection === 'about'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    ℹ️ Acerca de
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            {activeSection === 'preferences' && <UserPreferences />}
            
            {activeSection === 'notifications' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  🔔 Configuración de Notificaciones
                </h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      Recordatorios de Riego
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      Recibe notificaciones cuando tus plantas necesiten agua. Puedes configurar la frecuencia desde la página de cada planta.
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      Cuidados Especiales
                    </h3>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      Alertas para fertilización, poda, trasplante y otros cuidados importantes para tus plantas.
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                      Consejos Diarios
                    </h3>
                    <p className="text-purple-700 dark:text-purple-300 text-sm">
                      Recibe consejos personalizados basados en tus plantas y la época del año.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  📊 Gestión de Datos
                </h2>
                <div className="space-y-6">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Exportar Datos
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Descarga una copia de todos tus datos de PlantCare en formato JSON.
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                      Exportar Datos
                    </button>
                  </div>
                  
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Backup Automático
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Tus datos se respaldan automáticamente en tu cuenta de Google.
                    </p>
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <span className="text-xl mr-2">✅</span>
                      <span>Backup automático activado</span>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                      Eliminar Todos los Datos
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Esta acción eliminará permanentemente todos tus datos de PlantCare.
                    </p>
                    <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                      Eliminar Todos los Datos
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'about' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  ℹ️ Acerca de PlantCare
                </h2>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🌱</div>
                    <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                      PlantCare
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Versión 1.0.0
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Desarrollado con ❤️
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      PlantCare es una aplicación diseñada para ayudarte a cuidar mejor tus plantas. 
                      Utiliza tecnología avanzada para brindarte consejos personalizados y recordatorios 
                      útiles para mantener tus plantas saludables.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                        🌿 Características
                      </h4>
                      <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <li>• Identificación de plantas</li>
                        <li>• Recordatorios personalizados</li>
                        <li>• Consejos de cuidado</li>
                        <li>• Galería de fotos</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        🔧 Tecnología
                      </h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Next.js & React</li>
                        <li>• Firebase Authentication</li>
                        <li>• Google Gemini AI</li>
                        <li>• Tailwind CSS</li>
                      </ul>
                    </div>
                  </div>

                  <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                    <p>© 2025 PlantCare. Hecho con 🌱 para los amantes de las plantas.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
