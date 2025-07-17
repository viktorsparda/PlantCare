// Componente moderno de Tips para plantas
export default function Tips() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <span className="mr-2">💡</span>
        Tips de Cuidado
      </h3>
      <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-200 text-sm">
        <li>
          Riega tus plantas por la mañana para aprovechar mejor la humedad.
        </li>
        <li>
          Evita el exceso de agua: la mayoría de las plantas prefieren secarse
          entre riegos.
        </li>
        <li>
          Coloca las plantas cerca de una ventana para recibir luz natural
          indirecta.
        </li>
        <li>
          Limpia las hojas con un paño húmedo para mejorar la fotosíntesis.
        </li>
        <li>Revisa el drenaje de las macetas y usa sustrato adecuado.</li>
      </ul>
    </div>
  );
}
