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
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg p-5">
      <h2 className="text-xl font-bold text-green-800 dark:text-green-300 mb-4 flex items-center">
        <FiBook className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
        Información Botánica
      </h2>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
          <p className="ml-3 text-gray-600 dark:text-gray-300 text-sm">Cargando...</p>
        </div>
      ) : speciesDetails ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {getSpeciesData().map((item, index) => (
              <div key={index} className={`bg-gradient-to-r ${getColorClasses(item.color)} rounded-lg p-3 border-l-4 shadow-sm hover:shadow-md transition-shadow group`}>
                <div className="flex items-center">
                  <div className="text-gray-700 dark:text-gray-300 mr-3 flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{item.label}</p>
                    <p className="text-sm text-gray-800 dark:text-gray-100 font-medium leading-tight truncate">
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Nombres científicos en una sola línea compacta */}
          {speciesDetails.scientific_name && Array.isArray(speciesDetails.scientific_name) && (
            <div className="bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-lg p-3 border-l-4 border-violet-500 shadow-sm">
              <div className="flex items-center">
                <MdScience className="w-5 h-5 mr-2 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Nombres Científicos</p>
                  <div className="flex flex-wrap gap-1">
                    {speciesDetails.scientific_name.slice(0, 3).map((name, idx) => (
                      <span key={idx} className="bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded text-xs font-medium text-gray-700 dark:text-gray-200 italic">
                        {name}
                      </span>
                    ))}
                    {speciesDetails.scientific_name.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                        +{speciesDetails.scientific_name.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <GiPlantSeed className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-600 dark:text-gray-300 text-sm">Sin información botánica disponible</p>
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
      <div className={`bg-gradient-to-r ${config.bgColor} rounded-lg p-3 flex items-start`}>
        <div className={`${config.iconBg} rounded-full p-2 mr-3 flex-shrink-0`}>
          <div className="text-white">
            {config.icon}
          </div>
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${config.textColor} mb-1`}>{config.label}</p>
          <p className="text-gray-700 dark:text-gray-200 font-semibold leading-relaxed text-sm text-justify">
            {shouldTruncate && !isExpanded ? capitalizeText(truncateText(info, 60)) : capitalizeText(info)}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => toggleSection(`basic-${type}`)}
              className={`mt-2 text-xs ${config.buttonColor} font-medium transition-colors`}
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
    const shouldTruncate = tip.length > 120;
    
    return (
      <div key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3 border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed text-justify">
          {shouldTruncate && !isExpanded ? capitalizeText(truncateText(tip, 120)) : capitalizeText(tip)}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => toggleSection(`${section}-${idx}`)}
            className="mt-2 text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 font-medium transition-colors"
          >
            {isExpanded ? '← Ver menos' : 'Ver más →'}
          </button>
        )}
      </div>
    );
  };

  const renderProblemCard = (problem, idx, section) => {
    const isExpanded = expandedSections[`${section}-${idx}`];
    const shouldTruncate = problem.length > 120;
    
    return (
      <div key={idx} className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3 border-l-4 border-yellow-500 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed text-justify">
          {shouldTruncate && !isExpanded ? capitalizeText(truncateText(problem, 120)) : capitalizeText(problem)}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => toggleSection(`${section}-${idx}`)}
            className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 font-medium transition-colors"
          >
            {isExpanded ? '← Ver menos' : 'Ver más →'}
          </button>
        )}
      </div>
    );
  };

  const renderRecommendationCard = (rec, idx, section) => {
    const isExpanded = expandedSections[`${section}-${idx}`];
    const shouldTruncate = rec.length > 100; // Reducido de 150 a 100
    
    return (
      <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed text-justify">
          {shouldTruncate && !isExpanded ? capitalizeText(truncateText(rec, 100)) : capitalizeText(rec)}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => toggleSection(`${section}-${idx}`)}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium transition-colors"
          >
            {isExpanded ? '← Ver menos' : 'Ver más →'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg p-5">
      <h2 className="text-xl font-bold text-green-800 dark:text-green-300 mb-4 flex items-center">
        <GiWateringCan className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
        Recomendaciones de Cuidado
      </h2>
      
      {/* Mensaje informativo si la API tiene problemas */}
      {apiMessage && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-center">
            <span className="text-blue-500 text-lg mr-2">ℹ️</span>
            <p className="text-blue-800 dark:text-blue-200 text-xs">{apiMessage}</p>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
          <p className="ml-3 text-gray-600 dark:text-gray-300 text-sm">Cargando recomendaciones...</p>
        </div>
      ) : careInfo ? (
        <div className="space-y-4">
          {/* Información básica en tarjetas compactas - Layout vertical */}
          <div className="space-y-3">
            {renderBasicInfoCard(
              careInfo.watering || careInfo?.watering_general_benchmark?.value || 'No especificado',
              'watering'
            )}
            
            {renderBasicInfoCard(
              Array.isArray(careInfo.sunlight) ? careInfo.sunlight.join(', ') : careInfo.sunlight || 'No especificado',
              'sunlight'
            )}
          </div>

          {/* Recomendaciones personalizadas si existen - Arriba y ocupando todo el espacio horizontal */}
          {Array.isArray(careInfo.personalized_recommendations) && careInfo.personalized_recommendations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center">
                <FiTarget className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">Recomendaciones Personalizadas</h3>
              </div>
              <div className="space-y-2">
                {careInfo.personalized_recommendations.slice(0, 4).map((rec, idx) => renderRecommendationCard(rec, idx, 'recommendations'))}
              </div>
              {careInfo.personalized_recommendations.length > 4 && (
                <div className="text-center">
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium">
                    Ver {careInfo.personalized_recommendations.length - 4} recomendaciones más →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Consejos y Problemas en layout horizontal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Consejos prácticos */}
            {Array.isArray(careInfo.care_tips) && careInfo.care_tips.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center">
                  <FiActivity className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                  <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">Consejos</h3>
                </div>
                <div className="space-y-2">
                  {careInfo.care_tips.slice(0, 3).map((tip, idx) => renderTipCard(tip, idx, 'tips'))}
                  {careInfo.care_tips.length > 3 && (
                    <div className="text-center">
                      <button className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 font-medium">
                        Ver {careInfo.care_tips.length - 3} consejos más →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Problemas comunes */}
            {Array.isArray(careInfo.common_problems) && careInfo.common_problems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center">
                  <FiShield className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                  <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">Problemas Comunes</h3>
                </div>
                <div className="space-y-2">
                  {careInfo.common_problems.slice(0, 3).map((problem, idx) => renderProblemCard(problem, idx, 'problems'))}
                  {careInfo.common_problems.length > 3 && (
                    <div className="text-center">
                      <button className="text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 font-medium">
                        Ver {careInfo.common_problems.length - 3} problemas más →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <GiPlantRoots className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-600 dark:text-gray-300 text-sm">No hay recomendaciones disponibles</p>
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
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-green-800 dark:text-green-300 flex items-center">
          <FiActivity className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
          Recordatorios
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={loading || serverError}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
        >
          <span>+</span>
          Personalizado
        </button>
      </div>

      {/* Banner de error del servidor - compacto */}
      {serverError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-500 text-lg mr-2">⚠️</span>
              <div>
                <p className="text-red-800 dark:text-red-200 font-medium text-sm">Backend No Disponible</p>
                <p className="text-red-700 dark:text-red-300 text-xs">
                  Ejecuta <code className="bg-red-100 dark:bg-red-800 px-1 py-0.5 rounded text-xs">start-backend.bat</code>
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setServerError(false);
                loadReminders();
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Botones de acceso rápido - más compactos */}
      <div className="mb-4">
        <h3 className="text-base font-semibold mb-2 text-gray-800 dark:text-gray-200">Agregar Rápido</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {reminderTypes.map(type => (
            <button
              key={type.id}
              onClick={() => quickAddReminder(type.id)}
              disabled={loading || serverError}
              className={`p-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 transition-all duration-200 disabled:opacity-50 group ${
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
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 block leading-tight">{type.label}</span>
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

      {/* Formulario personalizado - más compacto */}
      {showAddForm && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Recordatorio Personalizado</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de cuidado
              </label>
              <select
                value={newReminder.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              >
                {reminderTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Próxima fecha
              </label>
              <input
                type="date"
                value={newReminder.nextDate}
                onChange={(e) => setNewReminder({...newReminder, nextDate: e.target.value})}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Repetir cada (días)
              </label>
              <input
                type="number"
                value={newReminder.frequency}
                onChange={(e) => setNewReminder({...newReminder, frequency: parseInt(e.target.value)})}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                min="1"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notas (opcional)
              </label>
              <input
                type="text"
                value={newReminder.notes}
                onChange={(e) => setNewReminder({...newReminder, notes: e.target.value})}
                placeholder="Ej: Usar agua filtrada"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAddReminder}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-colors text-sm"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de recordatorios - más compacta */}
      {loading && reminders.length === 0 ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
          <p className="ml-3 text-gray-600 dark:text-gray-300 text-sm">Cargando recordatorios...</p>
        </div>
      ) : reminders.length > 0 ? (
        <div className="space-y-2">
          {reminders.map(reminder => {
            const colorClasses = getColorClasses(reminder.color);
            const iconBgColor = getIconBgColor(reminder.color);
            const overdue = isOverdue(reminder.date);
            const daysUntil = getDaysUntil(reminder.date);
            
            return (
              <div key={reminder.id} className={`bg-gradient-to-r ${colorClasses} rounded-lg p-3 border-l-4 shadow-sm hover:shadow-md transition-shadow ${overdue ? 'ring-2 ring-red-400' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className={`${iconBgColor} rounded-full p-2 mr-3 flex-shrink-0`}>
                      <div className="text-white">
                        {reminderTypes.find(rt => rt.id === reminder.type)?.icon || <FiCalendar className="w-4 h-4" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">{reminder.typeName}</p>
                        {overdue ? (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                            Vencido
                          </span>
                        ) : daysUntil <= 1 ? (
                          <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                            {daysUntil === 0 ? 'Hoy' : 'Mañana'}
                          </span>
                        ) : (
                          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                            {daysUntil}d
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                        {formatDate(reminder.date)} • Cada {reminder.frequency}d
                      </p>
                      {reminder.notes && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic truncate">
                          {reminder.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    disabled={loading}
                    className={`text-red-500 hover:text-red-700 p-1 transition-colors flex-shrink-0 ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6">
          <FiCalendar className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm">No hay recordatorios configurados</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Usa los botones de &quot;Agregar Rápido&quot; arriba
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

  // Función para capitalizar texto
  const capitalizeText = (text) => {
    if (!text || text === 'No especificada' || text === 'No especificado') return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

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
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        {/* Header Section - Información principal horizontal */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Imagen de la planta */}
            <div className="md:w-80 flex-shrink-0">
              <div className="relative aspect-square rounded-xl shadow-lg overflow-hidden">
                <Image
                  src={plant.photoPath ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/${plant.photoPath.replace(/^uploads[\\/]/, '')}` : '/default-plant.jpg'}
                  alt={plant.personalName}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>
            
            {/* Información principal */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                  {plant.personalName}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 italic mb-4">
                  {plant.commonName || plant.sciName}
                </p>
                
                {/* Grid completo de información de la planta */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {/* Información básica */}
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <FiDroplet className="w-4 h-4 mr-2 text-blue-500" />
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Riego</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {capitalizeText(plant.watering) || 'No especificado'}
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <FiSun className="w-4 h-4 mr-2 text-yellow-500" />
                      <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Luz</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {capitalizeText(plant.light) || 'No especificada'}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <FiMapPin className="w-4 h-4 mr-2 text-green-500" />
                      <p className="text-xs font-medium text-green-700 dark:text-green-300">Ubicación</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {capitalizeText(plant.location) || 'No especificada'}
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <FiCalendar className="w-4 h-4 mr-2 text-purple-500" />
                      <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Adquisición</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {plant.date ? new Date(plant.date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  
                  {/* Información adicional */}
                  <div className="bg-pink-50 dark:bg-pink-900/30 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <MdLocalFlorist className="w-4 h-4 mr-2 text-pink-500" />
                      <p className="text-xs font-medium text-pink-700 dark:text-pink-300">Especie Común</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {capitalizeText(plant.commonName || plant.sciName) || 'No especificado'}
                    </p>
                  </div>
                  
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <MdScience className="w-4 h-4 mr-2 text-indigo-500" />
                      <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Nombre Científico</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {plant.sciName || 'No especificado'}
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <FiLayers className="w-4 h-4 mr-2 text-orange-500" />
                      <p className="text-xs font-medium text-orange-700 dark:text-orange-300">Drenaje</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {capitalizeText(plant.drainage) || 'No especificado'}
                    </p>
                  </div>
                  
                  <div className="bg-teal-50 dark:bg-teal-900/30 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <FiTag className="w-4 h-4 mr-2 text-teal-500" />
                      <p className="text-xs font-medium text-teal-700 dark:text-teal-300">Apodo</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {plant.personalName || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Notas si existen */}
              {plant.notes && (
                <div className="mt-4 bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="flex items-start">
                    <FiEdit3 className="w-4 h-4 mt-0.5 mr-2 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Notas Personales</p>
                      <p className="text-sm text-gray-700 dark:text-gray-200 text-justify">{plant.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid - Layout en 2 columnas para desktop */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Columna Izquierda */}
          <div className="space-y-6">
            <SpeciesInfo speciesDetails={speciesAndCareInfo} isLoading={loadingSpecies} />
            <Reminders plantId={plant.id} plantName={plant.personalName} />
          </div>
          
          {/* Columna Derecha */}
          <div className="space-y-6">
            <CareRecommendations careInfo={careInfo} isLoading={loadingSpecies} apiMessage={apiMessage} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
