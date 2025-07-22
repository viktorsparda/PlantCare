import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Layout from '@/components/Layout';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { usePlantsStore } from '../store/plantsStore';
import { 
  FiImage, 
  FiSearch, 
  FiFilter, 
  FiEye,
  FiCalendar,
  FiUser,
  FiLoader,
  FiUpload,
  FiX,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiMaximize2,
  FiDownload,
  FiStar,
  FiTrash2
} from 'react-icons/fi';

export default function GaleriaPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Estados locales (solo UI)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'recent', 'species'
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Estados para el visor de fotos en pantalla completa
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [viewerPlant, setViewerPlant] = useState(null);
  const [allPhotos, setAllPhotos] = useState([]); // Todas las fotos de la planta (principal + adicionales)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  
  // Estados para eliminación de fotos
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);

  // Zustand store
  const store = usePlantsStore();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      store.loadPlants(user);
    }
  }, [user, authLoading, router]);

  // Helper function para construir URLs de fotos (para compatibilidad)
  const buildPhotoURL = (photoPath) => {
    if (!photoPath) return '/default-plant.jpg';
    if (photoPath.startsWith('http')) return photoPath;
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    if (!photoPath.includes('/') && !photoPath.includes('\\')) {
      return `${apiUrl}/uploads/${photoPath}`;
    }
    const cleanPath = photoPath.replace(/^(uploads[\\/]?|\/)/, '');
    return `${apiUrl}/uploads/${cleanPath}`;
  };

  const filteredPlants = store.plants.filter(plant => {
    const matchesSearch = plant.personalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.commonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.sciName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'recent') {
      const plantDate = new Date(plant.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return matchesSearch && plantDate >= weekAgo;
    }
    
    return matchesSearch;
  });

  const handlePlantClick = (plantId) => {
    router.push(`/plant/${plantId}`);
  };

  const handleAddPhotos = (plant) => {
    setSelectedPlant(plant);
    setShowPhotoModal(true);
  };

  // Función para abrir el visor de fotos
  const openPhotoViewer = (plant, startIndex = 0) => {
    setViewerPlant(plant);
    const allPhotos = store.getAllPhotosForPlant(plant.id);
    setAllPhotos(allPhotos);
    setCurrentPhotoIndex(startIndex);
    setShowPhotoViewer(true);
  };

  const closePhotoViewer = () => {
    setShowPhotoViewer(false);
    setViewerPlant(null);
    setAllPhotos([]);
    setCurrentPhotoIndex(0);
  };

  const navigatePhoto = (direction) => {
    if (direction === 'prev') {
      setCurrentPhotoIndex((prev) => 
        prev > 0 ? prev - 1 : allPhotos.length - 1
      );
    } else {
      setCurrentPhotoIndex((prev) => 
        prev < allPhotos.length - 1 ? prev + 1 : 0
      );
    }
  };

  // Función para cambiar la foto principal - SIMPLIFICADO Y ROBUSTO
  const handleSetAsMainPhoto = async (photoIndex) => {
    try {
      const photoToSetAsMain = allPhotos[photoIndex];
      
      // Validaciones básicas
      if (!photoToSetAsMain) {
        toast.error('Foto no encontrada');
        return;
      }
      
      if (photoToSetAsMain.isMain) {
        return; // Ya es la principal
      }

      // Verificar que sea una foto adicional real
      const photoId = String(photoToSetAsMain.id || '');
      if (photoId.startsWith('main-') || photoId.startsWith('additional-')) {
        toast.error('No se puede cambiar esta foto como principal');
        return;
      }

      const loadingToast = toast.loading('Cambiando foto principal...');
      
      // Usar Zustand store - SIN optimistic update
      const result = await store.setAsMainPhoto(user, viewerPlant.id, photoToSetAsMain.id);
      
      if (result.success) {
        // Actualizar el visor con los nuevos datos desde el store
        const updatedAllPhotos = store.getAllPhotosForPlant(viewerPlant.id);
        setAllPhotos(updatedAllPhotos);
        setCurrentPhotoIndex(0); // Ir a la nueva foto principal
        
        // Actualizar viewerPlant con datos actualizados
        const updatedPlant = store.plants.find(p => p.id === viewerPlant.id);
        if (updatedPlant) {
          setViewerPlant(updatedPlant);
        }
        
        toast.success('¡Foto principal actualizada correctamente!', { id: loadingToast });
      } else {
        toast.error(result.error || 'Error al cambiar la foto principal', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error setting main photo:', error);
      toast.error('Error al cambiar la foto principal');
    }
  };

  // Función para eliminar foto - SIMPLIFICADO
  const handleDeletePhoto = async () => {
    if (!viewerPlant || !allPhotos[currentPhotoIndex]) return;
    
    const currentPhoto = allPhotos[currentPhotoIndex];
    
    // No permitir eliminar la foto principal
    if (currentPhoto.isMain) {
      toast.error('No se puede eliminar la foto principal');
      setShowDeleteModal(false);
      return;
    }
    
    // Verificar que la foto tenga un ID válido
    const photoId = String(currentPhoto.id || '');
    if (photoId.startsWith('main-') || photoId.startsWith('additional-')) {
      toast.error('No se puede eliminar esta foto');
      setShowDeleteModal(false);
      return;
    }

    setDeletingPhoto(true);
    const loadingToast = toast.loading('Eliminando foto...');
    
    try {
      // Usar Zustand store - SIN optimistic update
      const result = await store.deletePhoto(user, viewerPlant.id, currentPhoto.id);
      
      if (result.success) {
        toast.success('Foto eliminada exitosamente', { id: loadingToast });
        
        // Actualizar el visor con datos del store
        const updatedPhotos = store.getAllPhotosForPlant(viewerPlant.id);
        setAllPhotos(updatedPhotos);
        
        // Ajustar el índice si es necesario
        if (currentPhotoIndex >= updatedPhotos.length) {
          setCurrentPhotoIndex(Math.max(0, updatedPhotos.length - 1));
        }
        
        // Si no quedan fotos adicionales, cerrar el visor
        if (updatedPhotos.length <= 1) {
          closePhotoViewer();
        }
        
        setShowDeleteModal(false);
      } else {
        toast.error(result.error || 'Error al eliminar la foto', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Error al eliminar la foto', { id: loadingToast });
    } finally {
      setDeletingPhoto(false);
    }
  };

  // Controles de teclado para el visor
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!showPhotoViewer) return;
      
      switch (e.key) {
        case 'Escape':
          closePhotoViewer();
          break;
        case 'ArrowLeft':
          navigatePhoto('prev');
          break;
        case 'ArrowRight':
          navigatePhoto('next');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showPhotoViewer, allPhotos.length]);

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingPhoto(true);
    const loadingToast = toast.loading(`Subiendo ${files.length} foto(s)...`);

    try {
      // Usar Zustand store
      const result = await store.addPhotos(user, selectedPlant.id, files);
      
      if (result.success) {
        toast.success(
          `¡${files.length} foto(s) subida(s) exitosamente!`,
          { id: loadingToast }
        );
        setShowPhotoModal(false);
      } else {
        toast.error(
          `Error al subir las fotos: ${result.error}`,
          { id: loadingToast }
        );
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error(
        `Error al subir las fotos: ${error.message}`,
        { id: loadingToast }
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (authLoading || store.loading) {
    return (
      <Layout pageTitle="Galería">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FiLoader className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Cargando galería...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (store.error) {
    return (
      <Layout pageTitle="Galería">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error al cargar la galería
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{store.error}</p>
            <button
              onClick={() => store.loadPlants(user)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Galería">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <FiImage /> Galería de Plantas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explora visualmente toda tu colección de plantas
          </p>
        </div>

        {/* Controles */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar plantas por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-500" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Todas</option>
              <option value="recent">Recientes (7 días)</option>
            </select>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <FiImage className="text-green-500 text-xl mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{store.plants.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <FiEye className="text-blue-500 text-xl mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mostrando</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{filteredPlants.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <FiCalendar className="text-purple-500 text-xl mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Esta semana</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {store.plants.filter(plant => {
                    const plantDate = new Date(plant.date);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return plantDate >= weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <FiUser className="text-orange-500 text-xl mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Especies</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {new Set(store.plants.map(p => p.sciName)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Galería */}
        {filteredPlants.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌱</div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              {searchTerm ? 'No se encontraron plantas' : 'Tu galería está vacía'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm 
                ? `No hay plantas que coincidan con "${searchTerm}"`
                : 'Agrega plantas usando el identificador para ver tu galería'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Agregar primera planta
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredPlants.map((plant) => (
              <div
                key={plant.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl border border-gray-200 dark:border-gray-700"
              >
                {/* Grid de miniaturas de fotos */}
                <div className="relative aspect-square">
                  {(() => {
                    const allPhotos = store.getAllPhotosForPlant(plant.id);
                    
                    if (allPhotos.length === 1) {
                      // Solo foto principal - mostrar como antes
                      return (
                        <>
                          <Image
                            src={allPhotos[0].photoURL}
                            alt={plant.personalName}
                            layout="fill"
                            objectFit="cover"
                            className="transition-transform duration-300"
                          />
                          {/* Indicador de una sola foto */}
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <FiImage className="w-3 h-3" />
                            <span>1</span>
                          </div>
                        </>
                      );
                    } else {
                      // Múltiples fotos - mostrar grid de miniaturas
                      return (
                        <>
                          <div className="grid grid-cols-2 gap-1 h-full p-1">
                            {allPhotos.slice(0, 4).map((photo, index) => (
                              <div 
                                key={photo.id}
                                className="relative overflow-hidden rounded-lg cursor-pointer group hover:scale-105 transition-transform duration-200"
                                onClick={() => openPhotoViewer(plant, index)}
                              >
                                <img
                                  src={photo.photoURL}
                                  alt={`Miniatura ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {/* Overlay hover */}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <FiImage className="w-4 h-4 text-white" />
                                </div>
                                {/* Indicador de foto principal */}
                                {photo.isMain && (
                                  <div className="absolute top-1 right-1 bg-yellow-500 rounded-full p-1">
                                    <FiStar className="w-2 h-2 text-white" fill="currentColor" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {/* Indicador de total de fotos */}
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <FiImage className="w-3 h-3" />
                            <span>{allPhotos.length}</span>
                          </div>
                          
                          {/* Si hay más de 4 fotos, mostrar contador en la esquina inferior derecha */}
                          {allPhotos.length > 4 && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium">
                              +{allPhotos.length - 4}
                            </div>
                          )}
                        </>
                      );
                    }
                  })()}
                  
                  {/* Overlay con botones de acción en la parte inferior */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2">
                    <div className="flex gap-1 sm:gap-1.5 justify-center">
                      {/* Botón Ver Detalles - Estilo primario */}
                      <button
                        onClick={() => handlePlantClick(plant.id)}
                        className="flex-1 bg-white/95 hover:bg-white text-gray-900 px-1 sm:px-2 py-1.5 rounded-md text-xs font-medium transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1 sm:gap-1.5 shadow-lg"
                        aria-label="Ver detalles completos de la planta"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Info</span>
                      </button>
                      
                      {/* Botón Ver Galería - Estilo secundario */}
                      <button
                        onClick={() => openPhotoViewer(plant, 0)}
                        className="flex-1 bg-blue-600/90 hover:bg-blue-600 text-white px-1 sm:px-2 py-1.5 rounded-md text-xs font-medium transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1 sm:gap-1.5 shadow-lg"
                        aria-label="Ver galería de fotos"
                      >
                        <FiMaximize2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Fotos</span>
                      </button>
                      
                      {/* Botón agregar fotos - Mismo tamaño que los otros */}
                      <button
                        onClick={() => handleAddPhotos(plant)}
                        className="flex-1 bg-green-600/90 hover:bg-green-600 text-white px-1 sm:px-2 py-1.5 rounded-md text-xs font-medium transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1 sm:gap-1.5 shadow-lg"
                        aria-label="Agregar más fotos a esta planta"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">+</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info - Simplificada */}
                <div className="p-3">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate mb-1">
                    {plant.personalName}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(plant.date).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {plant.watering || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal para subir fotos adicionales */}
        {showPhotoModal && selectedPlant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiImage /> Agregar Fotos
                </h2>
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={selectedPlant.photoPath 
                        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads/${selectedPlant.photoPath.replace(/^uploads[\\/]/, '')}` 
                        : '/default-plant.jpg'
                      }
                      alt={selectedPlant.personalName}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {selectedPlant.personalName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedPlant.commonName || selectedPlant.sciName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Selecciona las fotos que deseas agregar
                </label>
                
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-green-400 dark:hover:border-green-500 transition-colors">
                  <input
                    type="file"
                    id="photo-upload"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    className="hidden"
                  />
                  <label
                    htmlFor="photo-upload"
                    className={`cursor-pointer flex flex-col items-center ${uploadingPhoto ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    {uploadingPhoto ? (
                      <FiLoader className="w-12 h-12 text-green-500 animate-spin mb-3" />
                    ) : (
                      <FiUpload className="w-12 h-12 text-gray-400 mb-3" />
                    )}
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      {uploadingPhoto ? 'Subiendo fotos...' : 'Haz clic para seleccionar fotos'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Puedes seleccionar múltiples imágenes
                    </p>
                  </label>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                💡 <strong>Tip:</strong> Las fotos se agregarán a tu galería personal de esta planta. 
                Podrás verlas todas en los detalles de la planta y crear un registro visual de su crecimiento.
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPhotoModal(false)}
                  disabled={uploadingPhoto}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => document.getElementById('photo-upload').click()}
                  disabled={uploadingPhoto}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Seleccionar Fotos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visor de Fotos en Pantalla Completa */}
        {showPhotoViewer && viewerPlant && allPhotos.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
            {/* Header del visor */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h2 className="text-xl font-bold">{viewerPlant.personalName}</h2>
                  <p className="text-sm text-gray-300">
                    {currentPhotoIndex + 1} de {allPhotos.length} fotos
                  </p>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Botón para cambiar foto principal */}
                  <button
                    onClick={() => handleSetAsMainPhoto(currentPhotoIndex)}
                    className={`p-2 sm:p-2 rounded-full transition-all hover:scale-110 active:scale-95 touch-manipulation ${
                      allPhotos[currentPhotoIndex].isMain
                        ? 'text-yellow-400 hover:text-yellow-300'
                        : 'text-gray-400 hover:text-yellow-400'
                    }`}
                    title={allPhotos[currentPhotoIndex].isMain ? 'Esta es la foto principal' : 'Hacer foto principal'}
                    aria-label={allPhotos[currentPhotoIndex].isMain ? 'Esta es la foto principal' : 'Hacer foto principal'}
                  >
                    <FiStar 
                      className="w-4 h-4 sm:w-5 sm:h-5" 
                      fill={allPhotos[currentPhotoIndex].isMain ? 'currentColor' : 'none'} 
                    />
                  </button>
                  
                  {/* Botón de eliminar foto */}
                  {!allPhotos[currentPhotoIndex].isMain && (
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      disabled={deletingPhoto}
                      className={`text-red-400 hover:text-red-300 active:text-red-500 p-2 rounded-lg bg-black/20 hover:bg-black/40 active:bg-black/60 transition-all touch-manipulation ${
                        deletingPhoto ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Eliminar foto"
                      aria-label="Eliminar foto"
                    >
                      {deletingPhoto ? (
                        <FiLoader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      ) : (
                        <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  )}
                  
                  {/* Botón de descarga */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const currentPhoto = allPhotos[currentPhotoIndex];
                      
                      // Crear un elemento temporal para forzar la descarga
                      fetch(currentPhoto.photoURL)
                        .then(response => response.blob())
                        .then(blob => {
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `${viewerPlant.personalName}-${currentPhotoIndex + 1}.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        })
                        .catch(error => {
                          console.error('Error downloading photo:', error);
                          toast.error('Error al descargar la foto');
                        });
                    }}
                    className="text-white hover:text-gray-300 active:text-gray-400 p-2 rounded-lg bg-black/20 hover:bg-black/40 active:bg-black/60 transition-all touch-manipulation"
                    title="Descargar foto"
                    aria-label="Descargar foto"
                  >
                    <FiDownload className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  
                  <button
                    onClick={closePhotoViewer}
                    className="text-white hover:text-gray-300 active:text-gray-400 p-2 rounded-lg bg-black/20 hover:bg-black/40 active:bg-black/60 transition-all touch-manipulation"
                    title="Cerrar"
                    aria-label="Cerrar visor"
                  >
                    <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido principal - Imagen */}
            <div className="flex-1 flex items-center justify-center relative min-h-0 pt-16 pb-20">
              {loadingPhotos ? (
                <div className="text-center text-white">
                  <FiLoader className="w-12 h-12 animate-spin mx-auto mb-4" />
                  <p>Cargando fotos...</p>
                </div>
              ) : (
                <>
                  {/* Imagen principal */}
                  <div className="relative w-full h-full flex items-center justify-center px-16">
                    <div className="relative max-w-full max-h-full flex items-center justify-center">
                      <img
                        src={allPhotos[currentPhotoIndex].photoURL}
                        alt={allPhotos[currentPhotoIndex].description || `Foto ${currentPhotoIndex + 1}`}
                        className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl photo-viewer"
                        style={{ 
                          maxWidth: '90vw', 
                          maxHeight: '70vh',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  </div>

                  {/* Controles de navegación - Mejorados para móviles */}
                  {allPhotos.length > 1 && (
                    <>
                      <button
                        onClick={() => navigatePhoto('prev')}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white bg-black/70 hover:bg-black/90 active:bg-black p-2 sm:p-3 rounded-full transition-all z-10 touch-manipulation"
                        title="Foto anterior"
                        aria-label="Foto anterior"
                      >
                        <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                      <button
                        onClick={() => navigatePhoto('next')}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white bg-black/70 hover:bg-black/90 active:bg-black p-2 sm:p-3 rounded-full transition-all z-10 touch-manipulation"
                        title="Foto siguiente"
                        aria-label="Foto siguiente"
                      >
                        <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Miniaturas en la parte inferior - Mejoradas para móviles */}
            {allPhotos.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-24 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
                <div className="flex items-end justify-center h-full px-2 sm:px-4 pb-2 sm:pb-4">
                  <div className="flex gap-2 sm:gap-3 overflow-x-auto max-w-full thumbnail-container py-2 px-2" style={{ scrollbarWidth: 'none' }}>
                    {allPhotos.map((photo, index) => (
                      <button
                        key={photo.id}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation ${
                          index === currentPhotoIndex 
                            ? 'border-white shadow-xl scale-110 z-10' 
                            : 'border-gray-500 hover:border-gray-300 opacity-70 hover:opacity-100'
                        }`}
                        title={`Foto ${index + 1}${photo.isMain ? ' (Principal)' : ''}`}
                        aria-label={`Ver foto ${index + 1}${photo.isMain ? ' (Principal)' : ''}`}
                      >
                        <img
                          src={photo.photoURL}
                          alt={`Miniatura ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Indicador de foto actual */}
                        {index === currentPhotoIndex && (
                          <div className="absolute inset-0 bg-white/10 border-2 border-white rounded-lg"></div>
                        )}
                        {/* Indicador de foto principal */}
                        {photo.isMain && (
                          <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 text-yellow-400">
                            <FiStar className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal de confirmación para eliminar foto */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mr-4">
                    <FiTrash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      ¿Eliminar foto?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Esta acción no se puede deshacer
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  ¿Estás seguro de que deseas eliminar esta foto de <strong>{viewerPlant?.personalName}</strong>? 
                  La foto se eliminará permanentemente de tu galería.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deletingPhoto}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeletePhoto}
                    disabled={deletingPhoto}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deletingPhoto ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <FiTrash2 className="w-4 h-4" />
                        Eliminar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
