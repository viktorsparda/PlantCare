import Layout from "@/components/Layout";

export default function HelpPage() {
  return (
    <Layout pageTitle="Guía y Preguntas Frecuentes (FAQ)">
      <div className="max-w-2xl mx-auto py-2 px-4 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="divide-y divide-green-200 dark:divide-green-800 rounded-2xl shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg w-full">
          {/* FAQ ITEM */}
          <div className="py-6 px-4 flex gap-4 items-start">
            <span className="text-2xl mt-1 text-green-500">🌱</span>
            <div>
              <h2 className="text-xl font-semibold mb-1 text-green-700 dark:text-green-300">¿Qué es PlantCare?</h2>
              <p className="text-gray-700 dark:text-gray-200">PlantCare es una app para identificar plantas, aprender a cuidarlas y recibir recordatorios de riego. Puedes guardar tus plantas, ver tips, y gestionar tu colección de forma sencilla.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <span className="text-2xl mt-1 text-green-500">📷</span>
            <div>
              <h2 className="text-xl font-semibold mb-1 text-green-700 dark:text-green-300">¿Cómo identifico una planta?</h2>
              <p className="text-gray-700 dark:text-gray-200">En el panel principal, usa el Identificador de Plantas para subir una foto. La app te mostrará el nombre científico y común, y podrás guardarla en tu colección.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <span className="text-2xl mt-1 text-green-500">➕</span>
            <div>
              <h2 className="text-xl font-semibold mb-1 text-green-700 dark:text-green-300">¿Cómo agrego una planta a mi colección?</h2>
              <p className="text-gray-700 dark:text-gray-200">Después de identificar una planta, haz clic en <span className="font-semibold text-green-600 dark:text-green-400">"Guardar en Mis Plantas"</span>. Completa los datos (nombre personal, ubicación, frecuencia de riego, etc.) y guarda. La planta aparecerá en tu panel.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <span className="text-2xl mt-1 text-blue-500">⏰</span>
            <div>
              <h2 className="text-xl font-semibold mb-1 text-blue-700 dark:text-blue-300">¿Cómo configuro recordatorios?</h2>
              <p className="text-gray-700 dark:text-gray-200">En la sección de Recordatorios puedes ver tips y recomendaciones. Al guardar una planta, puedes elegir la frecuencia de riego y otros cuidados. Pronto podrás recibir notificaciones automáticas.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <span className="text-2xl mt-1 text-yellow-500">🖼️</span>
            <div>
              <h2 className="text-xl font-semibold mb-1 text-yellow-700 dark:text-yellow-300">¿Cómo funciona la galería?</h2>
              <p className="text-gray-700 dark:text-gray-200">La galería muestra las fotos de tus plantas guardadas. Próximamente podrás filtrar y ver detalles de cada especie.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <span className="text-2xl mt-1 text-green-500">🔑</span>
            <div>
              <h2 className="text-xl font-semibold mb-1 text-green-700 dark:text-green-300">¿Cómo recupero mi contraseña?</h2>
              <p className="text-gray-700 dark:text-gray-200">En la pantalla de inicio de sesión, haz clic en <span className="font-semibold text-green-600 dark:text-green-400">"¿Olvidaste tu contraseña?"</span>. Ingresa tu correo y recibirás un enlace para restablecerla.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <span className="text-2xl mt-1 text-green-500">📝</span>
            <div>
              <h2 className="text-xl font-semibold mb-1 text-green-700 dark:text-green-300">¿Cómo me registro y verifico mi cuenta?</h2>
              <p className="text-gray-700 dark:text-gray-200">Ve a <span className="font-semibold text-green-600 dark:text-green-400">"Registrarse"</span>, completa tus datos y revisa tu correo para verificar tu cuenta antes de iniciar sesión.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <span className="text-2xl mt-1 text-gray-500">🌙</span>
            <div>
              <h2 className="text-xl font-semibold mb-1 text-gray-700 dark:text-gray-200">¿Cómo cambio entre modo claro y oscuro?</h2>
              <p className="text-gray-700 dark:text-gray-200">Usa el botón de luna/sol en la esquina superior derecha para alternar entre modo claro y oscuro.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <span className="text-2xl mt-1 text-red-500">❌</span>
            <div>
              <h2 className="text-xl font-semibold mb-1 text-red-700 dark:text-red-300">¿Qué hago si tengo problemas para iniciar sesión?</h2>
              <p className="text-gray-700 dark:text-gray-200">Verifica tu correo y contraseña. Si olvidaste la contraseña, usa la opción de recuperación. Si tu cuenta no está verificada, revisa tu correo (incluida la carpeta de spam) y sigue el enlace de verificación.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <span className="text-2xl mt-1 text-red-500">🗑️</span>
            <div>
              <h2 className="text-xl font-semibold mb-1 text-red-700 dark:text-red-300">¿Cómo elimino una planta?</h2>
              <p className="text-gray-700 dark:text-gray-200">En tu panel de plantas, haz clic en el ícono de eliminar (🗑️) en la tarjeta de la planta que deseas borrar.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <span className="text-2xl mt-1 text-gray-500">🚪</span>
            <div>
              <h2 className="text-xl font-semibold mb-1 text-gray-700 dark:text-gray-200">¿Cómo cierro sesión?</h2>
              <p className="text-gray-700 dark:text-gray-200">Haz clic en <span className="font-semibold text-green-600 dark:text-green-400">"Cerrar Sesión"</span> en el menú lateral.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <span className="text-2xl mt-1 text-yellow-500">💡</span>
            <div>
              <h2 className="text-xl font-semibold mb-1 text-yellow-700 dark:text-yellow-300">¿Dónde puedo ver tips y consejos?</h2>
              <p className="text-gray-700 dark:text-gray-200">En la sección <span className="font-semibold text-green-600 dark:text-green-400">"Tips"</span> del panel principal encontrarás recomendaciones para el cuidado de tus plantas.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <span className="text-2xl mt-1 text-green-500">📋</span>
            <div>
              <h2 className="text-xl font-semibold mb-1 text-green-700 dark:text-green-300">¿Qué datos se guardan de mis plantas?</h2>
              <p className="text-gray-700 dark:text-gray-200">Se almacena el nombre científico, nombre común, nombre personal, ubicación, frecuencia de riego, tipo de luz, drenaje, notas y foto.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start rounded-b-2xl">
            <span className="text-2xl mt-1 text-green-500">🔒</span>
            <div>
              <h2 className="text-xl font-semibold mb-1 text-green-700 dark:text-green-300">¿Mis datos están seguros?</h2>
              <p className="text-gray-700 dark:text-gray-200">Sí, la autenticación y los datos están protegidos mediante Firebase y tu sesión es privada.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
