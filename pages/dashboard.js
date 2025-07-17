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
  const [showTooltip, setShowTooltip] = useState(false);

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
    // Transformar los datos de la identificación para el formulario
    const formData = {
      sciName: data?.species?.scientificNameWithoutAuthor || '',
      commonName: data?.species?.commonNames?.join(', ') || '',
      photo: data?.photo || null,
      // Agregar otros campos si existen
      ...data
    };
    setSaveFormData(formData);
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
          <div className="xl:col-span-5 space-y-8">
            
            {/* Identificador de plantas - más prominente */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-green-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-green-800 dark:text-green-300">
                    🌿 Identificar Nueva Planta
                  </h2>
                  <button
                    type="button"
                    aria-label="Ayuda para identificar plantas"
                    className="bg-green-100 dark:bg-green-900 rounded-full p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 focus:outline-none relative transition-colors"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onFocus={() => setShowTooltip(true)}
                    onBlur={() => setShowTooltip(false)}
                    onClick={() => setShowTooltip((v) => !v)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                    </svg>
                  </button>
                  
                  {/* Tooltip que aparece fuera del contenedor */}
                  {showTooltip && (
                    <div
                      className="fixed z-[9999] w-80 max-w-sm rounded-2xl bg-gradient-to-br from-green-50/98 via-white/98 to-green-100/98 dark:from-gray-900/98 dark:via-gray-900/98 dark:to-gray-800/98 shadow-2xl border border-green-300 dark:border-green-800 px-5 py-4 text-sm text-gray-800 dark:text-gray-100 backdrop-blur-md"
                      style={{ 
                        pointerEvents: 'auto',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        marginTop: '40px'
                      }}
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      <div className="font-bold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                        </svg>
                        ¡Consejos para identificación exitosa!
                      </div>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        <li><span className="font-semibold text-green-700 dark:text-green-200">Foto clara y frontal:</span> Enfoca las hojas o flores nítidamente.</li>
                        <li><span className="font-semibold text-green-700 dark:text-green-200">Buena iluminación:</span> Evita sombras y fondos confusos.</li>
                        <li><span className="font-semibold text-green-700 dark:text-green-200">Formatos aceptados:</span> JPG, PNG, WebP (máx. 5MB).</li>
                        <li><span className="font-semibold text-green-700 dark:text-green-200">¡Entre más nítida la foto, mejor el resultado!</span></li>
                      </ul>
                      
                      {/* Botón para cerrar */}
                      <button 
                        onClick={() => setShowTooltip(false)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Sube una foto para identificar cualquier planta y agregarla a tu colección
                </p>
                <PlantIdentifier onOpenSaveForm={openSaveForm} />
              </div>
            </div>

            {/* Tips de cuidado */}
            <Tips />
            
          </div>

          {/* Columna central y derecha - Contenido principal */}
          <div className="xl:col-span-7 space-y-8">
            
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
