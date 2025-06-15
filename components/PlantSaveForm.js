import { useState } from "react";
import toast from 'react-hot-toast';
import Image from "next/image";
import { useAuth } from "../context/AuthContext"; // <--- Agrega esto

export default function PlantSaveForm({ sciName, commonName, photo, onCancel }) {
  const { user } = useAuth(); // <--- Agrega esto
  const [personalName, setPersonalName] = useState("");
  const [location, setLocation] = useState("");
  const [watering, setWatering] = useState("");
  const [light, setLight] = useState("");
  const [drainage, setDrainage] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("sciName", sciName);
    formData.append("commonName", commonName);
    formData.append("personalName", personalName);
    formData.append("location", location);
    formData.append("watering", watering);
    formData.append("light", light);
    formData.append("drainage", drainage);
    formData.append("notes", notes);
    formData.append("photo", photo);
    formData.append("date", new Date().toISOString());
    // El userId ahora se obtiene del token en el backend, ya no es necesario enviarlo.

    try {
      if (!user) {
        toast.error("Debes iniciar sesión para guardar una planta.");
        return;
      }
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const res = await fetch(`${apiUrl}/plants`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      if (res.ok) {
        toast.success("¡Planta guardada con éxito!");
        onCancel && onCancel();
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
        toast.error(`Error al guardar: ${errorData.error || 'Intenta de nuevo'}`);
      }
    } catch (error) {
      console.error('Connection error saving plant:', error);
      toast.error("Error de conexión al guardar la planta");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-screen overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-green-400/30 scrollbar-track-transparent">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">Guardar Planta</h2>
        <button type="button" onClick={onCancel} aria-label="Cerrar" className="text-gray-400 hover:text-red-500 text-2xl font-bold transition-all">&times;</button>
      </div>
      {/* Previsualización de imagen */}
      {photo && (
        <div className="flex justify-center mb-2">
          <Image
            src={typeof photo === "string" ? photo : URL.createObjectURL(photo)}
            alt="Foto de la planta"
            width={96}
            height={96}
            className="w-24 h-24 object-cover rounded-xl shadow-lg border border-green-200 dark:border-green-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur"
            style={{ objectFit: 'cover' }}
            priority
            sizes="96px"
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Nombre científico</label>
        <input
          value={sciName}
          readOnly
          className="w-full p-2 rounded-lg border border-green-200 dark:border-green-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono shadow-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Nombre común</label>
        <input
          value={commonName}
          readOnly
          className="w-full p-2 rounded-lg border border-green-200 dark:border-green-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono shadow-sm"
        />
      </div>
      <div>
        <label htmlFor="personalName" className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Nombre personal</label>
        <input
          id="personalName"
          value={personalName}
          onChange={e => setPersonalName(e.target.value)}
          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 shadow"
          placeholder="Ej: Mi cactus de la abuela"
          autoFocus
        />
      </div>
      <div>
        <label htmlFor="location" className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Ubicación</label>
        <input
          id="location"
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 shadow"
          placeholder="Ej: ventana sur, balcón..."
        />
      </div>
      <div>
        <label htmlFor="watering" className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Frecuencia de riego</label>
        <select
          id="watering"
          value={watering}
          onChange={e => setWatering(e.target.value)}
          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 shadow"
        >
          <option value="">Selecciona</option>
          <option value="diaria">Diaria</option>
          <option value="cada 2 días">Cada 2 días</option>
          <option value="semanal">Semanal</option>
          <option value="quincenal">Quincenal</option>
        </select>
      </div>
      <div>
        <label htmlFor="light" className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Luz</label>
        <select
          id="light"
          value={light}
          onChange={e => setLight(e.target.value)}
          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 shadow"
        >
          <option value="">Selecciona</option>
          <option value="directa">Directa</option>
          <option value="indirecta">Indirecta</option>
          <option value="sombra">Sombra</option>
        </select>
      </div>
      <div>
        <label htmlFor="drainage" className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">¿Maceta con drenaje?</label>
        <select
          id="drainage"
          value={drainage}
          onChange={e => setDrainage(e.target.value)}
          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 shadow"
        >
          <option value="">Selecciona</option>
          <option value="sí">Sí</option>
          <option value="no">No</option>
        </select>
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Notas personales (opcional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 min-h-[60px] bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 shadow"
        />
      </div>
      <div className="flex gap-2 mt-auto">
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex-1 flex items-center justify-center gap-2 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          Guardar Planta
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold flex-1 flex items-center justify-center gap-2 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          Cancelar
        </button>
      </div>
    </form>
  );
}