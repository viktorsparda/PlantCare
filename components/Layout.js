import { useState, useEffect } from "react";
import ToggleDarkMode from "./ToggleDarkMode";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import HelpButton from "./HelpButton";
import { FaSignOutAlt, FaTimes, FaBars, FaHome, FaUser, FaCog, FaQuestionCircle, FaBell, FaImage, FaLeaf } from 'react-icons/fa';
import { MdSensors } from 'react-icons/md';

function LogoutButton() {
  const { logout } = useAuth();
  return (
    <button
      onClick={logout}
      className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition"
      aria-label="Cerrar sesión"
    >
      <FaSignOutAlt className="h-5 w-5" />
      Cerrar Sesión
    </button>
  );
}

export default function Layout({ children, pageTitle }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const updateSidebarStateBasedOnScreenSize = () => {
      if (window.innerWidth < 768) {
        // Tailwind 'md' breakpoint
        setIsSidebarOpen(false); // Cerrado en móvil
      } else {
        setIsSidebarOpen(true); // Abierto en escritorio
      }
    };

    // Establecer el estado inicial después del montaje en el cliente
    updateSidebarStateBasedOnScreenSize();

    // Agregar listener para cambios de tamaño de ventana
    window.addEventListener("resize", updateSidebarStateBasedOnScreenSize);

    // Limpiar el listener al desmontar el componente
    return () => {
      window.removeEventListener("resize", updateSidebarStateBasedOnScreenSize);
    };
  }, []); // El array vacío asegura que esto se ejecute solo al montar y desmontar
  return (
    <div className="min-h-screen flex bg-green-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside
        className={`w-64 bg-white/80 dark:bg-gray-800/80 border-r border-gray-200 dark:border-gray-700 flex flex-col p-6 gap-8 fixed inset-y-0 left-0 z-40 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 mb-10 relative">
          <span className="text-2xl font-extrabold text-green-700 dark:text-green-400 flex items-center gap-2">
            <FaLeaf /> PlantCare
          </span>
          {isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="absolute top-1/2 right-0 transform -translate-y-1/2 p-1 rounded-md text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Cerrar menú"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          )}
        </div>
        <nav className="flex flex-col gap-2 text-lg font-semibold text-green-800 dark:text-green-200">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 font-medium transition-colors"
          >
            <FaHome />
            <span>Inicio</span>
          </Link>
          <Link
            href="/perfil"
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 font-medium transition-colors"
          >
            <FaUser />
            <span>Perfil</span>
          </Link>
          <Link
            href="/recordatorios"
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 font-medium transition-colors"
          >
            <FaBell />
            <span>Recordatorios</span>
          </Link>
          <Link
            href="/galeria"
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 font-medium transition-colors"
          >
            <FaImage />
            <span>Galería</span>
          </Link>
          <Link
            href="/iot"
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 font-medium transition-colors"
          >
            <MdSensors />
            <span>IoT</span>
          </Link>
          <Link
            href="/configuracion"
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 font-medium transition-colors"
          >
            <FaCog />
            <span>Configuración</span>
          </Link>
          <Link
            href="/help"
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 font-medium transition-colors"
          >
            <FaQuestionCircle />
            <span>Ayuda</span>
          </Link>
        </nav>
        <div className="mt-auto">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md sticky top-0 z-30">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Abrir menú"
          >
            <FaBars className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-green-800 dark:text-green-200">
            {pageTitle}
          </h1>
          <ToggleDarkMode />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
          <HelpButton />
        </main>
      </div>
    </div>
  );
}
