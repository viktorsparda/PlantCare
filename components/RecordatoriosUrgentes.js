import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { FaTint, FaLeaf, FaCut, FaExchangeAlt, FaSearch, FaCheck, FaTimes, FaBell } from 'react-icons/fa';

const reminderTypes = [
  { id: 'watering', label: 'Riego', icon: <FaTint />, color: 'blue' },
  { id: 'fertilizing', label: 'Fertilización', icon: <FaLeaf />, color: 'green' },
  { id: 'pruning', label: 'Poda', icon: <FaCut />, color: 'yellow' },
  { id: 'repotting', label: 'Trasplante', icon: <FaExchangeAlt />, color: 'orange' },
  { id: 'inspection', label: 'Inspección', icon: <FaSearch />, color: 'purple' }
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
                  icon: reminderTypes.find(rt => rt.id === reminder.type)?.icon || <FaBell />,
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

  const handleComplete = async (reminderId) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/reminders/${reminderId}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setUrgentReminders(prev => prev.filter(r => r.id !== reminderId));
      }
    } catch (error) {
      console.error('Error completing reminder:', error);
    }
  };

  if (loading) return <div className="text-center p-4">Cargando recordatorios urgentes...</div>;
  if (serverError) return <div className="text-center p-4 text-red-500">Error al conectar con el servidor.</div>;
  if (urgentReminders.length === 0) return null;

  return (
    <div className="p-4 bg-red-100 dark:bg-red-900/50 rounded-lg mb-6">
      <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-3 flex items-center gap-2">
        <FaBell className="animate-pulse" /> Recordatorios Urgentes
      </h2>
      <div className="space-y-3">
        {urgentReminders.map(reminder => (
          <div key={reminder.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`text-xl text-${reminder.color}-500`}>{reminder.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">{reminder.typeName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{reminder.plantName}</p>
                <p className="text-xs text-red-600 dark:text-red-400">Vence: {new Date(reminder.nextDate).toLocaleDateString()}</p>
              </div>
            </div>
            <button onClick={() => handleComplete(reminder.id)} className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600">
              <FaCheck />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
