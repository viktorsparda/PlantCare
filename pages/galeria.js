import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Layout from '@/components/Layout';
import Image from 'next/image';
import toast from 'react-hot-toast';
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
  FiStar
} from 'react-icons/fi';

export default function GaleriaPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadPlants();
    }
  }, [user, authLoading, router]);

  const loadPlants = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      const response = await fetch(`${apiUrl}/plants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPlants(data);
      } else {
        throw new Error('Error al cargar las plantas');
      }
    } catch (err) {
      console.error('Error loading plants:', err);
      setError('No se pudieron cargar las plantas');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlants = plants.filter(plant => {
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
  const openPhotoViewer = async (plant, startIndex = 0) => {
    setLoadingPhotos(true);
    setViewerPlant(plant);
    
    try {
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      // Función helper para construir URLs correctamente
      const buildPhotoURL = (photoPath) => {
        if (!photoPath) return '/default-plant.jpg';
        
        // Si ya es una URL completa, usarla tal como está
        if (photoPath.startsWith('http')) {
          return photoPath;
        }
        
        // Normalizar la ruta removiendo prefijos redundantes
        const cleanPath = photoPath.replace(/^(uploads[\\/]?|\/)/, '');
        return `${apiUrl}/uploads/${cleanPath}`;
      };
      
      // Cargar fotos adicionales
      const response = await fetch(`${apiUrl}/plants/${plant.id}/photos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const additionalPhotosData = response.ok ? await response.json() : [];
      
      const additionalPhotos = additionalPhotosData.map(photo => ({
        ...photo,
        photoURL: buildPhotoURL(photo.photoURL)
      }));
      
      // Combinar foto principal con fotos adicionales
      const mainPhoto = {
        id: `main-${plant.id}`,
        photoURL: buildPhotoURL(plant.photoPath),
        description: plant.personalName,
        uploadDate: plant.date || new Date().toISOString(),
        isMain: true
      };

      const allPhotos = [mainPhoto, ...additionalPhotos];
      setAllPhotos(allPhotos);
      setCurrentPhotoIndex(startIndex);
      setShowPhotoViewer(true);
    } catch (error) {
      console.error('Error loading photos:', error);
      toast.error('Error al cargar las fotos');
    } finally {
      setLoadingPhotos(false);
    }
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

  // Función para cambiar la foto principal
  const setAsMainPhoto = async (photoIndex) => {
    try {
      const photoToSetAsMain = allPhotos[photoIndex];
      
      // Validar que la foto existe
      if (!photoToSetAsMain) {
        toast.error('Foto no encontrada');
        return;
      }
      
      // Solo permitir cambiar fotos adicionales como principales (no la que ya es principal)
      if (photoToSetAsMain.isMain) {
        return; // No hacer nada si ya es la principal
      }

      // Verificar que sea una foto adicional real (no una foto principal convertida)
      const photoId = String(photoToSetAsMain.id || '');
      if (photoId.startsWith('main-') || photoId.startsWith('additional-')) {
        toast.error('No se puede cambiar esta foto como principal');
        return;
      }

      const loadingToast = toast.loading('Cambiando foto principal...');
      
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      // Función helper para construir URLs correctamente
      const buildPhotoURL = (photoPath) => {
        if (!photoPath) return '/default-plant.jpg';
        if (photoPath.startsWith('http')) return photoPath;
        const cleanPath = photoPath.replace(/^(uploads[\\/]?|\/)/, '');
        return `${apiUrl}/uploads/${cleanPath}`;
      };
      
      // Usar el endpoint que intercambia las fotos
      const response = await fetch(`${apiUrl}/plants/${viewerPlant.id}/set-main-photo`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          photoId: photoToSetAsMain.id 
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Foto principal actualizada exitosamente', { id: loadingToast });
        
        // Recargar todas las fotos desde el servidor para asegurar consistencia
        try {
          // Cargar fotos adicionales actualizadas
          const photosResponse = await fetch(`${apiUrl}/plants/${viewerPlant.id}/photos`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          const additionalPhotosData = photosResponse.ok ? await photosResponse.json() : [];
          
          const additionalPhotos = additionalPhotosData.map(photo => ({
            ...photo,
            photoURL: buildPhotoURL(photo.photoPath)
          }));
          
          // Crear nueva foto principal con los datos actualizados
          const mainPhoto = {
            id: `main-${viewerPlant.id}`,
            photoURL: buildPhotoURL(result.newMainPhoto),
            description: viewerPlant.personalName,
            uploadDate: viewerPlant.date || new Date().toISOString(),
            isMain: true
          };

          // Combinar todas las fotos actualizadas
          const allPhotosUpdated = [mainPhoto, ...additionalPhotos];
          
          // Actualizar estados
          setAllPhotos(allPhotosUpdated);
          setCurrentPhotoIndex(0); // Ir a la nueva foto principal
          
          // Actualizar el estado de plantas para la galería
          setPlants(prevPlants => 
            prevPlants.map(plant => 
              plant.id === viewerPlant.id 
                ? { ...plant, photoPath: result.newMainPhoto }
                : plant
            )
          );
          
          // Actualizar viewerPlant
          setViewerPlant(prev => ({ 
            ...prev, 
            photoPath: result.newMainPhoto
          }));
          
        } catch (reloadError) {
          console.error('Error reloading photos after main photo change:', reloadError);
          // Si falla la recarga, cerrar el visor y recargar plantas
          toast.info('Foto principal cambiada. Recargando galería...');
          closePhotoViewer();
          await loadPlants();
        }
        
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la foto principal');
      }
    } catch (error) {
      console.error('Error setting main photo:', error);
      toast.error('Error al cambiar la foto principal');
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
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      console.log('API URL:', apiUrl);
      console.log('Plant ID:', selectedPlant.id);
      console.log('Files to upload:', files.length);
      
      const uploadPromises = files.map(async (file) => {
        console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('plantId', selectedPlant.id);
        formData.append('description', `Foto adicional de ${selectedPlant.personalName}`);

        const response = await fetch(`${apiUrl}/plants/${selectedPlant.id}/photos`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });

        console.log('Response status:', response.status, 'Status text:', response.statusText);

        if (!response.ok) {
          let errorMessage = `Error ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (jsonError) {
            // Si no es JSON válido, usar el status text
            console.error('Response is not valid JSON:', jsonError);
          }
          throw new Error(errorMessage);
        }

        return await response.json();
      });

      await Promise.all(uploadPromises);
      
      toast.success(
        `¡${files.length} foto(s) subida(s) exitosamente!`,
        { id: loadingToast }
      );

      // Recargar plantas para mostrar las nuevas fotos
      await loadPlants();
      setShowPhotoModal(false);
      
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

  if (authLoading || loading) {
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

  if (error) {
    return (
      <Layout pageTitle="Galería">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error al cargar la galería
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
            <button
              onClick={loadPlants}
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
                <p className="text-xl font-bold text-gray-900 dark:text-white">{plants.length}</p>
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
                  {plants.filter(plant => {
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
                  {new Set(plants.map(p => p.sciName)).size}
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
                {/* Imagen */}
                <div className="relative aspect-square">
                  <Image
                    src={plant.photoPath 
                      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads/${plant.photoPath.replace(/^uploads[\\/]/, '')}` 
                      : '/default-plant.jpg'
                    }
                    alt={plant.personalName}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300"
                  />
                  
                  {/* Indicador de múltiples fotos en la esquina superior derecha */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <FiImage className="w-3 h-3" />
                    <span>1+</span>
                  </div>
                  
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
                    onClick={() => setAsMainPhoto(currentPhotoIndex)}
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
      </div>
    </Layout>
  );
}
