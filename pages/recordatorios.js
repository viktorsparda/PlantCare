import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";

const reminderTypes = [
  { id: 'watering', label: 'Riego', icon: '💧', color: 'blue' },
  { id: 'fertilizing', label: 'Fertilización', icon: '🌱', color: 'green' },
  { id: 'pruning', label: 'Poda', icon: '✂️', color: 'yellow' },
  { id: 'repotting', label: 'Trasplante', icon: '🏺', color: 'orange' },
  { id: 'inspection', label: 'Inspección', icon: '🔍', color: 'purple' }
];

export default function RemindersPage() {
  const [allReminders, setAllReminders] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'urgent', 'today', 'upcoming'
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const loadAllData = async () => {
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
          const reminders = [];
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
                  plantImage: plant.photoPath,
                  type: reminder.type,
                  typeName: reminder.title,
                  icon: reminderTypes.find(rt => rt.id === reminder.type)?.icon || '📅',
                  color: reminderTypes.find(rt => rt.id === reminder.type)?.color || 'blue',
                  nextDate: reminder.date,
                  frequency: reminder.frequency || 7,
                  notes: reminder.description || '',
                  completed: reminder.completed || false
                }));
                reminders.push(...mappedReminders);
              }
            } catch (error) {
              console.error(`Error loading reminders for plant ${plant.id}:`, error);
            }
          }

          // Ordenar recordatorios por fecha
          reminders.sort((a, b) => {
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
          setAllReminders(reminders);
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

    loadAllData();
  }, [user, router]);

  const formatDate = (dateString) => {
    try {
      // Crear fecha local en lugar de UTC para evitar problemas de zona horaria
      const [year, month, day] = dateString.split('-');
      const date = new Date(year, month - 1, day);
      
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
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Crear fecha local en lugar de UTC
      const [year, month, day] = dateString.split('-');
      const reminderDate = new Date(year, month - 1, day);
      reminderDate.setHours(0, 0, 0, 0);
      
      return reminderDate < today;
    } catch (error) {
      return false;
    }
  };

  const isToday = (dateString) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Crear fecha local en lugar de UTC
      const [year, month, day] = dateString.split('-');
      const reminderDate = new Date(year, month - 1, day);
      reminderDate.setHours(0, 0, 0, 0);
      
      return reminderDate.getTime() === today.getTime();
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

  const filterReminders = (reminders) => {
    switch (filter) {
      case 'urgent':
        return reminders.filter(r => isOverdue(r.nextDate));
      case 'today':
        return reminders.filter(r => isToday(r.nextDate));
      case 'upcoming':
        return reminders.filter(r => getDaysUntil(r.nextDate) > 0 && getDaysUntil(r.nextDate) <= 7);
      default:
        return reminders;
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

  const goToPlant = (plantId) => {
    router.push(`/plant/${plantId}`);
  };

  const filteredReminders = filterReminders(allReminders);
  const urgentCount = allReminders.filter(r => isOverdue(r.nextDate)).length;
  const todayCount = allReminders.filter(r => isToday(r.nextDate)).length;
  const upcomingCount = allReminders.filter(r => getDaysUntil(r.nextDate) > 0 && getDaysUntil(r.nextDate) <= 7).length;

  return (
    <Layout pageTitle="Recordatorios">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            📅 Todos los Recordatorios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona todos los recordatorios de cuidado de tus plantas
          </p>
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
                    Para ver los recordatorios, ejecuta el archivo <code className="bg-red-100 dark:bg-red-800 px-2 py-1 rounded">start-backend.bat</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Todos ({allReminders.length})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'urgent' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Vencidos ({urgentCount})
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'today' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Hoy ({todayCount})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'upcoming' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Próximos 7 días ({upcomingCount})
          </button>
        </div>

        {/* Lista de recordatorios */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-gray-600 dark:text-gray-300">Cargando recordatorios...</p>
          </div>
        ) : plants.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🌱</span>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              No tienes plantas registradas
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Agrega plantas primero para poder crear recordatorios
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Ir al Dashboard
            </button>
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📅</span>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              No hay recordatorios {filter === 'all' ? '' : `para "${filter}"`}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Ve a tus plantas individuales para configurar recordatorios
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Ir a mis Plantas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReminders.map(reminder => {
              const colorClasses = getColorClasses(reminder.color);
              const overdue = isOverdue(reminder.nextDate);
              const today = isToday(reminder.nextDate);
              const daysUntil = getDaysUntil(reminder.nextDate);
              
              return (
                <div 
                  key={reminder.id} 
                  className={`bg-gradient-to-r ${colorClasses} rounded-xl p-6 border-l-4 shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${
                    overdue ? 'ring-2 ring-red-400' : ''
                  }`}
                  onClick={() => goToPlant(reminder.plantId)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{reminder.icon}</span>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">
                          {reminder.typeName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {reminder.plantName}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {overdue ? (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full mb-1">
                          Vencido
                        </span>
                      ) : today ? (
                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full mb-1">
                          Hoy
                        </span>
                      ) : daysUntil === 1 ? (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full mb-1">
                          Mañana
                        </span>
                      ) : daysUntil <= 7 ? (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full mb-1">
                          {daysUntil} días
                        </span>
                      ) : (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full mb-1">
                          {daysUntil} días
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">→</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                      {formatDate(reminder.nextDate)}
                    </p>
                  </div>
                  
                  {reminder.notes && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 italic">
                      📝 {reminder.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
