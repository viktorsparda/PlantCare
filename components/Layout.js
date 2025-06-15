import { useState, useEffect } from 'react';
import ToggleDarkMode from "./ToggleDarkMode";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

function LogoutButton() {
  const { logout } = useAuth();
  return (
    <button
      onClick={logout}
      className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition"
      aria-label="Cerrar sesión"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
      </svg>
      Cerrar Sesión
    </button>
  );
}

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const updateSidebarStateBasedOnScreenSize = () => {
      if (window.innerWidth < 768) { // Tailwind 'md' breakpoint
        setIsSidebarOpen(false); // Cerrado en móvil
      } else {
        setIsSidebarOpen(true); // Abierto en escritorio
      }
    };

    // Establecer el estado inicial después del montaje en el cliente
    updateSidebarStateBasedOnScreenSize();

    // Agregar listener para cambios de tamaño de ventana
    window.addEventListener('resize', updateSidebarStateBasedOnScreenSize);

    // Limpiar el listener al desmontar el componente
    return () => {
      window.removeEventListener('resize', updateSidebarStateBasedOnScreenSize);
    };
  }, []); // El array vacío asegura que esto se ejecute solo al montar y desmontar
  return (
    <div className="min-h-screen flex bg-green-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`w-64 bg-white/80 dark:bg-gray-800/80 border-r border-gray-200 dark:border-gray-700 flex flex-col p-6 gap-8 fixed inset-y-0 left-0 z-40 shadow-xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 mb-10 relative">
          <span className="text-2xl font-extrabold text-green-700 dark:text-green-400">🌱 PlantCare</span>
          {isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="absolute top-1/2 right-0 transform -translate-y-1/2 p-1 rounded-md text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Cerrar menú"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <nav className="flex flex-col gap-2 text-lg font-semibold text-green-800 dark:text-green-200">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 font-medium transition-colors">
            {/* Home icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-green-700 dark:text-green-300">
  <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
</svg>

            Panel
          </Link>
          <a href="#galeria" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 font-medium transition-colors">
            {/* Photograph icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-green-700 dark:text-green-300">
  <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
</svg>

            Galería
          </a>
          <a href="#tips" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 font-medium transition-colors">
            {/* Light Bulb icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-green-700 dark:text-green-300">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
</svg>

            Tips
          </a>
          <a href="#recordatorios" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 font-medium transition-colors">
            {/* Bell icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-green-700 dark:text-green-300">
  <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
</svg>

            Recordatorios
          </a>
          <a href="#configuracion" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 font-medium transition-colors">
            {/* Cog icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-green-700 dark:text-green-300">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>

            Configuración
          </a>
          <a href="#perfil" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 font-medium transition-colors">
            {/* User icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-green-700 dark:text-green-300">
  <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>
            Perfil
          </a>
        </nav>
        <div className="mt-auto flex flex-col gap-4">
          <ToggleDarkMode />
          <LogoutButton />
        </div>
      </aside>
      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <header className="py-6 px-8 border-b border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 shadow-sm sticky top-0 z-30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center"> {/* Contenedor para reservar espacio */} 
                {!isSidebarOpen && (
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-md text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label="Abrir menú"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                  </button>
                )}
              </div>
              <h1 className="text-3xl font-bold text-green-700 dark:text-green-400">Panel de Plantas</h1>
            </div>
        </header>
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
