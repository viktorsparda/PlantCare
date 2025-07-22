import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import UserPreferences from '../components/UserPreferences';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

export default function Configuracion() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('preferences');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [showFinalConfirmModal, setShowFinalConfirmModal] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const handleExportData = async () => {
    try {
      const loadingToast = toast.loading('Preparando exportación de datos...');
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const idToken = await user.getIdToken();
      const response = await fetch(`${apiUrl}/export/data`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        // Crear y descargar el archivo
        const data = await response.json();
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `plantcare_export_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        toast.success(
          `✅ Datos exportados exitosamente. Se han descargado ${data.user_data.plants.length} plantas y ${data.user_data.reminders.length} recordatorios.`,
          { 
            duration: 5000,
            id: loadingToast 
          }
        );
      } else {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(errorData.error || 'Error en el servidor');
      }
    } catch (error) {
      console.error('Error al exportar datos:', error);
      toast.error(
        `Error al exportar los datos: ${error.message}. Verifica que el servidor esté funcionando.`,
        { duration: 6000 }
      );
    }
  };

  const handleDeleteAllData = () => {
    setShowDeleteModal(true);
  };

  const handleFirstConfirm = () => {
    setShowDeleteModal(false);
    setShowConfirmDeleteModal(true);
  };

  const handleSecondConfirm = () => {
    setShowConfirmDeleteModal(false);
    setShowFinalConfirmModal(true);
  };

  const handleFinalConfirm = async () => {
    if (confirmationText === 'ELIMINAR TODO') {
      setShowFinalConfirmModal(false);
      setConfirmationText('');
      
      const loadingToast = toast.loading('Eliminando todos los datos...');
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const idToken = await user.getIdToken();
        const response = await fetch(`${apiUrl}/user/all-data`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          toast.success(
            `Eliminación completada: ${data.deletedPlants} plantas, ${data.deletedReminders} recordatorios y ${data.deletedPhotos} fotos eliminadas permanentemente`,
            { 
              duration: 6000,
              id: loadingToast 
            }
          );
          
          // Opcional: redirigir al usuario a la página de inicio o logout
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 3000);
        } else {
          throw new Error(data.error || 'Error al eliminar los datos');
        }
      } catch (error) {
        console.error('Error al eliminar datos:', error);
        toast.error(
          `Error al eliminar los datos: ${error.message}. Contacta con soporte si el problema persiste.`,
          { 
            duration: 8000,
            id: loadingToast 
          }
        );
      }
    } else {
      toast.error('Texto de confirmación incorrecto. Eliminación cancelada.');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setShowConfirmDeleteModal(false);
    setShowFinalConfirmModal(false);
    setConfirmationText('');
    toast('Eliminación cancelada. Tus datos están seguros.', {
      icon: 'ℹ️',
    });
  };

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
                      📤 Exportar Datos
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Descarga una copia de todos tus datos de PlantCare en formato JSON. 
                      Incluye plantas, recordatorios, fotos y preferencias.
                    </p>
                    <button 
                      onClick={handleExportData}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      📥 Exportar Datos
                    </button>
                  </div>
                  
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      ☁️ Backup Automático
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Tus datos se respaldan automáticamente y están sincronizados con tu cuenta.
                      El último respaldo se realizó hace menos de 24 horas.
                    </p>
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <span className="text-xl mr-2">✅</span>
                      <span className="font-medium">Backup automático activo</span>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                      🗑️ Eliminar Todos los Datos
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      ⚠️ <strong>Acción irreversible:</strong> Esta acción eliminará permanentemente todos tus datos de PlantCare, 
                      incluyendo plantas, recordatorios, fotos y configuraciones.
                    </p>
                    <button 
                      onClick={handleDeleteAllData}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      ⚠️ Eliminar Todos los Datos
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
                      💚 Desarrollado con amor para los amantes de las plantas
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      PlantCare es una aplicación diseñada para ayudarte a cuidar mejor tus plantas. 
                      Utiliza tecnología avanzada de IA para brindarte consejos personalizados y recordatorios 
                      útiles para mantener tus plantas saludables y prósperas.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-green-600 dark:text-green-400 text-lg">500+</div>
                        <div className="text-gray-600 dark:text-gray-400">Plantas identificadas</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600 dark:text-blue-400 text-lg">1,200+</div>
                        <div className="text-gray-600 dark:text-gray-400">Recordatorios enviados</div>
                      </div>
                    </div>
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

      {/* Modales de confirmación para eliminar datos */}
      <ConfirmModal
        open={showDeleteModal}
        title="⚠️ Eliminar Todos los Datos"
        description="Esta acción eliminará permanentemente TODOS tus datos de PlantCare, incluyendo: todas tus plantas, todos tus recordatorios, todas tus fotos y todas tus preferencias. ¿Estás completamente seguro?"
        confirmText="Continuar"
        cancelText="Cancelar"
        onConfirm={handleFirstConfirm}
        onCancel={handleCancelDelete}
      />

      <ConfirmModal
        open={showConfirmDeleteModal}
        title="🚨 Última Confirmación"
        description="Esta es tu última oportunidad de cancelar. Una vez confirmado, NO PODRÁS recuperar tus datos. ¿Realmente quieres eliminar todos tus datos?"
        confirmText="Sí, eliminar todo"
        cancelText="Cancelar"
        onConfirm={handleSecondConfirm}
        onCancel={handleCancelDelete}
      />

      {/* Modal especial para escribir confirmación */}
      {showFinalConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-md mx-2">
            <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">
              🔐 Confirmación Final
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300 text-sm">
              Para confirmar la eliminación permanente de todos tus datos, escribe exactamente:
              <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded ml-1 text-red-600 dark:text-red-400">
                ELIMINAR TODO
              </span>
            </p>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Escribe: ELIMINAR TODO"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={handleCancelDelete}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleFinalConfirm}
                disabled={confirmationText !== 'ELIMINAR TODO'}
              >
                Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
