import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "./ConfirmModal";
import PlantEditForm from "./PlantEditForm";
import toast from "react-hot-toast";

export default function MyPlants({ refreshTrigger }) {
  const auth = useAuth();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPlant, setEditPlant] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showActionsId, setShowActionsId] = useState(null);

  useEffect(() => {
    if (!auth || !auth.user) return;
    const fetchPlants = async () => {
      try {
        setLoading(true);
        const token = await auth.user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const response = await fetch(`${apiUrl}/plants`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error(
            "Error response from server:",
            response.status,
            errorBody
          );
          throw new Error(
            `Error al cargar las plantas: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        setPlants(data);
      } catch (err) {
        console.error("Error fetching plants:", err);
        setError(
          "No se pudieron cargar las plantas. Intenta de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, [auth, refreshTrigger]);

  // Eliminar planta con confirmación modal y toast
  const handleDelete = (plantId) => {
    setDeleteId(plantId);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    const plantId = deleteId;
    setModalOpen(false);
    if (!auth || !auth.user) {
      toast.error("Debes iniciar sesión para eliminar una planta.");
      setDeleteId(null);
      return;
    }
    try {
      const token = await auth.user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/plants/${plantId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al eliminar la planta");
      setPlants((prev) => prev.filter((p) => p.id !== plantId));
      toast.success("Planta eliminada correctamente");
    } catch (err) {
      toast.error("No se pudo eliminar la planta. Intenta de nuevo.");
    } finally {
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setModalOpen(false);
    setDeleteId(null);
  };

  const handleEdit = (plant) => {
    setEditPlant(plant);
    setEditModalOpen(true);
  };
  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditPlant(null);
  };
  const handlePlantEdited = () => {
    closeEditModal();
    // Forzar recarga de plantas tras editar
    if (typeof window !== "undefined") {
      const event = new Event("plant-edited");
      window.dispatchEvent(event);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="relative bg-white/70 dark:bg-gray-900/80 backdrop-blur-lg border border-green-200 dark:border-green-700 rounded-2xl shadow-lg overflow-hidden animate-pulse"
          >
            <div className="h-48 w-full bg-gray-300 dark:bg-gray-700"></div>
            <div className="p-5">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-600 bg-red-100 rounded-lg">
        {error}
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Aún no has guardado ninguna planta.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Usa el identificador de plantas para comenzar a agregar plantas a tu
          colección.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {plants.map((plant) => (
        <div
          key={plant.id}
          className="relative bg-white/70 dark:bg-gray-900/80 backdrop-blur-lg border border-green-200 dark:border-green-700 rounded-2xl shadow-2xl hover:shadow-green-600/30 transition-all duration-300 ease-in-out hover:scale-105 hover:-translate-y-1 flex flex-col group overflow-hidden"
        >
          {/* Menú contextual (tres puntos) */}
          <div className="absolute top-3 right-3 z-20">
            <button
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 focus:outline-none"
              onClick={() => setShowActionsId(showActionsId === plant.id ? null : plant.id)}
              aria-label="Mostrar acciones"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="6" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="18" r="1.5" />
              </svg>
            </button>
          </div>
          <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Image
              src={
                plant.photoPath
                  ? `${
                      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                    }/uploads/${plant.photoPath.replace(/^uploads[\\/]/, "")}`
                  : "/default-plant.jpg"
              }
              alt={plant.commonName || plant.sciName || "Planta"}
              fill
              className="rounded-t-2xl object-cover"
              style={{ objectFit: "cover" }}
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            {/* Overlay de acciones solo al hacer clic en el botón de 3 puntos */}
            {showActionsId === plant.id && (
              <div className="absolute inset-0 bg-black/10 dark:bg-black/30 flex items-center justify-center gap-4 transition-opacity z-10">
                <button
                  title="Ver detalles"
                  className="p-2 rounded-lg bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-300 transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                <button
                  title="Editar"
                  className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 transition-all"
                  onClick={() => { handleEdit(plant); setShowActionsId(null); }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                </button>
                <button
                  title="Eliminar"
                  className="p-2 rounded-lg bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 transition-all"
                  onClick={() => { handleDelete(plant.id); setShowActionsId(null); }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-400 mb-1">
              {plant.personalName || plant.commonName || "Mi Planta"}
            </h3>
            <p className="text-sm italic text-gray-800 dark:text-gray-300 mb-2 font-medium">
              {plant.sciName}
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <span className="flex items-center text-sm">
                <span className="mr-2">💧</span>
                Riego: {plant.watering || "No especificado"}
              </span>
              <span className="flex items-center text-sm">
                <span className="mr-2">☀️</span>
                Luz: {plant.light || "No especificado"}
              </span>
            </div>
          </div>
        </div>
      ))}
      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        open={modalOpen}
        title="¿Eliminar planta?"
        description="Esta acción no se puede deshacer. ¿Seguro que quieres eliminar esta planta?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
      {/* Modal de edición de planta */}
      {editModalOpen && editPlant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-md mx-2">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
              Editar planta
            </h2>
            <PlantEditForm
              plant={editPlant}
              onCancel={closeEditModal}
              onPlantEdited={handlePlantEdited}
            />
          </div>
        </div>
      )}
    </div>
  );
}
