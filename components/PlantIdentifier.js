// components/PlantIdentifier.js
import { useRef, useState } from "react";
import Image from "next/image";
// import PlantSaveForm from "./PlantSaveForm";

export default function PlantIdentifier({ onOpenSaveForm }) {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [showSaveForm, setShowSaveForm] = useState(false);
  // const [selectedPlant, setSelectedPlant] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    if (file) {
      identifyPlant(file);
    }
  };

  // Nueva función para identificar la planta automáticamente
  const identifyPlant = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("images", file);
    formData.append("organs", "auto");
    try {
      setLoading(true);
      setResult(null);
      const response = await fetch(
        `https://my-api.plantnet.org/v2/identify/all?api-key=2b10mNaQbuzL8nUYK8F3SBoVO`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      if (!data.results || data.results.length === 0) {
        alert("No se encontraron resultados. Intenta con otra imagen.");
      } else {
        setResult(data.results || []);
      }
    } catch (err) {
      alert(`Ocurrió un error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };



  // Guardar planta en la base de datos local
  // Ya no se maneja aquí el guardado ni el formulario, solo se delega la apertura al dashboard

  // Drag & drop logic
  const inputRef = useRef();
  const [dragActive, setDragActive] = useState(false);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange({ target: { files: [e.dataTransfer.files[0]] } });
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white/70 dark:bg-gray-900/80 shadow-2xl rounded-2xl p-6 mt-10 space-y-6 transition-all duration-300 backdrop-blur-md">
      <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 text-center mb-4">🌿 Identificador de Plantas</h2>

      {/* Zona Drag & Drop / Upload */}
      <div
        className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center min-h-[180px] cursor-pointer transition-all duration-200 shadow-md ${dragActive ? "border-green-500 bg-green-50 dark:bg-green-900/30" : "border-green-300 bg-white/90 dark:border-gray-700 dark:bg-gray-900/40"}`}
        tabIndex={0}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current && inputRef.current.click()}
        aria-label="Zona de soltar o subir imagen"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          aria-label="Subir imagen para identificar planta"
        />
        {!previewUrl && (
          <div className="flex flex-col items-center justify-center py-10 select-none">
            <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-gray-800 dark:text-gray-200 font-semibold text-lg text-center leading-relaxed px-2" style={{letterSpacing: '0.02em'}}>Arrastra una foto aquí<br/>o haz clic para subir</span>
          </div>
        )}
        {previewUrl && !loading && (
          <Image
            src={previewUrl}
            alt="Previsualización"
            width={120}
            height={120}
            className="rounded-xl shadow-lg mb-2 object-cover"
          />
        )}
        {loading && (
          <div className="flex flex-col items-center py-6">
            <svg className="animate-spin h-8 w-8 text-green-500 mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="text-green-600 dark:text-green-300 font-medium">Identificando...</span>
          </div>
        )}
      </div>

      {/* Resultados */}
      {Array.isArray(result) && result.length > 0 && !loading && (
        <div className="mt-6 flex flex-col items-center gap-4 w-full">
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-4 flex flex-col items-center w-full max-w-md mx-auto backdrop-blur-md">
            <Image
              src={result[0]?.images?.[0]?.url || previewUrl}
              alt="Planta identificada"
              width={100}
              height={100}
              className="rounded-lg shadow mb-2 object-cover"
            />
            <span className="text-lg font-bold text-green-700 dark:text-green-300">{result[0]?.species?.scientificNameWithoutAuthor || "Planta desconocida"}</span>
            <span className="text-sm text-gray-600 dark:text-gray-300">Confianza: {typeof result[0]?.score === "number" ? (result[0].score * 100).toFixed(1) : "?"}%</span>
            <button
              className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow transition"
              onClick={() => {
                onOpenSaveForm({
                  sciName: result[0]?.species?.scientificNameWithoutAuthor,
                  commonName: result[0]?.species?.commonNames?.[0] || "",
                  photo: image,
                });
              }}
            >
              Guardar en Mis Plantas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
