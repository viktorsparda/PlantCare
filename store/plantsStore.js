import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Helper function para construir URLs de fotos
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

export const usePlantsStore = create(
  subscribeWithSelector((set, get) => ({
    // Estado
    plants: [],
    plantsAdditionalPhotos: {},
    loading: false,
    error: null,
    
    // Estados específicos para operaciones
    uploadingPhotos: false,
    deletingPhoto: false,
    settingMainPhoto: false,

    // Acciones para cargar datos
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setUploadingPhotos: (uploading) => set({ uploadingPhotos: uploading }),
    setDeletingPhoto: (deleting) => set({ deletingPhoto: deleting }),
    setSettingMainPhoto: (setting) => set({ settingMainPhoto: setting }),
    
    // Cargar plantas desde el servidor
    loadPlants: async (user) => {
      try {
        set({ loading: true, error: null });
        
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        
        const response = await fetch(`${apiUrl}/plants`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const plants = await response.json();
          
          // Cargar fotos adicionales para cada planta
          const photosData = {};
          await Promise.all(plants.map(async (plant) => {
            try {
              const photosResponse = await fetch(`${apiUrl}/plants/${plant.id}/photos`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              if (photosResponse.ok) {
                const additionalPhotos = await photosResponse.json();
                const photosWithCorrectURLs = additionalPhotos.map(photo => ({
                  ...photo,
                  photoURL: buildPhotoURL(photo.photoPath || photo.photoURL)
                }));
                
                photosData[plant.id] = photosWithCorrectURLs;
              } else {
                photosData[plant.id] = [];
              }
            } catch (err) {
              console.error(`Error loading photos for plant ${plant.id}:`, err);
              photosData[plant.id] = [];
            }
          }));
          
          set({ 
            plants, 
            plantsAdditionalPhotos: photosData, 
            loading: false 
          });
        } else {
          throw new Error('Error al cargar las plantas');
        }
      } catch (err) {
        console.error('Error loading plants:', err);
        set({ 
          error: 'No se pudieron cargar las plantas', 
          loading: false 
        });
      }
    },

    // Obtener todas las fotos de una planta (principal + adicionales)
    getAllPhotosForPlant: (plantId) => {
      const state = get();
      const plant = state.plants.find(p => p.id === plantId);
      
      if (!plant) return [];
      
      const mainPhoto = {
        id: `main-${plant.id}`,
        photoURL: buildPhotoURL(plant.photoPath),
        description: plant.personalName,
        uploadDate: plant.date || new Date().toISOString(),
        isMain: true
      };

      const additionalPhotos = state.plantsAdditionalPhotos[plant.id] || [];
      return [mainPhoto, ...additionalPhotos];
    },

    // Cambiar foto principal - MEJORADO según mejores prácticas de Zustand
    setAsMainPhoto: async (user, plantId, photoId) => {
      const { plants, getAllPhotosForPlant } = get();
      
      try {
        // Validaciones optimistas
        const plant = plants.find(p => p.id === plantId);
        const allPhotos = getAllPhotosForPlant(plantId);
        const photoToSetAsMain = allPhotos.find(photo => photo.id === photoId);
        
        if (!plant || !photoToSetAsMain || photoToSetAsMain.isMain) {
          return { success: false, error: 'Foto no válida' };
        }

        // Indicar que estamos procesando
        set({ settingMainPhoto: true, error: null });

        // Llamada al servidor
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        
        const response = await fetch(`${apiUrl}/plants/${plantId}/set-main-photo`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ photoId }),
        });

        if (response.ok) {
          // Recargar datos completamente desde el servidor
          await get().loadPlants(user);
          set({ settingMainPhoto: false });
          return { success: true };
        } else {
          const errorData = await response.json();
          const errorMsg = errorData.error || 'Error del servidor';
          set({ settingMainPhoto: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      } catch (error) {
        console.error('Error in setAsMainPhoto:', error);
        const errorMsg = 'Error de conexión';
        set({ settingMainPhoto: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }
    },

    // Eliminar foto adicional - MEJORADO según mejores prácticas de Zustand
    deletePhoto: async (user, plantId, photoId) => {
      try {
        // Indicar que estamos procesando
        set({ deletingPhoto: true, error: null });

        // Llamada al servidor
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        
        const response = await fetch(`${apiUrl}/plants/${plantId}/photos/${photoId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          // Recargar datos desde el servidor
          await get().loadPlants(user);
          set({ deletingPhoto: false });
          return { success: true };
        } else {
          const errorData = await response.json();
          const errorMsg = errorData.error || 'Error del servidor';
          set({ deletingPhoto: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      } catch (error) {
        console.error('Error in deletePhoto:', error);
        const errorMsg = 'Error de conexión';
        set({ deletingPhoto: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }
    },

    // Agregar fotos adicionales - MEJORADO según mejores prácticas de Zustand
    addPhotos: async (user, plantId, photos) => {
      try {
        // Indicar que estamos procesando
        set({ uploadingPhotos: true, error: null });
        
        // Llamada al servidor
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        
        const uploadPromises = photos.map(async (file) => {
          const formData = new FormData();
          formData.append('photo', file);
          formData.append('plantId', plantId);
          formData.append('description', `Foto adicional`);

          const response = await fetch(`${apiUrl}/plants/${plantId}/photos`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error ${response.status}`);
          }

          return await response.json();
        });

        await Promise.all(uploadPromises);
        
        // Recargar datos después de subir
        await get().loadPlants(user);
        set({ uploadingPhotos: false });
        
        return { success: true };
      } catch (error) {
        const errorMsg = error.message || 'Error al subir fotos';
        set({ uploadingPhotos: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }
    },

    // Utilidades del store
    resetError: () => set({ error: null }),
    
    // Selectores derivados (mejores prácticas de Zustand)
    getPlantById: (plantId) => {
      const { plants } = get();
      return plants.find(p => p.id === plantId);
    },
    
    isLoading: () => {
      const { loading, uploadingPhotos, deletingPhoto, settingMainPhoto } = get();
      return loading || uploadingPhotos || deletingPhoto || settingMainPhoto;
    }
  }))
);
