import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";

const reminderTypes = [
  { id: 'watering', label: 'Riego', icon: '💧', color: 'blue' },
  { id: 'fertilizing', label: 'Fertilización', icon: '🌱', color: 'green' },
  { id: 'pruning', label: 'Poda', icon: '✂️', color: 'yellow' },
  { id: 'repotting', label: 'Trasplante', icon: '🏺', color: 'orange' },
  { id: 'inspection', label: 'Inspección', icon: '🔍', color: 'purple' }
];

// Componente moderno de Recordatorios para plantas
export default function Recordatorios() {
  const [reminders, setReminders] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Cargar plantas y sus recordatorios
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setServerError(false);
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        // Cargar plantas
        const plantsResponse = await fetch(`${apiUrl}/plants`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (plantsResponse.ok) {
          const plantsData = await plantsResponse.json();
          setPlants(plantsData);

          // Cargar recordatorios de todas las plantas
          const allReminders = [];
          for (const plant of plantsData) {
            try {
              const remindersResponse = await fetch(`${apiUrl}/reminders/${plant.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });

              if (remindersResponse.ok) {
                const plantReminders = await remindersResponse.json();
                const mappedReminders = plantReminders.map(reminder => ({
                  id: reminder.id,
                  plantId: reminder.plantId,
                  plantName: plant.personalName || plant.commonName || plant.sciName,
                  type: reminder.type,
                  typeName: reminder.title,
                  icon: reminderTypes.find(rt => rt.id === reminder.type)?.icon || '📅',
                  color: reminderTypes.find(rt => rt.id === reminder.type)?.color || 'blue',
                  nextDate: reminder.date,
                  frequency: reminder.frequency || 7,
                  notes: reminder.description || '',
                  completed: reminder.completed || false
                }));
                allReminders.push(...mappedReminders);
              }
            } catch (error) {
              console.error(`Error loading reminders for plant ${plant.id}:`, error);
            }
          }

          // Ordenar recordatorios por fecha
          allReminders.sort((a, b) => {
            try {
              const [yearA, monthA, dayA] = a.nextDate.split('-');
              const [yearB, monthB, dayB] = b.nextDate.split('-');
              const dateA = new Date(yearA, monthA - 1, dayA);
              const dateB = new Date(yearB, monthB - 1, dayB);
              return dateA - dateB;
            } catch (error) {
              return 0;
            }
          });
          setReminders(allReminders);
        } else {
          throw new Error('Failed to load plants');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        if (error.message.includes('Failed to fetch') || error.message.includes('Unexpected token')) {
          setServerError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const formatDate = (dateString) => {
    try {
      // Crear fecha local en lugar de UTC para evitar problemas de zona horaria
      const [year, month, day] = dateString.split('-');
      const date = new Date(year, month - 1, day);
      
      if (isNaN(date.getTime())) {
        return 'Fecha no válida';
      }
      
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha no válida';
    }
  };

  const isOverdue = (dateString) => {
    try {
      // Crear fecha local en lugar de UTC
      const [year, month, day] = dateString.split('-');
      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) return false;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      return date < today;
    } catch (error) {
      return false;
    }
  };

  const getDaysUntil = (dateString) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-200';
      case 'green':
        return 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200';
      case 'yellow':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-800 dark:text-yellow-200';
      case 'orange':
        return 'bg-orange-100 dark:bg-orange-900/30 border-orange-500 text-orange-800 dark:text-orange-200';
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-800 dark:text-purple-200';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-200';
    }
  };

  const goToPlant = (plantId) => {
    router.push(`/plant/${plantId}`);
  };

  // Mostrar solo los próximos 5 recordatorios
  const upcomingReminders = reminders.slice(0, 5);

  return (
    <div>
      {/* Banner de error del servidor */}
      {serverError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-500 text-lg mr-2">⚠️</span>
            <div>
              <p className="text-red-800 dark:text-red-200 font-semibold text-sm">Servidor No Disponible</p>
              <p className="text-red-700 dark:text-red-300 text-xs">
                Ejecuta <code className="bg-red-100 dark:bg-red-800 px-1 py-0.5 rounded">start-backend.bat</code> para ver recordatorios
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-gray-600 dark:text-gray-300 text-sm">Cargando recordatorios...</p>
        </div>
      ) : plants.length === 0 ? (
        <div className="text-center py-6">
          <span className="text-3xl mb-2 block">🌱</span>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">No tienes plantas registradas</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            Agrega plantas primero para crear recordatorios
          </p>
        </div>
      ) : upcomingReminders.length === 0 ? (
        <div className="text-center py-6">
          <span className="text-3xl mb-2 block">📅</span>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">No hay recordatorios programados</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            Ve a tus plantas para configurar recordatorios
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingReminders.map(reminder => {
            const colorClasses = getColorClasses(reminder.color);
            const overdue = isOverdue(reminder.nextDate);
            const daysUntil = getDaysUntil(reminder.nextDate);
            
            return (
              <div 
                key={reminder.id} 
                className={`${colorClasses} rounded-lg p-3 border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
                  overdue ? 'ring-2 ring-red-400' : ''
                }`}
                onClick={() => goToPlant(reminder.plantId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <span className="text-lg mr-3">{reminder.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{reminder.typeName}</span>
                        {overdue ? (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            Vencido
                          </span>
                        ) : daysUntil === 0 ? (
                          <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                            Hoy
                          </span>
                        ) : daysUntil === 1 ? (
                          <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                            Mañana
                          </span>
                        ) : daysUntil <= 3 ? (
                          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {daysUntil} días
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs opacity-75 mb-1">{reminder.plantName}</p>
                      <p className="text-xs opacity-60">{formatDate(reminder.nextDate)}</p>
                    </div>
                  </div>
                  <span className="text-xs opacity-50">→</span>
                </div>
              </div>
            );
          })}
          
          {reminders.length > 5 && (
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                +{reminders.length - 5} recordatorios más en tus plantas
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
