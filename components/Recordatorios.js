// Componente moderno de Recordatorios para plantas
export default function Recordatorios() {
  return (
    <section className="bg-gradient-to-br from-blue-100/60 via-blue-50/70 to-white/80 dark:from-gray-800/70 dark:via-gray-900/80 dark:to-gray-950/90 rounded-2xl shadow-xl p-8 my-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
        <span role="img" aria-label="reminder">⏰</span> Recordatorios
      </h2>
      <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-200">
        <li>Programa riegos semanales según la especie de tu planta.</li>
        <li>Revisa la humedad del sustrato antes de regar.</li>
        <li>Abona tus plantas una vez al mes en primavera y verano.</li>
        <li>Recorta hojas secas para estimular el crecimiento.</li>
        <li>Activa notificaciones para no olvidar los cuidados.</li>
      </ul>
    </section>
  );
}
