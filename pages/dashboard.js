import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Layout from "@/components/Layout";
import PlantIdentifier from "../components/PlantIdentifier";
import MyPlants from "../components/MyPlants";
import PlantSaveForm from "../components/PlantSaveForm";
import Tips from "../components/Tips";
import Recordatorios from "../components/Recordatorios";
import RecordatoriosUrgentes from "../components/RecordatoriosUrgentes";
import Galeria from "../components/Galeria";

export default function Dashboard() {
  const { user, emailVerified, loading, reloadUser } = useAuth();
  const router = useRouter();
  const [saveFormData, setSaveFormData] = useState({});
  const [refreshPlants, setRefreshPlants] = useState(0);
  const [saveFormOpen, setSaveFormOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !emailVerified) {
      const intervalId = setInterval(() => {
        reloadUser(); // Llama a la función del contexto para recargar y actualizar el estado
      }, 3000); // Revisa cada 3 segundos

      return () => clearInterval(intervalId);
    }
  }, [user, emailVerified, reloadUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">Cargando...</p>
      </div>
    );
  }

  if (user && !emailVerified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-center p-6">
        <div className="flex items-center justify-center mb-4">
          <svg
            className="animate-spin h-8 w-8 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Verificando tu cuenta...
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Hemos enviado un enlace a <strong>{user.email}</strong>. Por favor,
          revisa tu correo para completar el registro.
        </p>
      </div>
    );
  }

  // Handler para abrir el Sheet desde cualquier parte
  function openSaveForm(data) {
    setSaveFormData(data);
    setSaveFormOpen(true);
  }
  function closeSaveForm() {
    setSaveFormOpen(false);
  }
  function handlePlantSaved() {
    setRefreshPlants((r) => r + 1);
    closeSaveForm();
  }
  return (
    <Layout pageTitle="Panel de Plantas">
      {/* Renderiza el formulario de guardado como un modal si saveFormOpen es true */}
      {saveFormOpen && (
        <PlantSaveForm
          {...saveFormData}
          onCancel={closeSaveForm}
          onPlantSaved={handlePlantSaved}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de bienvenida */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Hola, {user?.displayName || user?.email?.split('@')[0] || 'Jardinero'}! 🌱
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Bienvenido a tu jardín digital
          </p>
        </div>

        {/* Recordatorios urgentes - siempre visible en la parte superior */}
        <div className="mb-8">
          <RecordatoriosUrgentes />
        </div>

        {/* Layout principal mejorado */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Columna izquierda - Herramientas principales */}
          <div className="xl:col-span-4 space-y-8">
            
            {/* Identificador de plantas - más prominente */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-green-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-green-800 dark:text-green-300">
                    🌿 Identificar Nueva Planta
                  </h2>
                  <div className="bg-green-100 dark:bg-green-900 rounded-full p-2">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Sube una foto para identificar cualquier planta y agregarla a tu colección
                </p>
                <PlantIdentifier onOpenSaveForm={openSaveForm} />
              </div>
            </div>

            {/* Panel de acciones rápidas */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">⚡</span>
                Acciones Rápidas
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => router.push('/recordatorios')}
                  className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <span className="text-white text-sm">⏰</span>
                  </div>
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300 text-center">Ver Recordatorios</span>
                </button>
                
                <button 
                  onClick={() => router.push('/perfil')}
                  className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <span className="text-white text-sm">👤</span>
                  </div>
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300 text-center">Mi Perfil</span>
                </button>
              </div>
            </div>

            {/* Tips de cuidado */}
            <Tips />
            
          </div>

          {/* Columna central y derecha - Contenido principal */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* Mis plantas - sección principal */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <span className="mr-2">🌱</span>
                    Mi Jardín
                  </h2>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => router.push('/recordatorios')}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                    >
                      Ver todos los recordatorios →
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <MyPlants refreshTrigger={refreshPlants} />
              </div>
            </div>

            {/* Grid inferior - Recordatorios y Galería */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Recordatorios de hoy */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm border border-blue-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
                    <span className="mr-2">📅</span>
                    Recordatorios de Hoy
                  </h3>
                  <Recordatorios />
                </div>
              </div>

              {/* Galería de plantas */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm border border-yellow-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-4 flex items-center">
                    <span className="mr-2">🖼️</span>
                    Galería
                  </h3>
                  <Galeria />
                </div>
              </div>
              
            </div>
            
          </div>
          
        </div>
      </div>
    </Layout>
  );
}
