import Layout from "@/components/Layout";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { 
  FaSeedling, FaCamera, FaPlusCircle, FaPencilAlt, FaClock, FaImage, FaSearch, FaKey, FaUserPlus, 
  FaUserCircle, FaMoon, FaCog, FaExclamationTriangle, FaTrash, FaSignOutAlt, FaLightbulb, 
  FaClipboardList, FaRobot, FaLock 
} from 'react-icons/fa';

export default function HelpPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  return (
    <Layout pageTitle="Guía y Preguntas Frecuentes (FAQ)">
      <div className="max-w-2xl mx-auto py-2 px-4 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="divide-y divide-green-200 dark:divide-green-800 rounded-2xl shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg w-full">
          {/* FAQ ITEM */}
          <div className="py-6 px-4 flex gap-4 items-start">
            <FaSeedling className="text-2xl mt-1 text-green-500" />
            <div>
              <h2 className="text-xl font-semibold mb-1 text-green-700 dark:text-green-300">¿Qué es PlantCare?</h2>
              <p className="text-gray-700 dark:text-gray-200">PlantCare es una app con IA para identificar plantas, guardarlas en tu colección y recibir consejos de cuidado personalizados.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <FaCamera className="text-2xl mt-1 text-green-500" />
            <div>
              <h2 className="text-xl font-semibold mb-1 text-green-700 dark:text-green-300">¿Cómo identifico una planta?</h2>
              <p className="text-gray-700 dark:text-gray-200">Usa el <span className="font-semibold text-green-600 dark:text-green-400">&ldquo;Identificador de Plantas&rdquo;</span> en el panel principal. Sube una foto nítida y la IA te dará su nombre y cuidados.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <FaPlusCircle className="text-2xl mt-1 text-green-500" />
            <div>
              <h2 className="text-xl font-semibold mb-1 text-green-700 dark:text-green-300">¿Cómo agrego una planta a mi colección?</h2>
              <p className="text-gray-700 dark:text-gray-200">Tras identificarla, pulsa <span className="font-semibold text-green-600 dark:text-green-400">&quot;Guardar en Mis Plantas&quot;</span>. Personaliza sus datos (nombre, ubicación, riego) y se añadirá a tu colección.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <FaPencilAlt className="text-2xl mt-1 text-purple-500" />
            <div>
              <h2 className="text-xl font-semibold mb-1 text-purple-700 dark:text-purple-300">¿Puedo editar la información de mis plantas?</h2>
              <p className="text-gray-700 dark:text-gray-200">Sí. Haz clic en el ícono de editar (✏️) en la tarjeta de la planta para cambiar su nombre, foto, riego y más.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <FaClock className="text-2xl mt-1 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold mb-1 text-blue-700 dark:text-blue-300">¿Cómo funcionan los recordatorios?</h2>
              <p className="text-gray-700 dark:text-gray-200">La app calcula cuándo regar tus plantas según la frecuencia que establezcas y te muestra recordatorios urgentes.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <FaImage className="text-2xl mt-1 text-yellow-500" />
            <div>
              <h2 className="text-xl font-semibold mb-1 text-yellow-700 dark:text-yellow-300">¿Cómo funciona la galería?</h2>
              <p className="text-gray-700 dark:text-gray-200">La galería muestra las fotos de tus plantas. Es una forma visual de explorar tu colección personal.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <FaSearch className="text-2xl mt-1 text-orange-500" />
            <div>
              <h2 className="text-xl font-semibold mb-1 text-orange-700 dark:text-orange-300">¿Puedo ver los detalles de una planta?</h2>
              <p className="text-gray-700 dark:text-gray-200">Sí, haz clic en cualquier planta de tu colección para ver su información detallada y notas personales.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <FaKey className="text-2xl mt-1 text-green-500" />
            <div>
              <h2 className="text-xl font-semibold mb-1 text-green-700 dark:text-green-300">¿Cómo recupero mi contraseña?</h2>
              <p className="text-gray-700 dark:text-gray-200">En la pantalla de login, haz clic en <span className="font-semibold text-green-600 dark:text-green-400">&quot;¿Olvidaste tu contraseña?&quot;</span> e ingresa tu correo para recibir un enlace de recuperación.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <FaUserPlus className="text-2xl mt-1 text-green-500" />
            <div>
              <h2 className="text-xl font-semibold mb-1 text-green-700 dark:text-green-300">¿Cómo me registro y verifico mi cuenta?</h2>
              <p className="text-gray-700 dark:text-gray-200">Regístrate con tu nombre, correo y contraseña. Luego, verifica tu cuenta con el email que recibirás para poder iniciar sesión.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <FaUserCircle className="text-2xl mt-1 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold mb-1 text-blue-700 dark:text-blue-300">¿Puedo personalizar mi perfil?</h2>
              <p className="text-gray-700 dark:text-gray-200">Sí, en <span className="font-semibold text-blue-600 dark:text-blue-400">&quot;Perfil&quot;</span> puedes cambiar tu foto, información personal y preferencias de la app.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <FaMoon className="text-2xl mt-1 text-gray-500" />
            <div>
              <h2 className="text-xl font-semibold mb-1 text-gray-700 dark:text-gray-200">¿Cómo cambio el tema (claro/oscuro)?</h2>
              <p className="text-gray-700 dark:text-gray-200">Usa el ícono de sol/luna en la esquina superior derecha. Tu preferencia se guardará automáticamente.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <FaCog className="text-2xl mt-1 text-indigo-500" />
            <div>
              <h2 className="text-xl font-semibold mb-1 text-indigo-700 dark:text-indigo-300">¿Dónde está la configuración?</h2>
              <p className="text-gray-700 dark:text-gray-200">En <span className="font-semibold text-indigo-600 dark:text-indigo-400">&quot;Configuración&quot;</span> puedes gestionar tus preferencias, notificaciones y privacidad.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <FaExclamationTriangle className="text-2xl mt-1 text-red-500" />
            <div>
              <h2 className="text-xl font-semibold mb-1 text-red-700 dark:text-red-300">¿Problemas para iniciar sesión?</h2>
              <p className="text-gray-700 dark:text-gray-200">Verifica tus datos. Si no funciona, recupera tu contraseña. Asegúrate de haber verificado tu cuenta por correo.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <FaTrash className="text-2xl mt-1 text-red-500" />
            <div>
              <h2 className="text-xl font-semibold mb-1 text-red-700 dark:text-red-300">¿Cómo elimino una planta?</h2>
              <p className="text-gray-700 dark:text-gray-200">Haz clic en el ícono de basura (🗑️) en la tarjeta de la planta y confirma. La eliminación es permanente.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <FaSignOutAlt className="text-2xl mt-1 text-gray-500" />
            <div>
              <h2 className="text-xl font-semibold mb-1 text-gray-700 dark:text-gray-200">¿Cómo cierro sesión?</h2>
              <p className="text-gray-700 dark:text-gray-200">Haz clic en <span className="font-semibold text-green-600 dark:text-green-400">&quot;Cerrar Sesión&quot;</span> en el menú lateral.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <FaLightbulb className="text-2xl mt-1 text-yellow-500" />
            <div>
              <h2 className="text-xl font-semibold mb-1 text-yellow-700 dark:text-yellow-300">¿Dónde encuentro tips de cuidado?</h2>
              <p className="text-gray-700 dark:text-gray-200">En las secciones <span className="font-semibold text-yellow-600 dark:text-yellow-400">&quot;Tips&quot;</span> y <span className="font-semibold text-yellow-600 dark:text-yellow-400">&quot;Recordatorios&quot;</span> encontrarás consejos generales y personalizados.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <FaClipboardList className="text-2xl mt-1 text-green-500" />
            <div>
              <h2 className="text-xl font-semibold mb-1 text-green-700 dark:text-green-300">¿Qué datos se guardan de mis plantas?</h2>
              <p className="text-gray-700 dark:text-gray-200">Guardamos su nombre, ubicación, riego, luz, notas y la foto para ayudarte a cuidarla mejor.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start">
            <FaRobot className="text-2xl mt-1 text-cyan-500" />
            <div>
              <h2 className="text-xl font-semibold mb-1 text-cyan-700 dark:text-cyan-300">¿Es precisa la identificación por IA?</h2>
              <p className="text-gray-700 dark:text-gray-200">La IA es muy precisa, pero la calidad de la foto es clave. Para plantas raras, considera una segunda opinión.</p>
            </div>
          </div>
          <div className="py-6 px-4 flex gap-4 items-start rounded-b-2xl">
            <FaLock className="text-2xl mt-1 text-green-500" />
            <div>
              <h2 className="text-xl font-semibold mb-1 text-green-700 dark:text-green-300">¿Mis datos están seguros?</h2>
              <p className="text-gray-700 dark:text-gray-200">Sí. Usamos Firebase para proteger tus datos con seguridad de nivel empresarial. Tu información es privada y solo tú puedes acceder a ella.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
