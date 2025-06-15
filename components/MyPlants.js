import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';

export default function MyPlants() {
  const { user } = useAuth();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlants = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/plants`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorBody = await response.text();
          console.error('Error response from server:', response.status, errorBody);
          throw new Error(`Error al cargar las plantas: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setPlants(data);
      } catch (err) {
        console.error('Error fetching plants:', err);
        setError('No se pudieron cargar las plantas. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="relative bg-white/70 dark:bg-gray-900/80 backdrop-blur-lg border border-green-200 dark:border-green-700 rounded-2xl shadow-lg overflow-hidden animate-pulse">
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
          Usa el identificador de plantas para comenzar a agregar plantas a tu colección.
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
            <button className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 focus:outline-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>
            </button>
          </div>
          <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Image
              src={plant.photoPath ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/${plant.photoPath.replace(/^uploads[\\/]/, '')}` : "/default-plant.jpg"}
              alt={plant.commonName || plant.sciName || "Planta"}
              fill
              className="rounded-t-2xl object-cover"
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            {/* Overlay de acciones al hover */}
            <div className="absolute inset-0 bg-black/10 dark:bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity z-10">
              <button title="Ver detalles" className="p-2 rounded-lg bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-300 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
              <button title="Editar" className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m0 0v3h3m-3-3h-3v-3m3 3l-6 6" /></svg>
              </button>
              <button title="Eliminar" className="p-2 rounded-lg bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-400 mb-1">
              {plant.personalName || plant.commonName || "Mi Planta"}
            </h3>
            <p className="text-sm italic text-gray-800 dark:text-gray-300 mb-2 font-medium">{plant.sciName}</p>
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
    </div>
  );
}
