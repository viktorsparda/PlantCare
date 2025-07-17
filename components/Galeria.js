// Componente moderno de Galería de plantas
export default function Galeria() {
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
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
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Pronto podrás ver y filtrar todas tus fotos y especies aquí.
      </p>
    </div>
  );
}
