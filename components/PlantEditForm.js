import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";

export default function PlantEditForm({ plant, onCancel, onPlantEdited }) {
  const auth = useAuth();
  const [personalName, setPersonalName] = useState(plant.personalName || "");
  const [location, setLocation] = useState(plant.location || "");
  const [watering, setWatering] = useState(plant.watering || "");
  const [light, setLight] = useState(plant.light || "");
  const [drainage, setDrainage] = useState(plant.drainage || "");
  const [notes, setNotes] = useState(plant.notes || "");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  // Previsualización de imagen y limpieza de memoria
  useEffect(() => {
    if (photo) {
      const url = URL.createObjectURL(photo);
      setPhotoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPhotoPreview(null);
    }
  }, [photo]);

  // Cerrar modal con Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onCancel && onCancel();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onCancel]);

  // Validación de campos obligatorios
  function validate() {
    const newErrors = {};
    if (!personalName.trim()) newErrors.personalName = "Este campo es obligatorio";
    if (!watering) newErrors.watering = "Selecciona una opción";
    if (!light) newErrors.light = "Selecciona una opción";
    if (!drainage) newErrors.drainage = "Selecciona una opción";
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!auth || !auth.user) {
      toast.error("Debes iniciar sesión para editar una planta.");
      return;
    }
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      toast.error("Completa los campos obligatorios.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("sciName", plant.sciName);
    formData.append("commonName", plant.commonName);
    formData.append("personalName", personalName);
    formData.append("location", location);
    formData.append("watering", watering);
    formData.append("light", light);
    formData.append("drainage", drainage);
    formData.append("notes", notes);
    formData.append("date", plant.date || new Date().toISOString());
    if (photo) formData.append("photo", photo);
    try {
      const token = await auth.user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/plants/${plant.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        toast.success("¡Planta actualizada!");
        onPlantEdited && onPlantEdited();
      } else {
        const errorData = await res.json().catch(() => ({ error: "Error desconocido" }));
        toast.error(`Error al editar: ${errorData.error || "Intenta de nuevo"}`);
      }
    } catch (err) {
      toast.error("Error de red al editar la planta.");
    } finally {
      setLoading(false);
    }
  }

  // Deshabilitar formulario mientras loading
  useEffect(() => {
    if (formRef.current) {
      Array.from(formRef.current.elements).forEach((el) => {
        if (el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA" || el.tagName === "BUTTON") {
          el.disabled = loading;
        }
      });
    }
  }, [loading]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/60 backdrop-blur-sm">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] w-full max-w-md overflow-y-auto p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-green-200 dark:border-green-700 relative" aria-live="polite">
        <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2 text-center">Editar Planta</h2>
        <button type="button" onClick={onCancel} aria-label="Cerrar" className="absolute top-3 right-3 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800 rounded-full p-1 transition-all focus:outline-none focus:ring-2 focus:ring-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image previews */}
        <div className="flex justify-center items-end gap-4 mb-2">
          {plant.photoPath && !photoPreview && (
            <div className="text-center">
              <Image src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/uploads/${plant.photoPath}`} alt="Foto actual" width={100} height={100} className="rounded-xl shadow-lg border border-green-200 dark:border-green-700 object-cover" />
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">Actual</span>
            </div>
          )}
          {photoPreview && (
            <div className="text-center">
              <Image src={photoPreview} alt="Nueva foto" width={100} height={100} className="rounded-xl shadow-lg border border-green-200 dark:border-green-700 object-cover" />
              <span className="text-xs text-green-600 dark:text-green-400 mt-1 block">Nueva</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="personalName" className="font-semibold">Nombre personal *</label>
          <input id="personalName" className={`input border border-green-300 dark:border-green-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow transition ${errors.personalName ? 'border-red-500' : ''}`} value={personalName} onChange={e => setPersonalName(e.target.value)} placeholder="Ej: Mi cactus de la abuela" aria-invalid={!!errors.personalName} aria-describedby={errors.personalName ? 'personalName-error' : undefined} autoFocus/>
          {errors.personalName && <span id="personalName-error" className="text-red-500 text-xs">{errors.personalName}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="location" className="font-semibold">Ubicación</label>
          <input id="location" className="input border border-green-300 dark:border-green-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow transition" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ej: ventana sur, balcón..." />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="watering" className="font-semibold">Frecuencia de riego *</label>
          <select id="watering" className={`input border border-green-300 dark:border-green-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow transition capitalize ${errors.watering ? 'border-red-500' : ''}`} value={watering} onChange={e => setWatering(e.target.value)} aria-invalid={!!errors.watering} aria-describedby={errors.watering ? 'watering-error' : undefined}>
            <option value="">Selecciona</option>
            <option value="diaria">Diaria</option>
            <option value="cada 2 días">Cada 2 Días</option>
            <option value="semanal">Semanal</option>
            <option value="quincenal">Quincenal</option>
          </select>
          {errors.watering && <span id="watering-error" className="text-red-500 text-xs">{errors.watering}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="light" className="font-semibold">Luz *</label>
          <select id="light" className={`input border border-green-300 dark:border-green-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow transition capitalize ${errors.light ? 'border-red-500' : ''}`} value={light} onChange={e => setLight(e.target.value)} aria-invalid={!!errors.light} aria-describedby={errors.light ? 'light-error' : undefined}>
            <option value="">Selecciona</option>
            <option value="directa">Directa</option>
            <option value="indirecta">Indirecta</option>
            <option value="sombra">Sombra</option>
          </select>
          {errors.light && <span id="light-error" className="text-red-500 text-xs">{errors.light}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="drainage" className="font-semibold">¿Maceta con drenaje? *</label>
          <select id="drainage" className={`input border border-green-300 dark:border-green-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow transition capitalize ${errors.drainage ? 'border-red-500' : ''}`} value={drainage} onChange={e => setDrainage(e.target.value)} aria-invalid={!!errors.drainage} aria-describedby={errors.drainage ? 'drainage-error' : undefined}>
            <option value="">Selecciona</option>
            <option value="sí">Sí</option>
            <option value="no">No</option>
          </select>
          {errors.drainage && <span id="drainage-error" className="text-red-500 text-xs">{errors.drainage}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="notes" className="font-semibold">Notas</label>
          <textarea id="notes" className="input border border-green-300 dark:border-green-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow transition min-h-[60px]" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas personales (opcional)" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="photo" className="font-semibold">Cambiar foto (opcional)</label>
          <input id="photo" type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} className="block w-full text-sm text-gray-700 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button type="button" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-green-700 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold transition" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button type="submit" className="px-4 py-2 rounded-lg border border-transparent bg-gradient-to-r from-green-500 to-green-600 text-white font-bold shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
          </button>
        </div>
      </form>
      </div>
  );
}
