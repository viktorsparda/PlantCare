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
      
      {/* Recordatorios urgentes - aparece en la parte superior */}
      <RecordatoriosUrgentes />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <section className="col-span-1 flex flex-col gap-8">
          <PlantIdentifier onOpenSaveForm={openSaveForm} />
          <div className="space-y-8">
            <Tips />
            <Recordatorios />
          </div>
        </section>
        <section className="col-span-2 flex flex-col gap-8">
          <MyPlants refreshTrigger={refreshPlants} />
          <Galeria />
        </section>
      </div>
    </Layout>
  );
}
