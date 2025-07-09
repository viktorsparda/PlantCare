// Componente moderno de Galería de plantas
export default function Galeria() {
  return (
    <section className="bg-gradient-to-br from-yellow-100/60 via-yellow-50/70 to-white/80 dark:from-gray-800/70 dark:via-gray-900/80 dark:to-gray-950/90 rounded-2xl shadow-xl p-8 my-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center gap-2">
        <span role="img" aria-label="gallery">
          🖼️
        </span>{" "}
        Galería de plantas
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center text-4xl text-gray-400">
          🌱
        </div>
        <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center text-4xl text-gray-400">
          🌵
        </div>
        <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center text-4xl text-gray-400">
          🌻
        </div>
        <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center text-4xl text-gray-400">
          🪴
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">
        Pronto podrás ver y filtrar todas tus fotos y especies aquí.
      </p>
    </section>
  );
}
