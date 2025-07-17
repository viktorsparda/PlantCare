import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';
import Layout from '../../components/Layout';
import { 
  FiTag, 
  FiCalendar, 
  FiMapPin, 
  FiDroplet, 
  FiSun, 
  FiLayers,
  FiEdit3,
  FiHome,
  FiRefreshCw,
  FiBook,
  FiActivity,
  FiShield,
  FiTarget,
  FiTrash2,
  FiSearch
} from 'react-icons/fi';
import { 
  BiWater,
  BiSun
} from 'react-icons/bi';
import { 
  GiPlantSeed,
  GiFlowerPot,
  GiWateringCan,
  GiSunbeams,
  GiPlantRoots
} from 'react-icons/gi';
import { 
  MdScience,
  MdLocalFlorist
} from 'react-icons/md';

// Componentes para las secciones
const PlantInfo = ({ plant }) => {
  const [expandedNotes, setExpandedNotes] = useState(false);
  const notesText = plant.notes || 'Sin notas';
  const shouldTruncateNotes = notesText.length > 100;

  const plantData = [
    { icon: <FiTag className="w-5 h-5" />, label: 'Apodo', value: plant.personalName, color: 'purple' },
    { icon: <MdLocalFlorist className="w-5 h-5" />, label: 'Especie', value: plant.commonName || plant.sciName, color: 'pink' },
    { icon: <MdScience className="w-5 h-5" />, label: 'Nombre científico', value: plant.sciName, color: 'blue' },
    { icon: <FiCalendar className="w-5 h-5" />, label: 'Fecha de adquisición', value: plant.date ? new Date(plant.date).toLocaleDateString() : 'No especificada', color: 'indigo' },
    { icon: <FiMapPin className="w-5 h-5" />, label: 'Ubicación', value: plant.location || 'No especificada', color: 'red' },
    { icon: <GiWateringCan className="w-5 h-5" />, label: 'Riego', value: plant.watering || 'No especificado', color: 'cyan' },
    { icon: <GiSunbeams className="w-5 h-5" />, label: 'Luz', value: plant.light || 'No especificada', color: 'yellow' },
    { icon: <FiLayers className="w-5 h-5" />, label: 'Drenaje', value: plant.drainage || 'No especificado', color: 'orange' }
  ];

  const capitalizeText = (text) => {
    if (!text || text === 'No especificada' || text === 'No especificado') return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const getColorClasses = (color) => {
    const colors = {
      purple: 'from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 border-purple-500',
      pink: 'from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 border-pink-500',
      blue: 'from-blue-100 to-sky-100 dark:from-blue-900/30 dark:to-sky-900/30 border-blue-500',
      indigo: 'from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 border-indigo-500',
      red: 'from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 border-red-500',
      cyan: 'from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 border-cyan-500',
      yellow: 'from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-500',
      orange: 'from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border-orange-500'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-6 flex items-center">
        <GiFlowerPot className="w-8 h-8 mr-3 text-green-600 dark:text-green-400" />
        Información de tu Planta
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {plantData.map((item, index) => (
          <div key={index} className={`bg-gradient-to-r ${getColorClasses(item.color)} rounded-lg p-4 border-l-4 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start">
              <div className="text-gray-700 dark:text-gray-300 mr-3 flex-shrink-0 p-1">
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{item.label}</p>
                <p className="text-gray-800 dark:text-gray-100 font-medium leading-relaxed">{capitalizeText(item.value)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notas especiales */}
      {plant.notes && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-4 border-l-4 border-green-500 shadow-sm">
          <div className="flex items-start">
            <div className="text-green-600 dark:text-green-400 mr-3 flex-shrink-0 p-1">
              <FiEdit3 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">Notas Personales</p>
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                {shouldTruncateNotes && !expandedNotes 
                  ? notesText.substring(0, 100) + '...' 
                  : notesText
                }
              </p>
              {shouldTruncateNotes && (
                <button
                  onClick={() => setExpandedNotes(!expandedNotes)}
                  className="mt-2 text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 font-medium transition-colors"
                >
                  {expandedNotes ? '← Ver menos' : 'Ver más →'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SpeciesInfo = ({ speciesDetails, isLoading }) => {
  const capitalizeText = (text) => {
    if (!text || text === 'No disponible') return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const getSpeciesData = () => {
    if (!speciesDetails) return [];
    
    return [
      { 
        icon: <FiHome className="w-5 h-5" />, 
        label: 'Familia', 
        value: capitalizeText(speciesDetails.family || 'No disponible'),
        color: 'emerald',
        description: 'Grupo taxonómico que agrupa géneros relacionados'
      },
      { 
        icon: <GiPlantRoots className="w-5 h-5" />, 
        label: 'Género', 
        value: capitalizeText(speciesDetails.genus || 'No disponible'),
        color: 'teal',
        description: 'Clasificación que agrupa especies similares'
      },
      { 
        icon: <FiRefreshCw className="w-5 h-5" />, 
        label: 'Ciclo de vida', 
        value: capitalizeText(speciesDetails.cycle || 'No disponible'),
        color: 'cyan',
        description: 'Duración del ciclo vital de la planta'
      },
      { 
        icon: <FiTag className="w-5 h-5" />, 
        label: 'Nombre común', 
        value: capitalizeText(speciesDetails.common_name || 'No disponible'),
        color: 'blue',
        description: 'Nombre popular o vernáculo'
      }
    ];
  };

  const getColorClasses = (color) => {
    const colors = {
      emerald: 'from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 border-emerald-500',
      teal: 'from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 border-teal-500',
      cyan: 'from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 border-cyan-500',
      blue: 'from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-500'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-6 flex items-center">
        <FiBook className="w-8 h-8 mr-3 text-green-600 dark:text-green-400" />
        Detalles de la Especie
      </h2>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="ml-3 text-gray-600 dark:text-gray-300">Cargando información de la especie...</p>
        </div>
      ) : speciesDetails ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getSpeciesData().map((item, index) => (
            <div key={index} className={`bg-gradient-to-r ${getColorClasses(item.color)} rounded-lg p-4 border-l-4 shadow-sm hover:shadow-md transition-shadow group`}>
              <div className="flex items-start">
                <div className="text-gray-700 dark:text-gray-300 mr-3 flex-shrink-0 p-1">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{item.label}</p>
                  <p className="text-gray-800 dark:text-gray-100 font-medium leading-relaxed mb-2">{item.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Nombres científicos */}
          {speciesDetails.scientific_name && Array.isArray(speciesDetails.scientific_name) && (
            <div className="md:col-span-2 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-lg p-4 border-l-4 border-violet-500 shadow-sm">
              <div className="flex items-start">
                <div className="text-violet-600 dark:text-violet-400 mr-3 flex-shrink-0 p-1">
                  <MdScience className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Nombres Científicos</p>
                  <div className="flex flex-wrap gap-2">
                    {speciesDetails.scientific_name.map((name, idx) => (
                      <span key={idx} className="bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 italic">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <GiPlantSeed className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">No hay información específica de la especie disponible</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Los detalles botánicos se mostrarán aquí cuando estén disponibles</p>
        </div>
      )}
    </div>
  );
};


const CareRecommendations = ({ careInfo, isLoading, apiMessage }) => {
  const [expandedSections, setExpandedSections] = useState({});

  const capitalizeText = (text) => {
    if (!text || text === 'No especificado') return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderBasicInfoCard = (info, type) => {
    const isExpanded = expandedSections[`basic-${type}`];
    const shouldTruncate = info.length > 80;
    
    const cardConfig = {
      watering: {
        icon: <BiWater className="w-5 h-5" />,
        label: 'Riego',
        bgColor: 'from-blue-100 to-cyan-100 dark:from-gray-700 dark:to-gray-600',
        iconBg: 'bg-blue-500',
        textColor: 'text-blue-800 dark:text-blue-200',
        buttonColor: 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200'
      },
      sunlight: {
        icon: <BiSun className="w-5 h-5" />,
        label: 'Luz solar',
        bgColor: 'from-yellow-100 to-orange-100 dark:from-gray-700 dark:to-gray-600',
        iconBg: 'bg-yellow-500',
        textColor: 'text-yellow-800 dark:text-yellow-200',
        buttonColor: 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200'
      }
    };

    const config = cardConfig[type];

    return (
      <div className={`bg-gradient-to-r ${config.bgColor} rounded-lg p-4 flex items-start`}>
        <div className={`${config.iconBg} rounded-full p-2 mr-4 flex-shrink-0`}>
          <div className="text-white">
            {config.icon}
          </div>
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${config.textColor} mb-1`}>{config.label}</p>
          <p className="text-gray-700 dark:text-gray-200 font-semibold leading-relaxed">
            {shouldTruncate && !isExpanded ? capitalizeText(truncateText(info, 80)) : capitalizeText(info)}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => toggleSection(`basic-${type}`)}
              className={`mt-2 text-sm ${config.buttonColor} font-medium transition-colors`}
            >
              {isExpanded ? '← Ver menos' : 'Ver más →'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderTipCard = (tip, idx, section) => {
    const isExpanded = expandedSections[`${section}-${idx}`];
    const shouldTruncate = tip.length > 150;
    
    return (
      <div key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
          {shouldTruncate && !isExpanded ? capitalizeText(truncateText(tip)) : capitalizeText(tip)}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => toggleSection(`${section}-${idx}`)}
            className="mt-2 text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 font-medium transition-colors"
          >
            {isExpanded ? '← Ver menos' : 'Ver más →'}
          </button>
        )}
      </div>
    );
  };

  const renderProblemCard = (problem, idx, section) => {
    const isExpanded = expandedSections[`${section}-${idx}`];
    const shouldTruncate = problem.length > 150;
    
    return (
      <div key={idx} className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 border-l-4 border-yellow-500 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
          {shouldTruncate && !isExpanded ? capitalizeText(truncateText(problem)) : capitalizeText(problem)}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => toggleSection(`${section}-${idx}`)}
            className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 font-medium transition-colors"
          >
            {isExpanded ? '← Ver menos' : 'Ver más →'}
          </button>
        )}
      </div>
    );
  };

  const renderRecommendationCard = (rec, idx, section) => {
    const isExpanded = expandedSections[`${section}-${idx}`];
    const shouldTruncate = rec.length > 150;
    
    return (
      <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
          {shouldTruncate && !isExpanded ? capitalizeText(truncateText(rec)) : capitalizeText(rec)}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => toggleSection(`${section}-${idx}`)}
            className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium transition-colors"
          >
            {isExpanded ? '← Ver menos' : 'Ver más →'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-6">🌱 Recomendaciones de Cuidado</h2>
      
      {/* Mensaje informativo si la API tiene problemas */}
      {apiMessage && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-center">
            <span className="text-blue-500 text-xl mr-3">ℹ️</span>
            <p className="text-blue-800 dark:text-blue-200 text-sm">{apiMessage}</p>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="ml-3 text-gray-600 dark:text-gray-300">Cargando recomendaciones...</p>
        </div>
      ) : careInfo ? (
        <div className="space-y-6">
          {/* Información básica en tarjetas pequeñas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderBasicInfoCard(
              careInfo.watering || careInfo?.watering_general_benchmark?.value || 'No especificado',
              'watering'
            )}
            
            {renderBasicInfoCard(
              Array.isArray(careInfo.sunlight) ? careInfo.sunlight.join(', ') : careInfo.sunlight || 'No especificado',
              'sunlight'
            )}
          </div>

          {/* Consejos prácticos */}
          {Array.isArray(careInfo.care_tips) && careInfo.care_tips.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center mb-3">
                <FiActivity className="w-6 h-6 mr-3 text-green-600 dark:text-green-400" />
                <h3 className="text-xl font-bold text-green-700 dark:text-green-300">Consejos Prácticos</h3>
              </div>
              <div className="space-y-3">
                {careInfo.care_tips.map((tip, idx) => renderTipCard(tip, idx, 'tips'))}
              </div>
            </div>
          )}

          {/* Problemas comunes */}
          {Array.isArray(careInfo.common_problems) && careInfo.common_problems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center mb-3">
                <FiShield className="w-6 h-6 mr-3 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-xl font-bold text-yellow-700 dark:text-yellow-300">Problemas Comunes</h3>
              </div>
              <div className="space-y-3">
                {careInfo.common_problems.map((problem, idx) => renderProblemCard(problem, idx, 'problems'))}
              </div>
            </div>
          )}

          {/* Recomendaciones personalizadas */}
          {Array.isArray(careInfo.personalized_recommendations) && careInfo.personalized_recommendations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center mb-3">
                <FiTarget className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300">Recomendaciones Personalizadas</h3>
              </div>
              <div className="space-y-3">
                {careInfo.personalized_recommendations.map((rec, idx) => renderRecommendationCard(rec, idx, 'recommendations'))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <GiPlantRoots className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-600 dark:text-gray-300">No hay recomendaciones de cuidado específicas disponibles.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Los consejos se mostrarán aquí cuando tengamos más información sobre tu planta.</p>
        </div>
      )}
    </div>
  );
};

