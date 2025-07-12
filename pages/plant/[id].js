import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';
import Layout from '../../components/Layout';

// Componentes para las secciones
const PlantInfo = ({ plant }) => (
  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg p-6">
    <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-4">Información de tu Planta</h2>
    <p><strong className="font-semibold">Apodo:</strong> {plant.personalName}</p>
    <p><strong className="font-semibold">Especie:</strong> {plant.commonName || plant.sciName}</p>
    {/* Otros detalles de la planta */}
  </div>
);

const SpeciesInfo = ({ speciesDetails, isLoading }) => (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-4">Detalles de la Especie</h2>
      {isLoading ? (
        <p>Cargando detalles de la especie...</p>
      ) : speciesDetails ? (
        <div>
          <p><strong className="font-semibold">Familia:</strong> {speciesDetails.family || 'No disponible'}</p>
          <p><strong className="font-semibold">Género:</strong> {speciesDetails.genus || 'No disponible'}</p>
          <p><strong className="font-semibold">Ciclo de vida:</strong> {speciesDetails.cycle || 'No disponible'}</p>
        </div>
      ) : (
        <p>No hay información de la especie disponible.</p>
      )}
    </div>
);


const CareRecommendations = ({ careInfo, isLoading }) => (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-4">Recomendaciones de Cuidado</h2>
       {isLoading ? (
        <p>Cargando recomendaciones...</p>
      ) : careInfo ? (
        <ul>
          {/* Adaptado para Trefle (growth) y Perenual (care-guides) */}
          <li><strong className="font-semibold">Riego:</strong> {careInfo.watering || careInfo?.watering_general_benchmark?.value || 'No especificado'}</li>
          <li><strong className="font-semibold">Luz solar:</strong> {Array.isArray(careInfo.sunlight) ? careInfo.sunlight.join(', ') : careInfo.sunlight || 'No especificado'}</li>
        </ul>
      ) : (
        <p>No hay recomendaciones de cuidado específicas.</p>
      )}
    </div>
);

const Reminders = ({ plantId }) => {
  // Lógica para los recordatorios
  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-4">Recordatorios</h2>
      <p>Aquí podrás configurar recordatorios para el cuidado de tu planta.</p>
      {/* Formulario para añadir recordatorios y lista de recordatorios */}
    </div>
  );
};


export default function PlantDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [plant, setPlant] = useState(null);
  const [speciesAndCareInfo, setSpeciesAndCareInfo] = useState(null);
  const [loadingPlant, setLoadingPlant] = useState(true);
  const [loadingSpecies, setLoadingSpecies] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState(null);

  useEffect(() => {
    if (!id || !user) return;

    const fetchPlant = async () => {
      try {
        setLoadingPlant(true);
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/plants/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('No se pudo cargar la información de la planta.');
        }

        const data = await response.json();
        setPlant(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingPlant(false);
      }
    };

    fetchPlant();
  }, [id, user]);

  useEffect(() => {
    if (!plant || !user) return;

    const fetchSpeciesAndCareInfo = async () => {
      setLoadingSpecies(true);
      try {
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/species-info/${plant.sciName}/${plant.commonName}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          // No lanzar un error fatal, solo registrarlo y dejar la UI mostrar que no hay datos.
          console.error('No se pudo obtener la información de la especie y cuidado.');
          setSpeciesAndCareInfo(null); // Asegurarse de que no hay datos viejos
          return;
        }
        const data = await response.json();
        setSpeciesAndCareInfo(data.data);
        setDataSource(data.source);
      } catch (error) {
        console.error(error);
        setSpeciesAndCareInfo(null);
      } finally {
        setLoadingSpecies(false);
      }
    };

    fetchSpeciesAndCareInfo();
  }, [plant, user]);


  if (loadingPlant) {
    return <Layout><div className="text-center p-10">Cargando tu planta...</div></Layout>;
  }

  if (error) {
    return <Layout><div className="text-center p-10 text-red-500">{error}</div></Layout>;
  }

  if (!plant) {
    return <Layout><div className="text-center p-10">Planta no encontrada.</div></Layout>;
  }
  
  const careInfo = speciesAndCareInfo?.growth || speciesAndCareInfo;

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Columna Izquierda: Imagen y Nombre */}
          <div className="lg:w-1/3">
            <div className="relative aspect-square rounded-2xl shadow-2xl overflow-hidden">
              <Image
                src={plant.photoPath ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/${plant.photoPath.replace(/^uploads[\\/]/, '')}` : '/default-plant.jpg'}
                alt={plant.personalName}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-500 hover:scale-110"
              />
            </div>
            <h1 className="text-4xl font-extrabold text-center mt-6 text-gray-800 dark:text-white">{plant.personalName}</h1>
            <p className="text-xl text-center text-gray-600 dark:text-gray-300 italic">{plant.commonName || plant.sciName}</p>
            {/* Quitar la línea de fuente de datos */}
            {/* {dataSource && (
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                Datos de especie de: {dataSource}
              </p>
            )} */}
          </div>

          {/* Columna Derecha: Información y Acciones */}
          <div className="lg:w-2/3 space-y-8">
            <PlantInfo plant={plant} />
            <SpeciesInfo speciesDetails={speciesAndCareInfo} isLoading={loadingSpecies} />
            <CareRecommendations careInfo={careInfo} isLoading={loadingSpecies} />
            <Reminders plantId={plant.id} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
