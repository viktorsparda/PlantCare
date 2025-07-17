// components/PlantIdentifier.js
import { useRef, useState } from "react";
import Image from "next/image";
// import PlantSaveForm from "./PlantSaveForm";

export default function PlantIdentifier({ onOpenSaveForm }) {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Tooltip state
  const [showTooltip, setShowTooltip] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    identifyPlant(file);
  };

  const identifyPlant = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("images", file);
    formData.append("organs", "auto");

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_PLANTNET_API_KEY;
      const response = await fetch(
        `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        console.error(
          `Error HTTP ${response.status}: ${await response.text()}`
        );
        if (response.status === 400) {
          throw new Error(
            "El archivo de imagen es inválido o está dañado. Por favor, elige otro archivo."
          );
        }
        throw new Error(
          "No se pudo procesar la imagen. Asegúrate de que es una foto clara de una planta e inténtalo de nuevo."
        );
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        setError("No se encontraron resultados. Intenta con otra imagen.");
      } else {
        setResult(data.results || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Ocurrió un error al identificar la planta.");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="space-y-4 flex flex-col flex-grow relative overflow-visible">
      {/* Botón de ayuda con tooltip */}
      <div className="flex justify-end relative">
        <button
          type="button"
          aria-label="Ayuda para identificar plantas"
          className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 focus:outline-none relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          onClick={() => setShowTooltip((v) => !v)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
          </svg>
        </button>
        
        {/* Tooltip que aparece fuera del contenedor */}
        {showTooltip && (
          <div
            className="fixed z-[9999] w-80 max-w-sm rounded-2xl bg-gradient-to-br from-green-50/98 via-white/98 to-green-100/98 dark:from-gray-900/98 dark:via-gray-900/98 dark:to-gray-800/98 shadow-2xl border border-green-300 dark:border-green-800 px-5 py-4 text-sm text-gray-800 dark:text-gray-100 backdrop-blur-md"
            style={{ 
              pointerEvents: 'auto',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              marginTop: '40px'
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <div className="font-bold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
              </svg>
              ¡Consejos para identificación exitosa!
            </div>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><span className="font-semibold text-green-700 dark:text-green-200">Foto clara y frontal:</span> Enfoca las hojas o flores nítidamente.</li>
              <li><span className="font-semibold text-green-700 dark:text-green-200">Buena iluminación:</span> Evita sombras y fondos confusos.</li>
              <li><span className="font-semibold text-green-700 dark:text-green-200">Formatos aceptados:</span> JPG, PNG, WebP (máx. 5MB).</li>
              <li><span className="font-semibold text-green-700 dark:text-green-200">¡Entre más nítida la foto, mejor el resultado!</span></li>
            </ul>
            
            {/* Botón para cerrar */}
            <button 
              onClick={() => setShowTooltip(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div
        className={`rounded-2xl border-2 border-dashed flex flex-col flex-grow items-center justify-center p-4 min-h-[200px] cursor-pointer transition-all duration-200 shadow-inner ${
          dragActive
            ? "border-green-500 bg-green-50 dark:bg-green-900/30"
            : "border-green-300 bg-white/90 dark:border-gray-700 dark:bg-gray-900/40"
        }`}
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
        {!previewUrl ? (
          <div className="flex flex-col items-center justify-center text-center select-none">
            <svg
              className="w-16 h-16 text-green-500 mb-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span
              className="text-gray-800 dark:text-gray-200 font-semibold text-lg leading-relaxed px-2"
              style={{ letterSpacing: "0.02em" }}
            >
              Arrastra una foto aquí
              <br />o haz clic para subir
            </span>
          </div>
        ) : (
          <Image
            src={previewUrl}
            alt="Previsualización"
            width={160}
            height={160}
            className="rounded-xl shadow-lg object-cover max-h-[200px]"
          />
        )}
      </div>

      <div className="flex flex-col items-center justify-center min-h-[120px]">
        {loading && (
          <div className="flex flex-col items-center py-6 text-center">
            <svg
              className="animate-spin h-8 w-8 text-green-500 mb-2"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            <span className="text-green-600 dark:text-green-300 font-medium">
              Identificando...
            </span>
          </div>
        )}

        {error && (
          <div className="text-center bg-red-100 dark:bg-red-900/50 p-4 rounded-lg w-full">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              {error}
            </p>
          </div>
        )}

        {Array.isArray(result) && result.length > 0 && !loading && (
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-4 flex flex-col items-center w-full max-w-md mx-auto backdrop-blur-md">
            <Image
              src={result[0]?.images?.[0]?.url || previewUrl}
              alt="Planta identificada"
              width={100}
              height={100}
              className="rounded-lg shadow mb-2 object-cover"
            />
            <span className="text-lg font-bold text-green-700 dark:text-green-300">
              {result[0]?.species?.scientificNameWithoutAuthor ||
                "Planta desconocida"}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Confianza:{" "}
              {typeof result[0]?.score === "number"
                ? (result[0].score * 100).toFixed(1)
                : "?"}
              %
            </span>
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
        )}
      </div>
    </div>
  );
}
