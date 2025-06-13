import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import PlantIdentifier from "../components/PlantIdentifier";
import SidebarMenu from "../components/SidebarMenu";
import ToggleDarkMode from "../components/ToggleDarkMode";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-green-50 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-300 relative">
      {/* Toggle dark mode */}
      <div className="absolute top-4 right-4 z-40">
        <ToggleDarkMode />
      </div>
      <header className="flex justify-between items-center mb-6 md:mb-8">
        <div className="w-10 flex justify-start items-center">
          <SidebarMenu onLogout={logout} onMenuStateChange={setMenuOpen} />
          {menuOpen && <span className="inline-block w-6 h-6" />}
        </div>
        <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mx-auto text-center">
          Panel de Plantas
        </h1>
        <div className="w-10" />
      </header>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <PlantIdentifier />
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-1 md:mb-2 text-green-700 dark:text-green-400">
            🌱 Mis Plantas
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Aquí aparecerán tus plantas registradas
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-1 md:mb-2 text-green-700 dark:text-green-400">
            🖼️ Galería
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Fotos de tus plantas organizadas
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-1 md:mb-2 text-green-700 dark:text-green-400">
            💡 Tips de Cuidado
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Consejos personalizados para tus plantas
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-1 md:mb-2 text-green-700 dark:text-green-400">
            ⏰ Recordatorios de Riego
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Recibe avisos cuando tus plantas necesiten agua
          </p>
        </div>
      </section>
    </main>
  );
}
// Este es el panel principal del usuario, donde se mostrarán las funcionalidades principales de la aplicación.
// Asegúrate de que el usuario esté autenticado antes de mostrar el contenido del dashboard.