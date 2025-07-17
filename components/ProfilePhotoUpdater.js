import React, { useState, useRef } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

export default function ProfilePhotoUpdater({ user, onUpdate, className = "" }) {
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    setLoading(true);

    try {
      // Crear FormData para enviar la imagen
      const formData = new FormData();
      formData.append('profilePhoto', file);

      // Obtener token de autenticación
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      // Subir imagen al backend
      const response = await fetch(`${apiUrl}/upload-profile-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Error al subir la imagen`);
      }

      const data = await response.json();
      const photoURL = data.photoURL;

      // Actualizar perfil en Firebase
      await updateProfile(user, { photoURL });

      // Notificar al componente padre
      if (onUpdate) {
        onUpdate(photoURL);
      }

      // Toast de éxito personalizado
      toast.success(
        (t) => (
          <div>
            <p className="font-medium">¡Foto actualizada!</p>
            <p className="text-sm opacity-90">Tu foto de perfil se ha cambiado exitosamente</p>
          </div>
        ),
        {
          duration: 4000,
        }
      );

    } catch (error) {
      console.error('Error updating profile photo:', error);
      
      // Mensaje de error más específico
      let errorMessage = 'Error al actualizar la foto de perfil';
      let errorDetail = '';
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Error de conexión';
        errorDetail = 'Verifica que el servidor esté funcionando';
      } else if (error.message.includes('413')) {
        errorMessage = 'Imagen muy grande';
        errorDetail = 'Intenta con una imagen más pequeña';
      } else if (error.message.includes('415')) {
        errorMessage = 'Formato no soportado';
        errorDetail = 'Usa JPG, PNG o GIF';
      } else {
        errorDetail = error.message;
      }
      
      // Toast de error personalizado
      toast.error(
        (t) => (
          <div>
            <p className="font-medium">{errorMessage}</p>
            {errorDetail && <p className="text-sm opacity-90">{errorDetail}</p>}
          </div>
        ),
        {
          duration: 6000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Área de drop y click */}
      <div
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`absolute inset-0 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 ${
          dragOver 
            ? 'bg-black/60' 
            : 'bg-black/0 group-hover:bg-black/40'
        }`}
      >
        {/* Icono de cámara */}
        <div className={`transition-all duration-200 ${
          dragOver || loading
            ? 'opacity-100 scale-110' 
            : 'opacity-0 group-hover:opacity-100 group-hover:scale-105'
        }`}>
          {loading ? (
            <div className="flex flex-col items-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
              <span className="text-xs mt-1 font-medium">Subiendo...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-white drop-shadow-lg">
              <div className="bg-black/20 rounded-full p-2 backdrop-blur-sm">
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
              </div>
              <span className="text-xs mt-1 font-medium">
                {dragOver ? 'Suelta aquí' : 'Cambiar'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tooltip */}
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        📸 Haz clic o arrastra una imagen para cambiar
      </div>
    </div>
  );
}
