// components/PlantIdentifier.js
import { useState } from "react";
import Image from "next/image";
import PlantSaveForm from "./PlantSaveForm";

export default function PlantIdentifier() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Por favor selecciona una imagen.");
      return;
    }

    const formData = new FormData();
    formData.append("images", image);
    formData.append("organs", "auto");

    try {
      setLoading(true);
      setResult(null);

      const response = await fetch(
        `https://my-api.plantnet.org/v2/identify/all?api-key=2b10mNaQbuzL8nUYK8F3SBoVO`, // 🔑 Reemplaza con tu clave real
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
      console.log("Respuesta de PlantNet:", data);

      if (!data.results || data.results.length === 0) {
        alert("No se encontraron resultados. Intenta con otra imagen.");
      } else {
        setResult(data.results || []);
      }

    } catch (err) {
      console.error("Error al identificar la planta:", err.message);
      alert(`Ocurrió un error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Guardar planta en la base de datos local
  async function handleSavePlant(formData) {
    const res = await fetch("http://localhost:3001/plants", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      alert("¡Planta guardada!");
      setShowSaveForm(false);
      setSelectedPlant(null);
    } else {
      alert("Error al guardar la planta");
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow rounded-xl p-6 mt-10 space-y-6 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 text-center transition-colors duration-300">
            🌿 Identificador de Plantas
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-700 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:border file:rounded-lg file:text-sm file:font-semibold file:bg-green-50 dark:file:bg-gray-900 file:text-green-700 dark:file:text-green-300 hover:file:bg-green-100 dark:hover:file:bg-gray-800 transition-colors"
            />

            {previewUrl && (
                <div>
                    <Image
                        src={previewUrl}
                        alt="Previsualización"
                        width={256}
                        height={256}
                        className="w-64 h-64 object-cover rounded-lg shadow"
                        style={{ objectFit: "cover" }}
                    />
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
                {loading ? "Identificando..." : "🔍 Identificar Planta"}
            </button>
        </form>

        {result && result.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2 transition-colors duration-300">
              🌱 Resultados:
            </h3>
            <ul className="space-y-3 transition-colors duration-300">
              {result.slice(0, 3).map((r, i) => (
                <li
                  key={i}
                  className="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3"
                >
                  <div>
                    <span className="font-semibold text-green-700 dark:text-green-300">
                      {r.species.commonNames?.[0] ? r.species.commonNames[0] + " " : ""}
                    </span>
                    <span className="italic">{r.species.scientificNameWithoutAuthor}</span>
                    {typeof r.score === "number" && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-300">
                        ({(r.score * 100).toFixed(1)}%)
                      </span>
                    )}
                  </div>
                  <button
                    className="mt-2 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded flex items-center justify-center"
                    title="Guardar esta planta"
                    onClick={() => {
                      setSelectedPlant({
                        sciName: r.species.scientificNameWithoutAuthor,
                        commonName: r.species.commonNames?.[0] || "",
                        photo: image,
                      });
                      setShowSaveForm(true);
                    }}
                  >
                    {/* Heroicon: Floppy Disk */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"> <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" /> </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showSaveForm && selectedPlant && (
          <div className="mt-4">
            <PlantSaveForm
              sciName={selectedPlant.sciName}
              commonName={selectedPlant.commonName}
              photo={selectedPlant.photo}
              onSave={handleSavePlant}
              onCancel={() => setShowSaveForm(false)}
              open={showSaveForm}
            />
          </div>
        )}
    </div>
  );
}