const Reminders = ({ plantId, plantName }) => {
  const [reminders, setReminders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [newReminder, setNewReminder] = useState({
    type: 'watering',
    frequency: 7,
    nextDate: '',
    notes: ''
  });
  const { user } = useAuth();

  const reminderTypes = [
    { id: 'watering', label: 'Riego', icon: <FiDroplet className="w-5 h-5" />, color: 'blue', defaultFreq: 7 },
    { id: 'fertilizing', label: 'Fertilización', icon: <GiPlantSeed className="w-5 h-5" />, color: 'green', defaultFreq: 30 },
    { id: 'pruning', label: 'Poda', icon: <FiActivity className="w-5 h-5" />, color: 'yellow', defaultFreq: 90 },
    { id: 'repotting', label: 'Trasplante', icon: <GiFlowerPot className="w-5 h-5" />, color: 'orange', defaultFreq: 365 },
    { id: 'inspection', label: 'Inspección', icon: <FiSearch className="w-5 h-5" />, color: 'purple', defaultFreq: 7 }
  ];

  // Cargar recordatorios al montar el componente
  useEffect(() => {
    const loadReminders = async () => {
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/reminders/${plantId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setReminders(data);
        }
      } catch (error) {
        console.error('Error loading reminders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (plantId && user) {
      loadReminders();
    }
  }, [plantId, user]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      setServerError(false);
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/reminders/${plantId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Mapear los datos del backend al formato esperado por el frontend
        const mappedReminders = data.map(reminder => ({
          id: reminder.id,
          plantId: reminder.plantId,
          type: reminder.type,
          typeName: reminder.title,
          icon: reminderTypes.find(rt => rt.id === reminder.type)?.icon || '📅',
          color: reminderTypes.find(rt => rt.id === reminder.type)?.color || 'blue',
          frequency: reminder.frequency || 7, // Usar la frecuencia de la base de datos
          date: reminder.date, // Usar 'date' en lugar de 'nextDate'
          notes: reminder.description || '',
          completed: reminder.completed || false
        }));
        
        setReminders(mappedReminders);
      } else {
        // Verificar si la respuesta es HTML (servidor no disponible)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          console.error('El servidor backend no está disponible');
          setServerError(true);
          return;
        }
        console.error('Error loading reminders:', response.status);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
      
      // Verificar si es un error de JSON parsing o conexión
      if (error.message.includes('Unexpected token') || error.message.includes('Failed to fetch')) {
        console.warn('El servidor backend no está disponible. Los recordatorios no se pueden cargar.');
        setServerError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveReminder = async (reminderData) => {
    try {
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Mapear los datos al formato esperado por el backend
      const backendData = {
        plantId: reminderData.plantId,
        type: reminderData.type,
        title: reminderData.typeName,
        description: reminderData.notes || '',
        date: reminderData.nextDate,
        frequency: reminderData.frequency || 7
      };
      
      const response = await fetch(`${apiUrl}/reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(backendData)
      });
      
      if (response.ok) {
        const result = await response.json();
        // Devolver el recordatorio con el formato esperado por el frontend
        return {
          id: result.id,
          plantId: reminderData.plantId,
          type: reminderData.type,
          typeName: reminderData.typeName,
          icon: reminderData.icon,
          color: reminderData.color,
          frequency: reminderData.frequency,
          date: reminderData.nextDate, // Mapear nextDate a date
          notes: reminderData.notes,
          completed: false
        };
      } else {
        // Verificar si la respuesta es HTML (servidor no disponible)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          console.error('El servidor backend no está disponible o no está respondiendo correctamente');
          setServerError(true);
          alert('Error: El servidor backend no está disponible. Por favor, ejecuta el archivo "start-backend.bat" para iniciar el servidor.');
          return null;
        }
        
        const error = await response.json();
        console.error('Error response:', error);
        alert('Error al guardar el recordatorio: ' + (error.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
      
      // Verificar si es un error de JSON parsing o conexión
      if (error.message.includes('Unexpected token') || error.message.includes('Failed to fetch')) {
        setServerError(true);
        alert('Error: El servidor backend no está disponible. Por favor, ejecuta el archivo "start-backend.bat" para iniciar el servidor.');
      } else {
        alert('Error de conexión al guardar el recordatorio: ' + error.message);
      }
    }
    return null;
  };

  const deleteReminder = async (id) => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/reminders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setReminders(reminders.filter(r => r.id !== id));
      } else {
        const error = await response.json();
        console.error('Error deleting reminder:', error);
        alert('Error al eliminar el recordatorio: ' + (error.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      alert('Error de conexión al eliminar el recordatorio');
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return 'from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 border-blue-500';
      case 'green':
        return 'from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-500';
      case 'yellow':
        return 'from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-500';
      case 'orange':
        return 'from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border-orange-500';
      case 'purple':
        return 'from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 border-purple-500';
      default:
        return 'from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 border-blue-500';
    }
  };

  const getIconBgColor = (color) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500';
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'orange':
        return 'bg-orange-500';
      case 'purple':
        return 'bg-purple-500';
      default:
        return 'bg-blue-500';
    }
  };

  const handleTypeChange = (type) => {
    const reminderType = reminderTypes.find(t => t.id === type);
    setNewReminder({
      ...newReminder,
      type,
      frequency: reminderType.defaultFreq
    });
  };

  const handleAddReminder = async () => {
    if (!newReminder.nextDate) {
      alert('Por favor selecciona una fecha');
      return;
    }

    if (loading) return; // Prevenir múltiples clicks

    setLoading(true);
    try {
      const reminderType = reminderTypes.find(type => type.id === newReminder.type);
      const reminderData = {
        plantId,
        plantName,
        type: newReminder.type,
        typeName: reminderType.label,
        icon: reminderType.icon,
        color: reminderType.color,
        frequency: newReminder.frequency,
        nextDate: newReminder.nextDate,
        notes: newReminder.notes
      };

      const savedReminder = await saveReminder(reminderData);
      if (savedReminder) {
        setReminders(prev => [...prev, savedReminder]);
        setNewReminder({ type: 'watering', frequency: 7, nextDate: '', notes: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error en handleAddReminder:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const quickAddReminder = async (type) => {
    if (loading) return; // Prevenir múltiples clicks
    
    const reminderType = reminderTypes.find(t => t.id === type);
    const reminderData = {
      plantId,
      plantName,
      type,
      typeName: reminderType.label,
      icon: reminderType.icon,
      color: reminderType.color,
      frequency: reminderType.defaultFreq,
      nextDate: getNextDate(reminderType.defaultFreq),
      notes: ''
    };

    setLoading(true);
    try {
      const savedReminder = await saveReminder(reminderData);
      if (savedReminder) {
        setReminders(prev => [...prev, savedReminder]);
        // Mostrar un mensaje de éxito temporal
        console.log(`Recordatorio de ${reminderType.label} agregado exitosamente`);
      }
    } catch (error) {
      console.error('Error en quickAddReminder:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no válida';
    
    try {
      // Crear fecha local en lugar de UTC para evitar problemas de zona horaria
      const [year, month, day] = dateString.split('-');
      const date = new Date(year, month - 1, day);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'Fecha no válida';
      }
      
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha no válida';
    }
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    
    try {
      // Crear fecha local en lugar de UTC
      const [year, month, day] = dateString.split('-');
      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) return false;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
      date.setHours(0, 0, 0, 0);
      
      return date < today;
    } catch (error) {
      console.error('Error checking overdue:', error);
      return false;
    }
  };

  const getDaysUntil = (dateString) => {
    if (!dateString) return 0;
    
    try {
      // Crear fecha local en lugar de UTC
      const [year, month, day] = dateString.split('-');
      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) return 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      const diffTime = date - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error('Error calculating days until:', error);
      return 0;
    }
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 flex items-center">
          <FiActivity className="w-8 h-8 mr-3 text-green-600 dark:text-green-400" />
          Recordatorios
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={loading || serverError}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span>+</span>
          Personalizado
        </button>
      </div>

      {/* Banner de error del servidor */}
      {serverError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-3">⚠️</span>
              <div>
                <p className="text-red-800 dark:text-red-200 font-semibold">Servidor Backend No Disponible</p>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  Para usar los recordatorios, ejecuta el archivo <code className="bg-red-100 dark:bg-red-800 px-2 py-1 rounded">start-backend.bat</code> en la carpeta raíz del proyecto.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setServerError(false);
                loadReminders();
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Botones de acceso rápido */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Agregar Rápido</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {reminderTypes.map(type => (
            <button
              key={type.id}
              onClick={() => quickAddReminder(type.id)}
              disabled={loading || serverError}
              className={`p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 transition-all duration-200 disabled:opacity-50 group ${
                loading || serverError ? 'cursor-not-allowed' : 'hover:shadow-md transform hover:scale-105'
              } ${
                type.color === 'blue' ? 'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20' :
                type.color === 'green' ? 'hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' :
                type.color === 'yellow' ? 'hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' :
                type.color === 'orange' ? 'hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20' :
                'hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20'
              }`}
            >
              <div className="text-center">
                <div className="text-gray-600 dark:text-gray-400 mb-1 flex justify-center">
                  {type.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type.label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">
                  {type.defaultFreq < 30 ? `${type.defaultFreq}d` : 
                   type.defaultFreq < 365 ? `${Math.round(type.defaultFreq/30)}m` : 
                   `${Math.round(type.defaultFreq/365)}a`}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Formulario personalizado */}
      {showAddForm && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Recordatorio Personalizado</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de cuidado
              </label>
              <select
                value={newReminder.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {reminderTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Próxima fecha
              </label>
              <input
                type="date"
                value={newReminder.nextDate}
                onChange={(e) => setNewReminder({...newReminder, nextDate: e.target.value})}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Repetir cada (días)
              </label>
              <input
                type="number"
                value={newReminder.frequency}
                onChange={(e) => setNewReminder({...newReminder, frequency: parseInt(e.target.value)})}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notas (opcional)
              </label>
              <input
                type="text"
                value={newReminder.notes}
                onChange={(e) => setNewReminder({...newReminder, notes: e.target.value})}
                placeholder="Ej: Usar agua filtrada"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddReminder}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de recordatorios */}
      {loading && reminders.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="ml-3 text-gray-600 dark:text-gray-300">Cargando recordatorios...</p>
        </div>
      ) : reminders.length > 0 ? (
        <div className="space-y-3">
          {reminders.map(reminder => {
            const colorClasses = getColorClasses(reminder.color);
            const iconBgColor = getIconBgColor(reminder.color);
            const overdue = isOverdue(reminder.date);
            const daysUntil = getDaysUntil(reminder.date);
            
            return (
              <div key={reminder.id} className={`bg-gradient-to-r ${colorClasses} rounded-lg p-4 border-l-4 shadow-sm hover:shadow-md transition-shadow ${overdue ? 'ring-2 ring-red-400' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <div className={`${iconBgColor} rounded-full p-2 mr-4`}>
                      <div className="text-white">
                        {reminderTypes.find(rt => rt.id === reminder.type)?.icon || <FiCalendar className="w-5 h-5" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{reminder.typeName}</p>
                        {overdue ? (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            Vencido
                          </span>
                        ) : daysUntil <= 1 ? (
                          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                            {daysUntil === 0 ? 'Hoy' : 'Mañana'}
                          </span>
                        ) : (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            {daysUntil} días
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {formatDate(reminder.date)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Se repite cada {reminder.frequency} días
                      </p>
                      {reminder.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic flex items-center">
                          <FiEdit3 className="w-4 h-4 mr-1" />
                          {reminder.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    disabled={loading}
                    className={`text-red-500 hover:text-red-700 p-1 transition-colors ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <FiCalendar className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">No hay recordatorios configurados</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Usa los botones de &quot;Agregar Rápido&quot; arriba para crear recordatorios automáticos
          </p>
        </div>
      )}
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
  const [apiMessage, setApiMessage] = useState(null);

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
        setApiMessage(data.message || null);
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
  
  // Unificar recomendaciones para mostrar todos los campos posibles
  let careInfo = {};
  if (speciesAndCareInfo) {
    if (speciesAndCareInfo.growth && typeof speciesAndCareInfo.growth === 'object') {
      careInfo = { ...speciesAndCareInfo.growth };
    }
    ["care_tips", "common_problems", "personalized_recommendations"].forEach((key) => {
      if (speciesAndCareInfo[key]) {
        careInfo[key] = speciesAndCareInfo[key];
      }
    });
  }
  // Debug: mostrar qué datos llegan realmente
  console.log('speciesAndCareInfo:', speciesAndCareInfo);
  console.log('careInfo:', careInfo);

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
            <CareRecommendations careInfo={careInfo} isLoading={loadingSpecies} apiMessage={apiMessage} />
            <Reminders plantId={plant.id} plantName={plant.personalName} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
