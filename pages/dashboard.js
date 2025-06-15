import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../lib/firebase"; // auth viene de aquí
import Layout from "../components/Layout";
import PlantIdentifier from "../components/PlantIdentifier";
import MyPlants from "../components/MyPlants";
import PlantSaveForm from "../components/PlantSaveForm";
import Tips from "../components/Tips";
import Recordatorios from "../components/Recordatorios";
import Galeria from "../components/Galeria";
import SidebarDrawer from "../components/SidebarDrawer";

export default function Dashboard() {
  const { user, emailVerified, loading, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [saveFormData, setSaveFormData] = useState({});
  const [resendMessage, setResendMessage] = useState('');
  const [saveFormOpen, setSaveFormOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  if (user && !emailVerified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 dark:bg-gray-900 p-6 text-center">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-4">Verifica tu Correo Electrónico</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            Para acceder al dashboard, primero debes verificar tu dirección de correo electrónico.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Hemos enviado un enlace de verificación a <strong>{user.email}</strong>. Por favor, revisa tu bandeja de entrada (y la carpeta de spam).
          </p>
          {resendMessage && <p className={`mb-4 text-sm ${resendMessage.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{resendMessage}</p>}
          <button
            onClick={async () => {
              try {
                if (auth.currentUser) {
                  await sendEmailVerification(auth.currentUser);
                  setResendMessage("Se ha reenviado el correo de verificación. Revisa tu bandeja de entrada.");
                } else {
                   setResendMessage("Error: No se pudo encontrar el usuario actual para reenviar el correo.");
                }
              } catch (error) {
                console.error("Error reenviando email de verificación:", error);
                setResendMessage("Error al reenviar el correo. Inténtalo más tarde.");
              }
            }}
            className="w-full px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 mb-3 transition-colors duration-150"
          >
            Reenviar Correo de Verificación
          </button>
          <button
            onClick={() => {
              logout(); // Esto ya redirige a login o la página principal según AuthContext
            }}
            className="w-full px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors duration-150"
          >
            Cerrar Sesión
          </button>
        </div>
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
  return (
    <Layout>
      {/* Sheet configurado para aparecer desde la derecha */}
      <SidebarDrawer open={saveFormOpen} onClose={closeSaveForm}>
        <PlantSaveForm
          {...saveFormData}
          onCancel={closeSaveForm}
        />
      </SidebarDrawer>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <section className="col-span-1 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg p-6 flex flex-col justify-between">
          <PlantIdentifier onOpenSaveForm={openSaveForm} />
          <div className="mt-6">
            <Tips />
            <Recordatorios />
          </div>
        </section>
        <section className="col-span-2 flex flex-col gap-8">
          <Galeria />
          <MyPlants />
        </section>
      </div>
    </Layout>
  );
}
// Este es el panel principal del usuario, donde se mostrarán las funcionalidades principales de la aplicación.
// Asegúrate de que el usuario esté autenticado antes de mostrar el contenido del dashboard.
