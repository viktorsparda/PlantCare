// components/PlantIdentifier.js
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { FaUpload, FaCheckCircle, FaTimesCircle, FaLeaf, FaSave } from 'react-icons/fa';

export default function PlantIdentifier({ onOpenSaveForm, resetTrigger }) {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Tooltip state
  const [showTooltip, setShowTooltip] = useState(false);

  // Función para resetear el componente
  const resetComponent = () => {
    setImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setLoading(false);
  };

  // Resetear cuando se reciba el trigger
  useEffect(() => {
    if (resetTrigger) {
      resetComponent();
    }
  }, [resetTrigger]);

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

      <div
        className={`rounded-2xl border-2 border-dashed flex flex-col flex-grow items-center justify-center p-4 min-h-[200px] cursor-pointer transition-all duration-200 shadow-inner ${
          dragActive
            ? "border-green-500 bg-green-50 dark:bg-green-900/30"
            : "border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <div className="text-center">
          <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold text-green-600 dark:text-green-400">
              Arrastra y suelta
            </span>{" "}
            o haz clic para subir una imagen
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG, GIF hasta 10MB
          </p>
        </div>
      </div>

      {previewUrl && (
        <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-lg">
          <Image
            src={previewUrl}
            alt="Vista previa de la planta"
            layout="fill"
            objectFit="cover"
          />
        </div>
      )}

      {loading && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          Identificando...
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
          <FaTimesCircle />
          <span>{error}</span>
        </div>
      )}
      {result && result.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-green-800 dark:text-green-200 flex items-center gap-2">
            <FaCheckCircle /> Resultados de la Identificación
          </h3>
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg text-green-700 dark:text-green-300">
                  {result[0].species.scientificNameWithoutAuthor}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  (Nombre común:{" "}
                  {result[0].species.commonNames.join(", ") || "N/A"})
                </p>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Puntuación: {(result[0].score * 100).toFixed(2)}%
                </p>
              </div>
              <button
                onClick={() => onOpenSaveForm({
                  ...result[0],
                  photo: image
                })}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md"
                title="Guardar esta planta en tu colección"
              >
                <FaSave />
                Guardar
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">
              Otras posibles coincidencias:
            </h4>
            <ul className="space-y-1 text-sm">
              {result.slice(1, 4).map((r, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-md bg-gray-100 dark:bg-gray-800"
                >
                  <FaLeaf className="text-green-500" />
                  <div>
                    <span className="font-medium">
                      {r.species.scientificNameWithoutAuthor}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      ({(r.score * 100).toFixed(2)}%)
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
