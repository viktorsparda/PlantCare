import Link from 'next/link';
import ToggleDarkMode from '../components/ToggleDarkMode';

export default function Home() {
  return (
    <main className="min-h-screen bg-green-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-center transition-colors duration-300 relative">
      {/* Toggle de dark mode en la esquina superior derecha */}
      <div className="absolute top-6 right-6">
        <ToggleDarkMode />
      </div>

      {/* Título principal */}
      <h1 className="text-5xl font-bold text-green-700 dark:text-green-400 mb-4 transition-colors duration-300">
        🌿 PlantCare
      </h1>
      
      {/* Descripción */}
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-2xl transition-colors duration-300">
        Identifica tus plantas, aprende a cuidarlas y recibe recordatorios de riego.
      </p>
      
      {/* Botones de acción */}
      <div className="flex gap-4 justify-center flex-wrap">
        <Link
          href="/login"
          className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="bg-white dark:bg-gray-800 border border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 px-5 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
        >
          Registrarse
        </Link>
      </div>

      {/* Decoración adicional opcional */}
      <div className="mt-12 text-4xl opacity-20 dark:opacity-10 transition-opacity duration-300">
        🌱 🌿 🍃 🌾 🌳
      </div>
    </main>
  );
}