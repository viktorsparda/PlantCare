import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "./ConfirmModal";
import PlantEditForm from "./PlantEditForm";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { 
  FiHeart, 
  FiDroplet, 
  FiSun, 
  FiEye, 
  FiEdit3, 
  FiTrash2,
  FiMoreHorizontal 
} from 'react-icons/fi';

export default function MyPlants({ refreshTrigger }) {
  const auth = useAuth();
  const router = useRouter();
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001" || "http://192.168.100.35:3000";
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

  const handleViewDetails = (plantId) => {
    router.push(`/plant/${plantId}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden animate-pulse"
          >
            <div className="flex p-4">
              {/* Avatar circular animado */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-700 border-3 border-gray-200 dark:border-gray-600"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              </div>
              
              {/* Contenido animado */}
              <div className="ml-4 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="w-9 h-9 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                </div>
                
                {/* Información simple animada */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {plants.map((plant) => (
        <div
          key={plant.id}
          className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
          <div className="flex p-4">
            {/* Imagen circular con badge de estado */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-green-200 dark:border-green-700">
                <Image
                  src={
                    plant.photoPath
                      ? `${
                          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                        }/uploads/${plant.photoPath.replace(/^uploads[\\/]/, "")}`
                      : "/default-plant.jpg"
                  }
                  alt={plant.commonName || plant.sciName || "Planta"}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  sizes="80px"
                />
              </div>
              {/* Badge de estado con corazón */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <FiHeart className="w-3 h-3 text-white" />
              </div>
            </div>
            
            {/* Contenido principal */}
            <div className="ml-4 flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                    {plant.personalName || plant.commonName || "Mi Planta"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm italic truncate">
                    {plant.sciName}
                  </p>
                </div>
                
                {/* Botón de menú */}
                <button
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={() => setShowActionsId(showActionsId === plant.id ? null : plant.id)}
                  aria-label="Mostrar acciones"
                >
                  <FiMoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              
              {/* Información de cuidado con iconos simples */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <FiDroplet className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Riego:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {plant.watering ? 
                        plant.watering.charAt(0).toUpperCase() + plant.watering.slice(1).toLowerCase() 
                        : "No especificado"}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <FiSun className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Luz:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {plant.light ? 
                        plant.light.charAt(0).toUpperCase() + plant.light.slice(1).toLowerCase() 
                        : "No especificado"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Overlay de acciones */}
          {showActionsId === plant.id && (
            <div 
              className="absolute inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center gap-3 transition-opacity backdrop-blur-sm rounded-2xl z-20"
              onClick={(e) => {
                // Cerrar si se hace clic en el overlay (no en los botones)
                if (e.target === e.currentTarget) {
                  setShowActionsId(null);
                }
              }}
            >
              <button
                title="Ver detalles"
                className="p-3 rounded-full bg-green-500 hover:bg-green-600 text-white transition-all transform hover:scale-110 shadow-lg"
                onClick={() => handleViewDetails(plant.id)}
              >
                <FiEye className="w-5 h-5" />
              </button>
              <button
                title="Editar"
                className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-all transform hover:scale-110 shadow-lg"
                onClick={() => { handleEdit(plant); setShowActionsId(null); }}
              >
                <FiEdit3 className="w-5 h-5" />
              </button>
              <button
                title="Eliminar"
                className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all transform hover:scale-110 shadow-lg"
                onClick={() => { handleDelete(plant.id); setShowActionsId(null); }}
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>
          )}
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
