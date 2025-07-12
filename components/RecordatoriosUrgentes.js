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

// Componente para mostrar recordatorios urgentes (hoy y vencidos)
export default function RecordatoriosUrgentes() {
  const [urgentReminders, setUrgentReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadUrgentReminders = async () => {
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
          
          // Cargar recordatorios urgentes
          const urgentList = [];
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          for (const plant of plantsData) {
            try {
              const remindersResponse = await fetch(`${apiUrl}/reminders/${plant.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });

              if (remindersResponse.ok) {
                const plantReminders = await remindersResponse.json();
                
                // Filtrar solo recordatorios urgentes (hoy y vencidos)
                const urgent = plantReminders.filter(reminder => {
                  try {
                    // Crear fecha local en lugar de UTC
                    const [year, month, day] = reminder.date.split('-');
                    const reminderDate = new Date(year, month - 1, day);
                    reminderDate.setHours(0, 0, 0, 0);
                    return reminderDate <= today;
                  } catch (error) {
                    return false;
                  }
                });

                const mappedUrgent = urgent.map(reminder => ({
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

                urgentList.push(...mappedUrgent);
              }
            } catch (error) {
              console.error(`Error loading reminders for plant ${plant.id}:`, error);
            }
          }

          // Ordenar por fecha (más urgentes primero)
          urgentList.sort((a, b) => {
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
          setUrgentReminders(urgentList);
        }
      } catch (error) {
        console.error('Error loading urgent reminders:', error);
        if (error.message.includes('Failed to fetch') || error.message.includes('Unexpected token')) {
          setServerError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUrgentReminders();
  }, [user]);

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

  const goToPlant = (plantId) => {
    router.push(`/plant/${plantId}`);
  };

  if (loading || serverError || urgentReminders.length === 0) {
    return null; // No mostrar nada si no hay recordatorios urgentes
  }

  return (
    <div className="bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 dark:from-red-900/30 dark:via-orange-900/30 dark:to-yellow-900/30 rounded-xl shadow-lg p-4 mb-6 border-l-4 border-red-500">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-red-800 dark:text-red-200 flex items-center gap-2">
          <span className="text-2xl animate-pulse">🚨</span>
          Recordatorios Urgentes
        </h3>
        <span className="text-sm text-red-600 dark:text-red-300 font-semibold">
          {urgentReminders.length} pendiente{urgentReminders.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="space-y-2">
        {urgentReminders.slice(0, 3).map(reminder => (
          <div 
            key={reminder.id}
            className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow border-l-2 border-red-400"
            onClick={() => goToPlant(reminder.plantId)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <span className="text-lg mr-3">{reminder.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                      {reminder.typeName}
                    </span>
                    {isOverdue(reminder.nextDate) ? (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Vencido
                      </span>
                    ) : isToday(reminder.nextDate) ? (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Hoy
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {reminder.plantName}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">→</span>
            </div>
          </div>
        ))}
        
        {urgentReminders.length > 3 && (
          <div className="text-center pt-2">
            <p className="text-xs text-red-600 dark:text-red-400">
              +{urgentReminders.length - 3} recordatorios más requieren atención
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
