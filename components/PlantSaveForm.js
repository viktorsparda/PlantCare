import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // <--- Agrega esto

export default function PlantSaveForm({ sciName, commonName, photo, onSave, onCancel, open }) {
  const { user } = useAuth(); // <--- Agrega esto
  const [personalName, setPersonalName] = useState("");
  const [location, setLocation] = useState("");
  const [watering, setWatering] = useState("");
  const [light, setLight] = useState("");
  const [drainage, setDrainage] = useState("");
  const [notes, setNotes] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) setVisible(true);
    else setTimeout(() => setVisible(false), 300);
  }, [open]);

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
    if (user && user.uid) {
      formData.append("userId", user.uid); // <--- Agrega el UID aquí
    }

    await onSave(formData);
  }

  // No renderizar si no está visible (después de animación)
  if (!visible && !open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onCancel}
      />
      {/* Sidebar con animación real */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50
        transition-transform duration-500 ease-in-out
        ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ minWidth: 350 }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">Guardar Planta</h2>
            <button type="button" onClick={onCancel} className="text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Nombre científico</label>
            <input
              value={sciName}
              readOnly
              className="w-full p-2 rounded border bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Nombre común</label>
            <input
              value={commonName}
              readOnly
              className="w-full p-2 rounded border bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Nombre personal</label>
            <input
              value={personalName}
              onChange={e => setPersonalName(e.target.value)}
              className="w-full p-2 rounded border bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              placeholder="Ej: Mi cactus de la abuela"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Ubicación</label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full p-2 rounded border bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              placeholder="Ej: ventana sur, balcón..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Frecuencia de riego</label>
            <select
              value={watering}
              onChange={e => setWatering(e.target.value)}
              className="w-full p-2 rounded border bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            >
              <option value="">Selecciona</option>
              <option value="diaria">Diaria</option>
              <option value="cada 2 días">Cada 2 días</option>
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Luz</label>
            <select
              value={light}
              onChange={e => setLight(e.target.value)}
              className="w-full p-2 rounded border bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            >
              <option value="">Selecciona</option>
              <option value="directa">Directa</option>
              <option value="indirecta">Indirecta</option>
              <option value="sombra">Sombra</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">¿Maceta con drenaje?</label>
            <select
              value={drainage}
              onChange={e => setDrainage(e.target.value)}
              className="w-full p-2 rounded border bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            >
              <option value="">Selecciona</option>
              <option value="sí">Sí</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Notas personales (opcional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-2 rounded border min-h-[60px] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            />
          </div>
          <div className="flex gap-2 mt-auto">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold flex-1">
              Guardar Planta
            </button>
            <button type="button" onClick={onCancel} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded font-semibold flex-1">
              Cancelar
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}