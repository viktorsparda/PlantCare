// Componente moderno de Tips para plantas
export default function Tips() {
  return (
    <section className="bg-gradient-to-br from-green-100/60 via-green-50/70 to-white/80 dark:from-gray-800/70 dark:via-gray-900/80 dark:to-gray-950/90 rounded-2xl shadow-xl p-8 my-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
        <span role="img" aria-label="tip">
          💡
        </span>{" "}
        Tips para tus plantas
      </h2>
      <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-200">
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
    </section>
  );
}
